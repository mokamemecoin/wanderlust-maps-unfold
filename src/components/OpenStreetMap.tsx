import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PostDetailSheet, { PostDetail } from "@/components/PostDetailSheet";
import LiveTravelerSheet, { LiveTraveler } from "@/components/LiveTravelerSheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, X, Radio } from "lucide-react";

// Fix for default markers in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
  iconSize: [12, 12],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

const OpenStreetMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });
  const [travelers, setTravelers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedTraveler, setSelectedTraveler] = useState<any | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PostDetail | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedTraveler || selectedTraveler.is_live) {
      setSelectedDetail(null);
      return;
    }
    const parts = String(selectedTraveler.location || '').split(',').map((p: string) => p.trim());
    const base: PostDetail = {
      id: selectedTraveler.id,
      title: selectedTraveler.name,
      place: parts[0] || selectedTraveler.location,
      country: parts.length > 1 ? parts[parts.length - 1] : undefined,
      photos: selectedTraveler.photo_url ? [selectedTraveler.photo_url] : [],
      latitude: Number(selectedTraveler.latitude),
      longitude: Number(selectedTraveler.longitude),
    };
    setSelectedDetail(base);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${base.latitude}&lon=${base.longitude}&accept-language=it`
        );
        const data = await res.json();
        if (cancelled || !data?.address) return;
        const a = data.address;
        setSelectedDetail({
          ...base,
          place: a.city || a.town || a.village || a.municipality || a.county || base.place,
          country: a.country || base.country,
        });
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedTraveler]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center: [45.07, 12.68], // Coordinate centrate sull'Italia
      zoom: 5,
      zoomControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map.current);

    // Add zoom control in top-right position
    L.control.zoom({
      position: 'topright'
    }).addTo(map.current);

    // Load travelers from database
    loadTravelers();

    // Initial load will be handled by loadTravelers

    // Add custom CSS for pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      .traveler-marker div {
        animation: pulse 2s infinite;
      }
      .live-traveler-marker img {
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        object-fit: cover;
        border: 3px solid hsl(var(--primary));
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        background: hsl(var(--muted));
      }
      .live-traveler-marker .live-dot {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 12px;
        height: 12px;
        border-radius: 9999px;
        background: #ef4444;
        border: 2px solid white;
        animation: pulse 1.6s infinite;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  const loadTravelers = async () => {
    try {
      const { data, error } = await supabase
        .from('travelers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTravelers(data || []);

      const userIds = Array.from(
        new Set((data || []).map((t: any) => t.user_id).filter(Boolean))
      );
      if (userIds.length > 0) {
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', userIds as string[]);
        const map: Record<string, any> = {};
        (profileRows || []).forEach((p: any) => {
          map[p.user_id] = p;
        });
        setProfiles(map);
      }
    } catch (error) {
      console.error('Error loading travelers:', error);
    }
  };

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers first
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current!.removeLayer(layer);
      }
    });

    const visible = showLiveOnly ? travelers.filter((t) => t.is_live) : travelers;

    visible.forEach((traveler) => {
      const profile = traveler.user_id ? profiles[traveler.user_id] : null;
      const avatar = profile?.avatar_url;
      const isLive = !!traveler.is_live;

      const customIcon = isLive
        ? L.divIcon({
            html: `<div style="position:relative;width:40px;height:40px;">
                <img src="${avatar || '/placeholder.svg'}" alt="${traveler.name}" />
                <span class="live-dot"></span>
              </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'live-traveler-marker',
          })
        : L.divIcon({
            html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
            iconSize: [14, 14],
            className: 'traveler-marker',
          });

      L.marker([traveler.latitude, traveler.longitude], { icon: customIcon })
        .on('click', () => setSelectedTraveler(traveler))
        .addTo(map.current!);
    });
  }, [travelers, profiles, showLiveOnly]);

  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      throw new Error('Location not found');
    } catch (error) {
      throw new Error('Failed to geocode location');
    }
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const local = travelers.find((t) =>
        `${t.name} ${t.location}`.toLowerCase().includes(q.toLowerCase())
      );
      if (local && map.current) {
        map.current.flyTo([Number(local.latitude), Number(local.longitude)], 10);
        setSelectedTraveler(local);
        return;
      }
      const coords = await geocodeLocation(q);
      map.current?.flyTo([coords.latitude, coords.longitude], 10);
    } catch {
      toast({
        title: "Nessun risultato",
        description: `Non ho trovato "${q}" sulla mappa.`,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddTraveler = async () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti",
        variant: "destructive",
      });
      return;
    }

    try {
      // Geocode the location
      const coordinates = await geocodeLocation(formData.location);

      // Add to database
      const { error } = await supabase
        .from('travelers')
        .insert([
          {
            name: formData.name,
            location: formData.location,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Posizione aggiunta con successo!",
      });

      // Reset form and close dialog
      setFormData({ name: '', location: '' });
      setShowAddDialog(false);

      // Reload travelers to update map
      loadTravelers();

    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la posizione. Verifica che la località sia corretta.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Full-screen map */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Floating search overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="relative">
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Avvia ricerca"
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Search className="w-5 h-5" />
          </button>
          <Input
            type="text"
            placeholder="Cerca luoghi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            disabled={searching}
            className="w-full h-12 pl-10 pr-10 bg-card text-foreground placeholder:text-muted-foreground border border-border rounded-full shadow-lg"
            aria-label="Cerca luoghi"
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

        {/* Filtro Viaggiatori Live */}
        <div className="mt-2 flex items-center gap-2 w-fit rounded-full bg-card/95 backdrop-blur border border-border shadow-lg px-3 py-2">
          <Radio className={`w-4 h-4 ${showLiveOnly ? 'text-primary' : 'text-muted-foreground'}`} />
          <Label htmlFor="live-travelers" className="text-sm cursor-pointer">
            Viaggiatori Live
          </Label>
          <Switch
            id="live-travelers"
            checked={showLiveOnly}
            onCheckedChange={setShowLiveOnly}
            aria-label="Mostra solo viaggiatori live"
          />
          {showLiveOnly && (
            <span className="text-xs text-muted-foreground">
              {travelers.filter((t) => t.is_live).length}
            </span>
          )}
        </div>
      </div>

      {/* Bottom sheet con i dettagli del post/luogo */}
      <PostDetailSheet
        post={selectedDetail}
        open={!!selectedTraveler && !selectedTraveler.is_live}
        onOpenChange={(open) => !open && setSelectedTraveler(null)}
        onCenterMap={(p) => {
          if (map.current && p.latitude != null && p.longitude != null) {
            map.current.flyTo([p.latitude, p.longitude], 10);
          }
          setSelectedTraveler(null);
        }}
      />

      {/* Bottom sheet viaggiatore live */}
      <LiveTravelerSheet
        open={!!selectedTraveler?.is_live}
        onOpenChange={(open) => !open && setSelectedTraveler(null)}
        traveler={
          selectedTraveler?.is_live
            ? ({
                id: selectedTraveler.id,
                user_id: selectedTraveler.user_id,
                name: selectedTraveler.name,
                location: selectedTraveler.location,
                status_text: selectedTraveler.status_text,
                last_active: selectedTraveler.last_active,
                avatar_url: selectedTraveler.user_id
                  ? profiles[selectedTraveler.user_id]?.avatar_url
                  : null,
              } as LiveTraveler)
            : null
        }
      />
    </div>
  );
};

export default OpenStreetMap;