import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=it`
    );
    const data = await res.json();
    const a = data?.address || {};
    const place = a.city || a.town || a.village || a.municipality || a.county;
    return [place, a.country].filter(Boolean).join(', ') || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
};

/**
 * Gestisce la condivisione della posizione in tempo reale dell'utente autenticato.
 */
export const useLiveLocation = (onChange?: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLive, setIsLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const rowId = useRef<string | null>(null);
  const watchId = useRef<number | null>(null);

  // Stato iniziale: l'utente ha già una riga "live"?
  useEffect(() => {
    if (!user) {
      setIsLive(false);
      rowId.current = null;
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('travelers')
        .select('id, is_live')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !data) return;
      rowId.current = data.id;
      setIsLive(!!data.is_live);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const savePosition = useCallback(
    async (lat: number, lon: number) => {
      if (!user) return;
      const location = await reverseGeocode(lat, lon);
      const name =
        (user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim()
          : user.email?.split('@')[0]) || 'Viaggiatore';

      const payload = {
        user_id: user.id,
        name,
        location,
        latitude: lat,
        longitude: lon,
        is_live: true,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (rowId.current) {
        const { error } = await supabase.from('travelers').update(payload).eq('id', rowId.current);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('travelers')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        rowId.current = data.id;
      }
      onChange?.();
    },
    [user, onChange]
  );

  const stopWatching = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const goLive = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Accedi per andare live',
        description: 'Devi effettuare l’accesso per condividere la tua posizione.',
        variant: 'destructive',
      });
      return false;
    }
    if (!('geolocation' in navigator)) {
      toast({
        title: 'GPS non disponibile',
        description: 'Il tuo dispositivo non supporta la geolocalizzazione.',
        variant: 'destructive',
      });
      return false;
    }

    setBusy(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        })
      );
      await savePosition(pos.coords.latitude, pos.coords.longitude);
      setIsLive(true);
      toast({ title: 'Sei live!', description: 'La tua posizione è visibile agli altri viaggiatori.' });

      stopWatching();
      watchId.current = navigator.geolocation.watchPosition(
        (p) => savePosition(p.coords.latitude, p.coords.longitude).catch(() => {}),
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
      return true;
    } catch (err: any) {
      const denied = err?.code === 1;
      toast({
        title: denied ? 'Permesso GPS negato' : 'Posizione non disponibile',
        description: denied
          ? 'Attiva il permesso di localizzazione nelle impostazioni del browser.'
          : 'Non sono riuscito a rilevare la tua posizione.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setBusy(false);
    }
  }, [user, savePosition, stopWatching, toast]);

  const goOffline = useCallback(async () => {
    stopWatching();
    setIsLive(false);
    if (rowId.current) {
      await supabase
        .from('travelers')
        .update({ is_live: false, updated_at: new Date().toISOString() })
        .eq('id', rowId.current);
      onChange?.();
    }
    toast({ title: 'Live disattivato', description: 'La tua posizione non è più condivisa.' });
  }, [stopWatching, toast, onChange]);

  useEffect(() => stopWatching, [stopWatching]);

  return { isLive, busy, goLive, goOffline, canGoLive: !!user };
};
