import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AlertDetailSheet, {
  AlertItem,
  ALERT_CATEGORIES,
  categoryMeta,
  formatRemaining,
} from '@/components/AlertDetailSheet';

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
`;

const EMOJI: Record<string, string> = {
  danger: '⚠',
  service: '🛠',
  traffic: '🚗',
  weather: '🌧',
  other: 'ℹ',
};

const AlertsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
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

    const visible = alerts.filter(
      (a) =>
        new Date(a.expires_at).getTime() > Date.now() && (!category || a.category === category)
    );

    visible.forEach((alert) => {
      const meta = categoryMeta(alert.category);
      const icon = L.divIcon({
        html: `<div style="position:relative;width:34px;height:34px;">
            <div class="alert-bubble" style="background:${meta.color}">${EMOJI[alert.category] || 'ℹ'}</div>
            <span class="alert-timer">${formatRemaining(alert.expires_at) ?? '0m'}</span>
          </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        className: 'alert-marker',
      });
      L.marker([alert.latitude, alert.longitude], { icon })
        .on('click', () => setSelected(alert))
        .addTo(layer);
    });
  }, [alerts, category, tick]);

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
            onClick={() => setCategory(null)}
            variant={category === null ? 'default' : 'secondary'}
            className="cursor-pointer shrink-0 shadow"
          >
            Tutti ({alerts.length})
          </Badge>
          {ALERT_CATEGORIES.map((c) => (
            <Badge
              key={c.value}
              onClick={() => setCategory(category === c.value ? null : c.value)}
              variant={category === c.value ? 'default' : 'secondary'}
              className="cursor-pointer shrink-0 shadow"
            >
              {c.label}
            </Badge>
          ))}
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
    </div>
  );
};

export default AlertsMap;
