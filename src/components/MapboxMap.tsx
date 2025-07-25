import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Plus } from "lucide-react";

const MapboxMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe',
        zoom: 2,
        center: [0, 20],
        pitch: 0,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
        });

        // Add some sample traveler markers
        const travelers = [
          { lng: 2.3522, lat: 48.8566, name: 'Marco a Parigi' },
          { lng: 139.6917, lat: 35.6895, name: 'Sofia a Tokyo' },
          { lng: -74.006, lat: 40.7128, name: 'Luca a New York' },
          { lng: 151.2093, lat: -33.8688, name: 'Anna a Sydney' },
          { lng: -0.1276, lat: 51.5074, name: 'Giulia a Londra' },
        ];

        travelers.forEach((traveler) => {
          const marker = new mapboxgl.Marker({
            color: '#10b981',
            scale: 0.8
          })
            .setLngLat([traveler.lng, traveler.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<p class="font-medium text-sm">${traveler.name}</p>`)
            )
            .addTo(map.current!);
        });
      });

      // Cleanup
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Errore nell\'inizializzazione della mappa:', error);
    }
  }, [mapboxToken]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/30 rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Configura Mapbox</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Inserisci il tuo token pubblico Mapbox per visualizzare la mappa interattiva
          </p>
          <p className="text-xs text-muted-foreground">
            Ottieni il token su{' '}
            <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              mapbox.com
            </a>
          </p>
        </div>
        <div className="w-full max-w-md space-y-4">
          <Input
            type="password"
            placeholder="pk.eyJ1IjoiY..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="w-full"
          />
          <Button onClick={handleTokenSubmit} className="w-full" disabled={!mapboxToken.trim()}>
            Configura Mappa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-primary text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-white/30 rounded"></div>
            <div className="w-6 h-1 bg-white/30 rounded"></div>
            <div className="w-6 h-1 bg-white/30 rounded"></div>
          </div>
          <Button size="sm" className="bg-white text-primary hover:bg-white/90 rounded-full px-4">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        
        <h1 className="text-xl font-medium mb-4">Your map. Your story. ...</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Simome"
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

export default MapboxMap;