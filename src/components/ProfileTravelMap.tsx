import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { VisitedPlace } from "@/hooks/useVisitedCountries";

interface ProfileTravelMapProps {
  places: VisitedPlace[];
  countries: VisitedPlace[];
}

const ALIASES: Record<string, string> = {
  "united states of america": "united states",
  "usa": "united states",
  "czechia": "czech republic",
  "republic of serbia": "serbia",
  "united republic of tanzania": "tanzania",
  "myanmar (burma)": "myanmar",
  "the netherlands": "netherlands",
};

const normalize = (value: string) => {
  const key = value.trim().toLowerCase();
  return ALIASES[key] || key;
};

const ProfileTravelMap = ({ places, countries }: ProfileTravelMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [25, 10],
      zoom: 1,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      worldCopyJump: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 8,
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const visited = new Set(countries.map((c) => normalize(c.country)));

    let cancelled = false;
    const paint = async () => {
      try {
        const res = await fetch("/data/countries.geo.json");
        const geojson = await res.json();
        if (cancelled || !mapRef.current) return;

        layerRef.current?.remove();
        layerRef.current = L.geoJSON(geojson, {
          filter: (feature: any) => visited.has(normalize(feature.properties?.name || "")),
          style: () => ({
            color: "hsl(var(--primary))",
            weight: 1,
            fillColor: "hsl(var(--primary))",
            fillOpacity: 0.55,
          }),
          onEachFeature: (feature: any, layer) => {
            layer.bindTooltip(feature.properties?.name || "");
          },
        }).addTo(mapRef.current);
      } catch {
        /* boundaries are a visual enhancement only */
      }
    };

    paint();
    return () => {
      cancelled = true;
    };
  }, [countries]);

  useEffect(() => {
    const group = markersRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();
    places.forEach((place) => {
      L.circleMarker([place.latitude, place.longitude], {
        radius: 5,
        color: "hsl(var(--background))",
        weight: 2,
        fillColor: "hsl(var(--accent))",
        fillOpacity: 1,
      })
        .bindTooltip(place.location)
        .addTo(group);
    });

    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.latitude, p.longitude] as [number, number]));
      map.fitBounds(bounds.pad(0.6), { maxZoom: 4 });
    }
  }, [places]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-56 rounded-xl overflow-hidden border border-border" />
      {places.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 text-sm text-muted-foreground">
          Aggiungi un viaggio per colorare la tua mappa
        </div>
      )}
    </div>
  );
};

export default ProfileTravelMap;
