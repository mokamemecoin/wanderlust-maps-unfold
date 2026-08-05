import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Loader2, Coffee, MapPin } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import NearbyUserSheet, { NearbyUserInfo } from '@/components/NearbyUserSheet';

const MARKER_STYLE = `
  .coffee-marker .coffee-bubble {
    width: 44px; height: 44px; border-radius: 9999px; overflow: hidden;
    border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,.35); background: #e5e7eb;
  }
  .coffee-marker .coffee-bubble img { width:100%; height:100%; object-fit:cover; display:block; }
  .coffee-marker .coffee-initials {
    width:100%; height:100%; display:flex; align-items:center; justify-content:center;
    font-size:15px; font-weight:700; color:#374151;
  }
`;

const CACHE_KEY = 'miomondo_country_cache_v1';

const readCache = (): Record<string, string | null> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const ALIASES: Record<string, string> = {
  'united states of america': 'united states',
  usa: 'united states',
  czechia: 'czech republic',
  'republic of serbia': 'serbia',
  'united republic of tanzania': 'tanzania',
  'the netherlands': 'netherlands',
};

const normalize = (v: string) => {
  const k = v.trim().toLowerCase();
  return ALIASES[k] || k;
};

const geocodeCountry = async (location: string): Promise<string | null> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&accept-language=en&limit=1&q=${encodeURIComponent(location)}`
  );
  const data = await res.json();
  return data?.[0]?.address?.country ?? null;
};

interface FriendInfo {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

interface NearbyUser extends FriendInfo {
  latitude: number;
  longitude: number;
}

// 3 livelli progressivi di colore in base al numero di amici
const levelColor = (count: number) =>
  count >= 5 ? '#7c2d12' : count >= 3 ? '#c2410c' : '#fb923c';

const FriendsWorldMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const geoLayer = useRef<L.GeoJSON | null>(null);
  const peopleLayer = useRef<L.LayerGroup | null>(null);

  const [byCountry, setByCountry] = useState<Record<string, FriendInfo[]>>({});
  const [country, setCountry] = useState<{ name: string; friends: FriendInfo[] } | null>(null);
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<NearbyUser | null>(null);
  const [locating, setLocating] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissionUnsupported, setPermissionUnsupported] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Init mappa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const m = L.map(mapContainer.current, {
      center: [25, 10],
      zoom: 2,
      zoomControl: false,
      worldCopyJump: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 12,
    }).addTo(m);
    L.control.zoom({ position: 'topright' }).addTo(m);
    peopleLayer.current = L.layerGroup().addTo(m);
    map.current = m;

    const style = document.createElement('style');
    style.textContent = MARKER_STYLE;
    document.head.appendChild(style);

    return () => {
      m.remove();
      map.current = null;
      geoLayer.current = null;
      peopleLayer.current = null;
      style.remove();
    };
  }, []);

  // Carica i paesi visitati dagli amici
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      const ids = (follows || []).map((f: any) => f.following_id as string);
      if (!ids.length) return;

      const [{ data: profs }, { data: posts }] = await Promise.all([
        supabase.from('profiles').select('user_id, first_name, last_name, avatar_url').in('user_id', ids),
        supabase.from('posts').select('user_id, location').in('user_id', ids).not('location', 'is', null),
      ]);

      const friendById: Record<string, FriendInfo> = {};
      (profs || []).forEach((p: any) => {
        friendById[p.user_id] = {
          user_id: p.user_id,
          name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Viaggiatore',
          avatar_url: p.avatar_url ?? null,
        };
      });

      const cache = readCache();
      const result: Record<string, FriendInfo[]> = {};
      for (const row of (posts || []) as any[]) {
        const loc = (row.location || '').trim();
        if (!loc) continue;
        if (cache[loc] === undefined) {
          try {
            cache[loc] = await geocodeCountry(loc);
          } catch {
            cache[loc] = null;
          }
        }
        const c = cache[loc];
        const friend = friendById[row.user_id];
        if (!c || !friend) continue;
        const key = normalize(c);
        result[key] = result[key] || [];
        if (!result[key].some((f) => f.user_id === friend.user_id)) result[key].push(friend);
      }
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {
        /* ignore */
      }
      if (!cancelled) setByCountry(result);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Colora i paesi
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    let cancelled = false;
    const paint = async () => {
      try {
        const res = await fetch('/data/countries.geo.json');
        const geojson = await res.json();
        if (cancelled || !map.current) return;
        geoLayer.current?.remove();
        geoLayer.current = L.geoJSON(geojson, {
          filter: (f: any) => (byCountry[normalize(f.properties?.name || '')] || []).length > 0,
          style: (f: any) => {
            const friends = byCountry[normalize(f?.properties?.name || '')] || [];
            return {
              color: '#ffffff',
              weight: 1,
              fillColor: levelColor(friends.length),
              fillOpacity: 0.75,
            };
          },
          onEachFeature: (f: any, layer) => {
            const name = f.properties?.name || '';
            const friends = byCountry[normalize(name)] || [];
            layer.bindTooltip(`${name} · ${friends.length} amici`);
            layer.on('click', () => setCountry({ name, friends }));
          },
        }).addTo(map.current);
      } catch {
        /* i confini sono solo un miglioramento visivo */
      }
    };
    paint();
    return () => {
      cancelled = true;
    };
  }, [byCountry]);

  // Marker persone vicine
  useEffect(() => {
    const layer = peopleLayer.current;
    if (!layer) return;
    layer.clearLayers();
    nearby.forEach((n) => {
      const inner = n.avatar_url
        ? `<img src="${n.avatar_url}" alt="${n.name}" />`
        : `<div class="coffee-initials">${(n.name || '?').charAt(0).toUpperCase()}</div>`;
      const icon = L.divIcon({
        html: `<div class="coffee-bubble">${inner}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        className: 'coffee-marker',
      });
      L.marker([n.latitude, n.longitude], { icon })
        .on('click', () => setSelectedPerson(n))
        .addTo(layer);
    });
  }, [nearby]);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    const { data } = await supabase
      .from('travelers')
      .select('user_id, name, latitude, longitude')
      .not('user_id', 'is', null);
    const rows = (data || [])
      .map((t: any) => ({
        user_id: t.user_id as string,
        name: t.name as string,
        latitude: Number(t.latitude),
        longitude: Number(t.longitude),
      }))
      // raggio breve: ~10 km
      .filter(
        (t) =>
          t.user_id !== user?.id &&
          Math.abs(t.latitude - lat) < 0.1 &&
          Math.abs(t.longitude - lng) < 0.14
      );

    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    const avatars: Record<string, string | null> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, avatar_url')
        .in('user_id', ids);
      (profs || []).forEach((p: any) => {
        avatars[p.user_id] = p.avatar_url ?? null;
      });
    }
    const people = rows.map((r) => ({ ...r, avatar_url: avatars[r.user_id] ?? null }));
    setNearby(people);
    if (!people.length) {
      toast({ description: 'Nessuno nelle immediate vicinanze in questo momento.' });
    }
  }, [toast, user]);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setPermissionUnsupported(true);
      setPermissionOpen(true);
      return;
    }
    setPermissionUnsupported(false);
    setPermissionDenied(false);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocating(false);
        setPermissionOpen(false);
        map.current?.flyTo([latitude, longitude], 13);
        await loadNearby(latitude, longitude);
      },
      () => {
        setLocating(false);
        setPermissionDenied(true);
        setPermissionOpen(true);
        // L'iframe di preview può bloccare il GPS: fallback automatico alla simulazione
        window.setTimeout(() => enableSimulation(), 1000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCoffee = () => {
    requestLocation();
  };

  const enableSimulation = () => {
    setPermissionOpen(false);
    setPermissionDenied(false);
    setPermissionUnsupported(false);
    setLocating(false);
    const centerLat = 41.9028;
    const centerLng = 12.4964;
    setCoords({ lat: centerLat, lng: centerLng });
    map.current?.flyTo([centerLat, centerLng], 13);
    const demo: NearbyUser[] = [
      { user_id: 'demo-1', name: 'Luca', avatar_url: null, latitude: centerLat + 0.002, longitude: centerLng + 0.003 },
      { user_id: 'demo-2', name: 'Sofia', avatar_url: null, latitude: centerLat - 0.002, longitude: centerLng - 0.001 },
      { user_id: 'demo-3', name: 'Marco', avatar_url: null, latitude: centerLat + 0.001, longitude: centerLng - 0.003 },
    ].filter((d) => d.user_id !== user?.id);
    setNearby(demo);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      <div className="absolute bottom-6 left-0 right-0 z-[1000] flex justify-center px-4">
        <Button
          size="lg"
          onClick={handleCoffee}
          disabled={locating}
          className="rounded-full px-7 h-14 text-base font-semibold shadow-2xl"
        >
          {locating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Coffee className="w-5 h-5 mr-2" />
          )}
          Caffè?
        </Button>
      </div>

      <Drawer open={!!country} onOpenChange={(o) => !o && setCountry(null)}>
        <DrawerContent className="z-[2000]">
          <div className="p-4 pb-8 space-y-3">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle>{country?.name}</DrawerTitle>
              <DrawerDescription>
                {country?.friends.length} amici sono stati qui
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-2">
              {country?.friends.map((f) => (
                <div key={f.user_id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={f.avatar_url ?? undefined} alt={f.name} />
                    <AvatarFallback>{f.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <NearbyUserSheet
        person={selectedPerson as NearbyUserInfo | null}
        open={!!selectedPerson}
        onOpenChange={(open) => !open && setSelectedPerson(null)}
      />

      <Dialog open={permissionOpen} onOpenChange={setPermissionOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>Prendiamo un caffè?</DialogTitle>
            <DialogDescription>
              {permissionUnsupported
                ? 'Il tuo browser non supporta la geolocalizzazione. Attiva il GPS dal dispositivo per usare questa funzione.'
                : permissionDenied
                  ? 'Sembra che i permessi GPS siano disattivati sul tuo browser. Abilitalo nelle impostazioni del dispositivo oppure usa la modalità simulazione.'
                  : 'Attiva la posizione per scoprire chi si trova nelle tue vicinanze e fare due chiacchiere.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {!permissionUnsupported && (
              <Button className="w-full rounded-full" onClick={requestLocation} disabled={locating}>
                {locating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rilevamento in corso...
                  </>
                ) : (
                  'Attiva Posizione'
                )}
              </Button>
            )}
            <Button variant="outline" className="w-full rounded-full" onClick={() => setPermissionOpen(false)}>
              {permissionUnsupported ? 'Chiudi' : 'Annulla'}
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={enableSimulation}>
              Prova modalità simulazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendsWorldMap;
