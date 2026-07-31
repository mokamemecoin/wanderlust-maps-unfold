import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Camera, Compass, Loader2, MapPin, Search, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ALERT_CATEGORIES } from '@/components/AlertDetailSheet';

export type NewEntryMode = 'alert' | 'post';

interface NewPostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: NewEntryMode | null;
}

const POST_TAGS = ['#Consiglio', '#Cibo', '#Avventura', '#PuntoPanoramico', '#Budget'];

const pinIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: 'new-post-pin',
});

const NewPostSheet = ({ open, onOpenChange, initialMode = null }: NewPostSheetProps) => {
  const [mode, setMode] = useState<NewEntryMode | null>(initialMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState<string>('danger');
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setMode(initialMode ?? null);
  }, [open, initialMode]);

  // Init picker map when a mode is selected
  useEffect(() => {
    if (!open || !mode) return;
    const t = setTimeout(() => {
      if (!mapEl.current || mapRef.current) return;
      const m = L.map(mapEl.current, { center: [42.5, 12.5], zoom: 4, zoomControl: false });
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
  }, [open, mode]);

  useEffect(() => {
    if (open && mode) return;
    mapRef.current?.remove();
    mapRef.current = null;
    markerRef.current = null;
  }, [open, mode]);

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

  const useMyPosition = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        reverseGeocode(p.coords.latitude, p.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({ description: 'Posizione non disponibile.', variant: 'destructive' });
      }
    );
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
    setCategory('danger');
    setTags([]);
    handleFile(null);
    setMode(null);
  };

  const requireAuth = () => {
    if (user) return true;
    toast({ description: 'Accedi per pubblicare.' });
    onOpenChange(false);
    navigate('/login');
    return false;
  };

  const publishAlert = async () => {
    if (!requireAuth() || !user) return;
    if (!title.trim()) {
      toast({ description: 'Inserisci un titolo per la segnalazione.', variant: 'destructive' });
      return;
    }
    if (!coords) {
      toast({ description: 'Seleziona il punto della segnalazione.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('alerts').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        location: locationName.trim() || null,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      if (error) throw error;
      const target = { ...coords };
      toast({ description: 'Segnalazione pubblicata! Sarà visibile per 24 ore.' });
      reset();
      onOpenChange(false);
      navigate('/map');
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('alerts-updated', { detail: { latitude: target.lat, longitude: target.lng } })
        );
      }, 300);
    } catch (err) {
      console.error(err);
      toast({ title: 'Errore', description: 'Impossibile pubblicare la segnalazione.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const publishPost = async () => {
    if (!requireAuth() || !user) return;
    if (!title.trim()) {
      toast({ description: 'Inserisci un titolo.', variant: 'destructive' });
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

      const place = locationName.trim() || null;
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        photo_url: photoUrl,
        location: place,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        category: 'tip',
        tags,
      });
      if (error) throw error;

      toast({ description: 'Post pubblicato nel feed Esplora!' });
      reset();
      onOpenChange(false);
      navigate('/experiences');
      setTimeout(() => window.dispatchEvent(new CustomEvent('posts-updated')), 300);
    } catch (err) {
      console.error(err);
      toast({ title: 'Errore', description: 'Impossibile pubblicare il post.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const locationBlock = (required: boolean) => (
    <div>
      <Label htmlFor="post-place" className="text-sm">
        Posizione {required ? '' : '(opzionale)'}
      </Label>
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
      <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={useMyPosition}>
        <MapPin className="w-4 h-4 mr-1" /> Usa la mia posizione
      </Button>
      <div ref={mapEl} className="mt-1 h-44 w-full rounded-lg overflow-hidden border border-border z-0" />
      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {coords
          ? locationName || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
          : 'Nessuna posizione selezionata'}
      </p>
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[1200] max-h-[92vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-2">
            {mode && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setMode(null)} aria-label="Indietro">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="text-left">
              <DrawerTitle>
                {mode === 'alert' ? 'Segnalazione Live 24h' : mode === 'post' ? 'Consiglio o Post di Viaggio' : 'Cosa vuoi pubblicare?'}
              </DrawerTitle>
              <DrawerDescription>
                {mode === 'alert'
                  ? 'Visibile sulla mappa per 24 ore, poi sparisce.'
                  : mode === 'post'
                  ? 'Foto, titolo e consigli: finisce nel feed Esplora.'
                  : 'Scegli il tipo di contenuto da condividere.'}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto">
          {!mode && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMode('alert')}
                className="w-full flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/60 transition-colors"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive text-destructive-foreground shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <span>
                  <span className="block font-semibold">Segnalazione Live 24h</span>
                  <span className="block text-sm text-muted-foreground">
                    Pericoli o servizi temporanei da mostrare sulla mappa.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode('post')}
                className="w-full flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/60 transition-colors"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shrink-0">
                  <Compass className="w-5 h-5" />
                </span>
                <span>
                  <span className="block font-semibold">Consiglio o Post di Viaggio</span>
                  <span className="block text-sm text-muted-foreground">
                    Foto e descrizione da condividere nel feed Esplora.
                  </span>
                </span>
              </button>
            </div>
          )}

          {mode === 'alert' && (
            <>
              <div>
                <Label className="text-sm">Tipo di segnalazione</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {ALERT_CATEGORIES.map((c) => (
                    <Badge
                      key={c.value}
                      variant={category === c.value ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => setCategory(c.value)}
                    >
                      {c.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="alert-title" className="text-sm">Titolo</Label>
                <Input
                  id="alert-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Strada chiusa per allagamento"
                  className="mt-1 bg-card text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="alert-desc" className="text-sm">Dettagli</Label>
                <Textarea
                  id="alert-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi cosa sta succedendo..."
                  rows={3}
                  className="mt-1 bg-card text-foreground border-border"
                />
              </div>

              {locationBlock(true)}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Annulla
                </Button>
                <Button className="flex-1" onClick={publishAlert} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  {saving ? 'Pubblicazione...' : 'Pubblica avviso'}
                </Button>
              </div>
            </>
          )}

          {mode === 'post' && (
            <>
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

              <div>
                <Label htmlFor="post-title" className="text-sm">Titolo</Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Il miglior street food di Bangkok"
                  className="mt-1 bg-card text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="post-desc" className="text-sm">Descrizione e consigli</Label>
                <Textarea
                  id="post-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cosa mangiare, dove andare, cosa evitare..."
                  rows={3}
                  className="mt-1 bg-card text-foreground border-border"
                />
              </div>

              <div>
                <Label className="text-sm">Tag</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {POST_TAGS.map((t) => (
                    <Badge
                      key={t}
                      variant={tags.includes(t) ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() =>
                        setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                      }
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              {locationBlock(false)}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Annulla
                </Button>
                <Button className="flex-1" onClick={publishPost} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  {saving ? 'Pubblicazione...' : 'Pubblica post'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewPostSheet;
