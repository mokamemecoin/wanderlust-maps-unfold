import { useEffect, useState } from "react";

export interface VisitedPlace {
  location: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

const CACHE_KEY = "miomondo_geocode_cache_v1";
const TOTAL_COUNTRIES = 195;

type CacheEntry = Omit<VisitedPlace, "location"> | null;

const readCache = (): Record<string, CacheEntry> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCache = (cache: Record<string, CacheEntry>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota errors */
  }
};

const geocode = async (location: string): Promise<CacheEntry> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(location)}`
  );
  const data = await res.json();
  if (!data?.length) return null;
  const first = data[0];
  return {
    country: first.address?.country || location,
    countryCode: (first.address?.country_code || "").toUpperCase(),
    latitude: parseFloat(first.lat),
    longitude: parseFloat(first.lon),
  };
};

/** Resolves trip locations into visited countries with coordinates. */
export const useVisitedCountries = (locations: string[]) => {
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(false);

  const key = locations.join("|");

  useEffect(() => {
    let cancelled = false;
    const unique = Array.from(new Set(locations.map((l) => l?.trim()).filter(Boolean)));
    if (unique.length === 0) {
      setPlaces([]);
      return;
    }

    const run = async () => {
      setLoading(true);
      const cache = readCache();
      const resolved: VisitedPlace[] = [];

      for (const location of unique) {
        let entry = cache[location];
        if (entry === undefined) {
          try {
            entry = await geocode(location);
          } catch {
            entry = null;
          }
          cache[location] = entry;
        }
        if (entry) resolved.push({ location, ...entry });
      }

      writeCache(cache);
      if (!cancelled) {
        setPlaces(resolved);
        setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const countries = Array.from(
    new Map(places.map((p) => [p.countryCode || p.country, p])).values()
  );
  const worldPercentage = Math.round((countries.length / TOTAL_COUNTRIES) * 1000) / 10;

  return { places, countries, worldPercentage, totalCountries: TOTAL_COUNTRIES, loading };
};
