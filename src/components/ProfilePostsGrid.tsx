import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Image as ImageIcon } from "lucide-react";
import type { VisitedPlace } from "@/hooks/useVisitedCountries";

interface ProfilePostsGridProps {
  trips: any[];
  places: VisitedPlace[];
}

const ProfilePostsGrid = ({ trips, places }: ProfilePostsGridProps) => {
  const [groupBy, setGroupBy] = useState<"trip" | "country">("trip");

  const countryByLocation = useMemo(() => {
    const map = new Map<string, string>();
    places.forEach((p) => map.set(p.location, p.country));
    return map;
  }, [places]);

  const groups = useMemo(() => {
    const result = new Map<string, any[]>();
    trips.forEach((trip) => {
      const key =
        groupBy === "trip"
          ? trip.title || "Senza titolo"
          : countryByLocation.get(trip.location) || trip.location || "Sconosciuto";
      result.set(key, [...(result.get(key) || []), trip]);
    });
    return Array.from(result.entries());
  }, [trips, groupBy, countryByLocation]);

  if (trips.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Non hai ancora pubblicato post o foto.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as "trip" | "country")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trip">Per viaggio</TabsTrigger>
          <TabsTrigger value="country">Per stato</TabsTrigger>
        </TabsList>
      </Tabs>

      {groups.map(([label, items]) => (
        <div key={label} className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">{label}</h4>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={`${item.title} - ${item.location}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-1">
                  <p className="text-[10px] text-background truncate">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePostsGrid;
