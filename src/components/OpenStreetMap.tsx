import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PostDetailSheet, { PostDetail } from "@/components/PostDetailSheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, X, MapPin } from "lucide-react";

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
  const [selectedTraveler, setSelectedTraveler] = useState<any | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PostDetail | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedTraveler) {
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
      updateMapMarkers(data || []);
    } catch (error) {
      console.error('Error loading travelers:', error);
    }
  };

  const updateMapMarkers = (travelersData: any[]) => {
    if (!map.current) return;

    // Clear existing markers first
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current!.removeLayer(layer);
      }
    });

    // Add new markers
    travelersData.forEach((traveler) => {
      const customIcon = L.divIcon({
        html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
        iconSize: [14, 14],
        className: 'traveler-marker'
      });

      L.marker([traveler.latitude, traveler.longitude], { icon: customIcon })
        .on('click', () => setSelectedTraveler(traveler))
        .addTo(map.current!);
    });
  };

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cerca luoghi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      </div>

      {/* Bottom sheet con i dettagli del post/luogo */}
      <PostDetailSheet
        post={selectedDetail}
        open={!!selectedTraveler}
        onOpenChange={(open) => !open && setSelectedTraveler(null)}
        onCenterMap={(p) => {
          if (map.current && p.latitude != null && p.longitude != null) {
            map.current.flyTo([p.latitude, p.longitude], 10);
          }
          setSelectedTraveler(null);
        }}
      />
    </div>
  );
};

export default OpenStreetMap;