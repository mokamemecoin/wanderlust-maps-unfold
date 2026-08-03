import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2, Plus, AlertTriangle, PartyPopper, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AlertDetailSheet, {
  AlertItem,
  categoryMeta,
} from '@/components/AlertDetailSheet';
import NearbyUserSheet, { NearbyUserInfo } from '@/components/NearbyUserSheet';

const MARKER_STYLE = `
  @keyframes alert-pulse { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.75} 100%{transform:scale(1);opacity:1} }
  .alert-marker .alert-bubble {
    width: 34px; height: 34px; border-radius: 9999px; display:flex; align-items:center; justify-content:center;
    color: #fff; font-size: 16px; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,.35);
    animation: alert-pulse 2.4s infinite;
  }
  .alert-marker .alert-timer {
    position:absolute; left:50%; transform:translateX(-50%); bottom:-13px; white-space:nowrap;
    font-size:10px; line-height:1; font-weight:600; color:#fff; background:rgba(0,0,0,.72);
    border-radius:9999px; padding:3px 6px;
  }
  .nearby-marker .nearby-bubble {
    width: 40px; height: 40px; border-radius: 9999px; overflow: hidden;
    border: 3px solid #22c55e; box-shadow: 0 2px 8px rgba(0,0,0,.35); background: #e5e7eb;
  }
  .nearby-marker .nearby-bubble img { width: 100%; height: 100%; object-fit: cover; display:block; }
  .nearby-marker .nearby-initials {
    width:100%; height:100%; display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; color:#374151;
  }
`;

const EMOJI: Record<string, string> = {
  danger: '⚠',
  event: '🎉',
};

type FilterKey = 'danger' | 'event' | 'nearby';

interface NearbyUser {
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  avatar_url?: string | null;
}

const AlertsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<FilterKey | null>(null);
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<NearbyUser | null>(null);
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState<AlertItem | null>(null);
  const [tick, setTick] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadAlerts = useCallback(async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading alerts:', error);
      return;
    }
    setAlerts(
      (data || []).map((a: any) => ({
        ...a,
        latitude: Number(a.latitude),
        longitude: Number(a.longitude),
      }))
    );
  }, []);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const m = L.map(mapContainer.current, { center: [42.5, 12.5], zoom: 5, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(m);
    L.control.zoom({ position: 'topright' }).addTo(m);
    markersLayer.current = L.layerGroup().addTo(m);
    map.current = m;

    const style = document.createElement('style');
    style.textContent = MARKER_STYLE;
    document.head.appendChild(style);

    loadAlerts();

    return () => {
      m.remove();
      map.current = null;
      markersLayer.current = null;
      style.remove();
    };
  }, [loadAlerts]);

  // Countdown refresh + periodic reload (auto-hide expired)
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      loadAlerts();
    }, 60000);
    return () => clearInterval(id);
  }, [loadAlerts]);

  // New alert published elsewhere
  useEffect(() => {
    const handler = async (e: Event) => {
      await loadAlerts();
      const detail = (e as CustomEvent).detail;
      if (map.current && detail?.latitude != null) {
        map.current.flyTo([detail.latitude, detail.longitude], 11);
      }
    };
    window.addEventListener('alerts-updated', handler as EventListener);
    return () => window.removeEventListener('alerts-updated', handler as EventListener);
  }, [loadAlerts]);

  // Render markers
  useEffect(() => {
    const layer = markersLayer.current;
    if (!layer) return;
    layer.clearLayers();

    const visible =
      filter === 'nearby'
        ? []
        : alerts.filter(
            (a) =>
              new Date(a.expires_at).getTime() > Date.now() && (!filter || a.category === filter)
          );

    visible.forEach((alert) => {
      const meta = categoryMeta(alert.category);
      const icon = L.divIcon({
        html: `<div style="position:relative;width:34px;height:34px;">
            <div class="alert-bubble" style="background:${meta.color}">${EMOJI[alert.category] || '⚠'}</div>
          </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        className: 'alert-marker',
      });
      L.marker([alert.latitude, alert.longitude], { icon })
        .on('click', () => setSelected(alert))
        .addTo(layer);
    });

    if (filter === 'nearby') {
      nearby.forEach((n) => {
        const inner = n.avatar_url
          ? `<img src="${n.avatar_url}" alt="${n.name}" />`
          : `<div class="nearby-initials">${(n.name || '?').charAt(0).toUpperCase()}</div>`;
        const icon = L.divIcon({
          html: `<div class="nearby-bubble">${inner}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: 'nearby-marker',
        });
        L.marker([n.latitude, n.longitude], { icon })
          .on('click', () => setSelectedPerson(n))
          .addTo(layer);
      });
    }
  }, [alerts, filter, nearby, tick]);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    const { data, error } = await supabase
      .from('travelers')
      .select('user_id, name, latitude, longitude')
      .not('user_id', 'is', null);
    if (error) {
      console.error('Error loading nearby users:', error);
      return;
    }
    const rows = (data || [])
      .map((t: any) => ({
        user_id: t.user_id as string,
        name: t.name as string,
        latitude: Number(t.latitude),
        longitude: Number(t.longitude),
      }))
      // entro ~100 km dalla posizione dell'utente
      .filter(
        (t) =>
          Math.abs(t.latitude - lat) < 1 && Math.abs(t.longitude - lng) < 1.4
      );

    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    let avatars: Record<string, string | null> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, avatar_url, first_name, last_name')
        .in('user_id', ids);
      (profs || []).forEach((p: any) => {
        avatars[p.user_id] = p.avatar_url;
      });
    }
    setNearby(rows.map((r) => ({ ...r, avatar_url: avatars[r.user_id] ?? null })));
  }, []);

  const enableNearby = () => {
    if (!('geolocation' in navigator)) {
      toast({ description: 'GPS non disponibile su questo dispositivo.', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        map.current?.flyTo([latitude, longitude], 11);
        await loadNearby(latitude, longitude);
        setFilter('nearby');
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({
          title: 'Posizione non attiva',
          description: 'Attiva il GPS per vedere le persone vicino a te.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const local = alerts.find((a) =>
        `${a.title} ${a.location ?? ''}`.toLowerCase().includes(q.toLowerCase())
      );
      if (local && map.current) {
        map.current.flyTo([local.latitude, local.longitude], 12);
        setSelected(local);
        return;
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=it&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (!data?.length) throw new Error('not found');
      map.current?.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 11);
    } catch {
      toast({
        title: 'Nessun risultato',
        description: `Non ho trovato "${q}" sulla mappa.`,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (alert: AlertItem) => {
    const { error } = await supabase.from('alerts').delete().eq('id', alert.id);
    if (error) {
      toast({ description: 'Impossibile eliminare la segnalazione.', variant: 'destructive' });
      return;
    }
    toast({ description: 'Segnalazione eliminata.' });
    setSelected(null);
    loadAlerts();
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      <div className="absolute top-0 left-0 right-0 z-[1000] p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="relative">
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Avvia ricerca"
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground"
          >
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
          <Input
            type="text"
            placeholder="Cerca luoghi o segnalazioni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full h-12 pl-10 pr-10 bg-card text-foreground placeholder:text-muted-foreground border border-border rounded-full shadow-lg"
            aria-label="Cerca luoghi o segnalazioni"
          />
          {searchQuery && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              aria-label="Cancella ricerca"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filtri categoria */}
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
          <Badge
            onClick={() => setFilter(null)}
            variant={filter === null ? 'default' : 'secondary'}
            className="cursor-pointer shrink-0 shadow"
          >
            Tutti ({alerts.length})
          </Badge>
          <Badge
            onClick={() => setFilter(filter === 'danger' ? null : 'danger')}
            variant={filter === 'danger' ? 'default' : 'secondary'}
            className="cursor-pointer shrink-0 shadow gap-1"
          >
            <AlertTriangle className="w-3 h-3" /> Pericolo
          </Badge>
          <Badge
            onClick={() => setFilter(filter === 'event' ? null : 'event')}
            variant={filter === 'event' ? 'default' : 'secondary'}
            className="cursor-pointer shrink-0 shadow gap-1"
          >
            <PartyPopper className="w-3 h-3" /> Eventi
          </Badge>
          <Badge
            onClick={() => (filter === 'nearby' ? setFilter(null) : enableNearby())}
            variant={filter === 'nearby' ? 'default' : 'secondary'}
            className="cursor-pointer shrink-0 shadow gap-1"
          >
            {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
            Vicino a me
          </Badge>
        </div>
      </div>

      {/* Nuova segnalazione */}
      <Button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent('open-new-post', { detail: { mode: 'alert' } }))
        }
        className="absolute right-3 bottom-4 z-[1000] rounded-full shadow-lg h-11"
      >
        <Plus className="w-4 h-4 mr-1" />
        Segnala
      </Button>

      <AlertDetailSheet
        alert={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        canDelete={!!user && selected?.user_id === user.id}
        onDelete={handleDelete}
      />

      <NearbyUserSheet
        person={selectedPerson as NearbyUserInfo | null}
        open={!!selectedPerson}
        onOpenChange={(open) => !open && setSelectedPerson(null)}
      />
    </div>
  );
};

export default AlertsMap;
