import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, X, Plus } from "lucide-react";

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
  const { toast } = useToast();

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
        .bindPopup(`<div style="font-family: system-ui; font-weight: 500; font-size: 13px; color: #1f2937; padding: 2px;">${traveler.name} a ${traveler.location}</div>`)
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
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-primary text-white p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-white/30 rounded"></div>
            <div className="w-6 h-1 bg-white/30 rounded"></div>
            <div className="w-6 h-1 bg-white/30 rounded"></div>
          </div>
        </div>
        
        <h1 className="text-xl font-medium mb-4">Viaggiatori in Viaggio</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cerca luoghi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 bg-white/90 backdrop-blur-sm border-0 rounded-full"
          />
          {searchQuery && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/20"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 pt-32">
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      </div>

    </div>
  );
};

export default OpenStreetMap;