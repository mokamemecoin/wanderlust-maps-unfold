import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VisitedPlace } from "@/hooks/useVisitedCountries";

interface PassportStoryCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  initials?: string;
  avatarUrl?: string | null;
  places: VisitedPlace[];
  countries: VisitedPlace[];
  worldPercentage: number;
}

const ALIASES: Record<string, string> = {
  "united states of america": "united states",
  usa: "united states",
  czechia: "czech republic",
  "republic of serbia": "serbia",
  "united republic of tanzania": "tanzania",
  "myanmar (burma)": "myanmar",
  "the netherlands": "netherlands",
};

const normalize = (value: string) => {
  const key = (value || "").trim().toLowerCase();
  return ALIASES[key] || key;
};

/** Equirectangular projection into a 360x180 viewBox. */
const project = (lon: number, lat: number) => [lon + 180, 90 - lat];

const ringsToPath = (rings: number[][][]) =>
  rings
    .map((ring) => {
      const d = ring
        .map(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ");
      return `${d} Z`;
    })
    .join(" ");

const continentOf = (lat: number, lon: number) => {
  if (lat > 34 && lon > -25 && lon < 45) return "Europeo";
  if (lat < 35 && lat > -37 && lon > -20 && lon < 52) return "Africano";
  if (lon >= 45 && lon < 150 && lat > -12) return "Asiatico";
  if (lat < -10 && lon >= 110) return "dell'Oceania";
  if (lat < 13 && lon < -30) return "Sudamericano";
  if (lat >= 13 && lon < -30) return "Nordamericano";
  return "del Mondo";
};

const badgeFor = (countries: VisitedPlace[]) => {
  if (countries.length === 0) return "Sognatore in partenza";
  if (countries.length >= 25) return "Cacciatore di Gemme";
  if (countries.length >= 12) return "Giramondo Esperto";
  const tally: Record<string, number> = {};
  countries.forEach((c) => {
    const key = continentOf(c.latitude, c.longitude);
    tally[key] = (tally[key] || 0) + 1;
  });
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  return `Esploratore ${top}`;
};

const toDataUrl = async (url: string) => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const PassportStoryCard = ({
  open,
  onOpenChange,
  displayName,
  initials,
  avatarUrl,
  places,
  countries,
  worldPercentage,
}: PassportStoryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [shapes, setShapes] = useState<{ name: string; d: string }[]>([]);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/data/countries.geo.json")
      .then((r) => r.json())
      .then((geo) => {
        if (cancelled) return;
        const list = (geo.features || []).map((f: any) => {
          const g = f.geometry;
          const rings =
            g?.type === "Polygon" ? g.coordinates : g?.type === "MultiPolygon" ? g.coordinates.flat() : [];
          return { name: normalize(f.properties?.name || ""), d: ringsToPath(rings) };
        });
        setShapes(list);
      })
      .catch(() => setShapes([]));
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !avatarUrl) return;
    let cancelled = false;
    toDataUrl(avatarUrl).then((d) => !cancelled && setAvatarData(d));
    return () => {
      cancelled = true;
    };
  }, [open, avatarUrl]);

  const visited = useMemo(() => new Set(countries.map((c) => normalize(c.country))), [countries]);
  const badge = useMemo(() => badgeFor(countries), [countries]);

  const render = async () => {
    if (!cardRef.current) return null;
    return await toPng(cardRef.current, {
      pixelRatio: 1080 / cardRef.current.offsetWidth,
      cacheBust: true,
      skipFonts: false,
    });
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const dataUrl = await render();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `wanderlust-passport-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Immagine salvata", description: "La tua story è pronta da condividere." });
    } catch {
      toast({ title: "Errore", description: "Impossibile generare l'immagine.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const dataUrl = await render();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "wanderlust-passport.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Il mio passaporto Wanderlust" });
      } else {
        await handleDownload();
      }
    } catch {
      /* user cancelled or unsupported */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader>
          <DialogTitle>Il tuo Passaporto</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="relative w-[300px] aspect-[9/16] overflow-hidden rounded-2xl"
            style={{
              background: "var(--gradient-passport)",
              color: "hsl(var(--passport-ink))",
              fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            }}
          >
            {/* stamp texture */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, hsl(var(--passport-accent) / 0.35) 0 1px, transparent 1px 14px)",
              }}
            />

            <div className="relative flex h-full flex-col p-5">
              {/* header */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-sm font-semibold"
                  style={{
                    border: "2px solid hsl(var(--passport-accent))",
                    background: "hsl(var(--passport-surface))",
                    color: "hsl(var(--passport-ink))",
                  }}
                >
                  {avatarData ? (
                    <img src={avatarData} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[9px] uppercase tracking-[0.28em]"
                    style={{ color: "hsl(var(--passport-muted))" }}
                  >
                    Passaporto di viaggio
                  </div>
                  <div className="truncate text-lg font-semibold leading-tight">{displayName}</div>
                </div>
              </div>

              <div className="my-4 h-px w-full" style={{ background: "hsl(var(--passport-accent) / 0.35)" }} />

              {/* world map */}
              <div className="flex-1">
                <svg viewBox="0 0 360 150" className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
                  <g transform="translate(0,-25)">
                    {shapes.map((s, i) => (
                      <path
                        key={i}
                        d={s.d}
                        fill={
                          visited.has(s.name)
                            ? "hsl(var(--passport-accent))"
                            : "hsl(var(--passport-land))"
                        }
                        stroke={
                          visited.has(s.name)
                            ? "hsl(var(--passport-accent-soft))"
                            : "hsl(var(--passport-bg-deep))"
                        }
                        strokeWidth={0.3}
                      />
                    ))}
                    {places.map((p, i) => {
                      const [x, y] = project(p.longitude, p.latitude);
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={1.8}
                          fill="hsl(var(--passport-ink))"
                          stroke="hsl(var(--passport-accent))"
                          strokeWidth={0.6}
                        />
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* stats */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl px-3 py-3 text-center"
                  style={{ background: "hsl(var(--passport-surface))" }}
                >
                  <div className="text-2xl font-bold" style={{ color: "hsl(var(--passport-accent-soft))" }}>
                    {countries.length}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest" style={{ color: "hsl(var(--passport-muted))" }}>
                    Paesi visitati
                  </div>
                </div>
                <div
                  className="rounded-xl px-3 py-3 text-center"
                  style={{ background: "hsl(var(--passport-surface))" }}
                >
                  <div className="text-2xl font-bold" style={{ color: "hsl(var(--passport-accent-soft))" }}>
                    {worldPercentage}%
                  </div>
                  <div className="text-[9px] uppercase tracking-widest" style={{ color: "hsl(var(--passport-muted))" }}>
                    Mondo esplorato
                  </div>
                </div>
              </div>

              {/* badge */}
              <div className="mt-4 flex justify-center">
                <div
                  className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{
                    border: "1px solid hsl(var(--passport-accent))",
                    color: "hsl(var(--passport-accent-soft))",
                  }}
                >
                  {badge}
                </div>
              </div>

              {/* footer */}
              <div className="mt-auto pt-5 text-center">
                <div className="text-base font-bold tracking-[0.3em]">WANDERLUST</div>
                <div className="text-[10px]" style={{ color: "hsl(var(--passport-muted))" }}>
                  Traccia i tuoi viaggi su Wanderlust
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={busy}>
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}
            Scarica
          </Button>
          <Button onClick={handleShare} disabled={busy}>
            <Share2 className="mr-1 h-4 w-4" />
            Condividi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassportStoryCard;
