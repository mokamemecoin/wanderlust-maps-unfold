import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, MapPin, Search, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NewPostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pinIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: 'new-post-pin',
});

const NewPostSheet = ({ open, onOpenChange }: NewPostSheetProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isStory, setIsStory] = useState(false);

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Init picker map when the sheet opens
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (!mapEl.current || mapRef.current) return;
      const m = L.map(mapEl.current, { center: [45.07, 12.68], zoom: 4, zoomControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(m);
      m.on('click', (e: L.LeafletMouseEvent) => {
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current = m;
      setTimeout(() => m.invalidateSize(), 150);
    }, 120);
    return () => clearTimeout(t);
  }, [open]);

  // Cleanup map when closed
  useEffect(() => {
    if (open) return;
    mapRef.current?.remove();
    mapRef.current = null;
    markerRef.current = null;
  }, [open]);

  // Keep marker in sync
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !coords) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      markerRef.current = L.marker([coords.lat, coords.lng], { icon: pinIcon }).addTo(m);
    }
    m.flyTo([coords.lat, coords.lng], Math.max(m.getZoom(), 8));
  }, [coords]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=it`
      );
      const data = await res.json();
      const a = data?.address;
      if (!a) return;
      const place = a.city || a.town || a.village || a.municipality || a.county || '';
      setLocationName([place, a.country].filter(Boolean).join(', '));
    } catch {
      /* ignore */
    }
  };

  const handlePlaceSearch = async () => {
    const q = placeQuery.trim();
    if (!q) return;
    setLocating(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&accept-language=it`
      );
      const data = await res.json();
      if (!data?.length) throw new Error('not found');
      setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      setLocationName(data[0].display_name.split(',').slice(0, 2).join(',').trim());
    } catch {
      toast({ title: 'Nessun risultato', description: `Non ho trovato "${q}".`, variant: 'destructive' });
    } finally {
      setLocating(false);
    }
  };

  const handleFile = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setPlaceQuery('');
    setLocationName('');
    setCoords(null);
    setIsStory(false);
    handleFile(null);
  };

  const handlePublish = async () => {
    if (!user) {
      toast({ description: 'Accedi per pubblicare un post.' });
      onOpenChange(false);
      navigate('/login');
      return;
    }
    if (!title.trim()) {
      toast({ description: 'Inserisci un titolo.', variant: 'destructive' });
      return;
    }
    if (!coords) {
      toast({ description: 'Seleziona una posizione sulla mappa.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let photoUrl: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('trips').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (upErr) throw upErr;
        photoUrl = supabase.storage.from('trips').getPublicUrl(path).data.publicUrl;
      }

      const place = locationName.trim() || `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`;
      const expiresAt = isStory ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;

      const { error: tripErr } = await supabase.from('trips').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        location: place,
        photo_url: photoUrl,
        is_story: isStory,
        expires_at: expiresAt,
      });
      if (tripErr) throw tripErr;

      const { error: travErr } = await supabase.from('travelers').insert({
        user_id: user.id,
        name: title.trim(),
        location: place,
        latitude: coords.lat,
        longitude: coords.lng,
        is_story: isStory,
        expires_at: expiresAt,
      });
      if (travErr) throw travErr;

      toast({
        description: isStory
          ? 'Momento 24h pubblicato! Sparirà tra 24 ore.'
          : 'Post pubblicato! Segnaposto aggiunto sulla mappa.',
      });
      const target = { ...coords };
      reset();
      onOpenChange(false);
      navigate('/map');
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('travelers-updated', { detail: { latitude: target.lat, longitude: target.lng } })
        );
      }, 300);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Errore',
        description: 'Impossibile pubblicare il post. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[1200] max-h-[92vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle>Nuovo post</DrawerTitle>
          <DrawerDescription>Carica una foto, racconta e scegli il punto sulla mappa.</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto">
          {/* Foto */}
          <div>
            <Label htmlFor="post-photo" className="text-sm">Foto</Label>
            <label
              htmlFor="post-photo"
              className="mt-1 flex items-center justify-center h-40 w-full rounded-lg border border-dashed border-border bg-muted/40 cursor-pointer overflow-hidden relative"
            >
              {preview ? (
                <img src={preview} alt="Anteprima foto del post" className="w-full h-full object-cover" />
              ) : (
                <span className="flex flex-col items-center text-muted-foreground text-sm">
                  <Camera className="w-6 h-6 mb-1" />
                  Tocca per caricare una foto
                </span>
              )}
            </label>
            <input
              id="post-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {preview && (
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => handleFile(null)}>
                <X className="w-4 h-4 mr-1" /> Rimuovi foto
              </Button>
            )}
          </div>

          {/* Titolo */}
          <div>
            <Label htmlFor="post-title" className="text-sm">Titolo</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Tramonto a Santorini"
              className="mt-1 bg-card text-foreground border-border"
            />
          </div>

          {/* Descrizione */}
          <div>
            <Label htmlFor="post-desc" className="text-sm">Descrizione</Label>
            <Textarea
              id="post-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Racconta la tua esperienza..."
              rows={3}
              className="mt-1 bg-card text-foreground border-border"
            />
          </div>

          {/* Momento 24h */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
            <div className="pr-3">
              <Label htmlFor="post-story" className="text-sm">Momento 24h</Label>
              <p className="text-xs text-muted-foreground">
                Il segnaposto sarà temporaneo e sparirà dopo 24 ore.
              </p>
            </div>
            <Switch id="post-story" checked={isStory} onCheckedChange={setIsStory} />
          </div>

          {/* Posizione */}
          <div>
            <Label htmlFor="post-place" className="text-sm">Posizione</Label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="post-place"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePlaceSearch();
                  }
                }}
                placeholder="Cerca un luogo o tocca la mappa"
                className="pl-9 pr-20 bg-card text-foreground border-border"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                onClick={handlePlaceSearch}
                disabled={locating}
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cerca'}
              </Button>
            </div>
            <div ref={mapEl} className="mt-2 h-48 w-full rounded-lg overflow-hidden border border-border z-0" />
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {coords
                ? locationName || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                : 'Nessuna posizione selezionata'}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button className="flex-1" onClick={handlePublish} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {saving ? 'Pubblicazione...' : 'Pubblica'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewPostSheet;
