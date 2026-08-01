import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MiomondoLogo } from '@/components/MiomondoLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Bookmark, MapPin, Share2, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FeedPost {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[] | null;
  created_at: string;
}

const timeAgo = (iso: string) => {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'ora';
  if (min < 60) return `${min} min fa`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ore fa`;
  return `${Math.floor(h / 24)} giorni fa`;
};

/** Distanza approssimata in km tra due coordinate. */
const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const dLat = (aLat - bLat) * 111;
  const dLng = (aLng - bLng) * 111 * Math.cos((aLat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

const Experiences = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [mySaves, setMySaves] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [myTags, setMyTags] = useState<Set<string>>(new Set());
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'saved'>('all');
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Posizione attuale (se concessa) per ordinare i post più vicini
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setMyCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => undefined,
      { timeout: 8000 }
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: postRows, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) console.error(error);
    const list = (postRows || []) as FeedPost[];
    setPosts(list);

    const ids = list.map((p) => p.id);
    const userIds = Array.from(new Set(list.map((p) => p.user_id)));

    if (userIds.length) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', userIds);
      const map: Record<string, any> = {};
      (profileRows || []).forEach((p: any) => (map[p.user_id] = p));
      setProfiles(map);
    }

    if (ids.length) {
      const { data: likeRows } = await supabase.from('post_likes').select('post_id, user_id').in('post_id', ids);
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      (likeRows || []).forEach((l: any) => {
        counts[l.post_id] = (counts[l.post_id] || 0) + 1;
        if (user && l.user_id === user.id) mine.add(l.post_id);
      });
      setLikeCounts(counts);
      setMyLikes(mine);

      if (user) {
        const { data: saveRows } = await supabase.from('post_saves').select('post_id').eq('user_id', user.id);
        setMySaves(new Set((saveRows || []).map((s: any) => s.post_id)));
      } else {
        setMySaves(new Set());
      }
    }

    if (user) {
      const { data: followRows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      setFollowing(new Set((followRows || []).map((f: any) => f.following_id)));

      // Preferenze: tag dei post che l'utente ha già salvato tra i preferiti
      const { data: prefRows } = await supabase.from('post_saves').select('post_id').eq('user_id', user.id);
      const savedIds = new Set((prefRows || []).map((s: any) => s.post_id));
      const prefTags = new Set<string>();
      list.forEach((p) => {
        if (savedIds.has(p.id)) (p.tags || []).forEach((t) => prefTags.add(t));
      });
      setMyTags(prefTags);
    } else {
      setFollowing(new Set());
      setMyTags(new Set());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('posts-updated', handler);
    return () => window.removeEventListener('posts-updated', handler);
  }, [load]);

  const requireAuth = () => {
    if (user) return true;
    toast({ description: 'Accedi per interagire con i post.' });
    navigate('/login');
    return false;
  };

  const toggleLike = async (postId: string) => {
    if (!requireAuth() || !user) return;
    const liked = myLikes.has(postId);
    setMyLikes((prev) => {
      const next = new Set(prev);
      liked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setLikeCounts((prev) => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) + (liked ? -1 : 1)) }));

    const { error } = liked
      ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      : await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    if (error) {
      toast({ description: 'Operazione non riuscita.', variant: 'destructive' });
      load();
    }
  };

  const toggleSave = async (postId: string) => {
    if (!requireAuth() || !user) return;
    const saved = mySaves.has(postId);
    setMySaves((prev) => {
      const next = new Set(prev);
      saved ? next.delete(postId) : next.add(postId);
      return next;
    });
    const { error } = saved
      ? await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', user.id)
      : await supabase.from('post_saves').insert({ post_id: postId, user_id: user.id });
    if (error) {
      toast({ description: 'Operazione non riuscita.', variant: 'destructive' });
      load();
      return;
    }
    toast({ description: saved ? 'Rimosso dai preferiti' : 'Salvato tra i preferiti' });
  };

  const share = async (post: FeedPost) => {
    const data = { title: post.title, text: post.description ?? '', url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(`${post.title} — ${data.url}`);
      toast({ description: 'Link copiato negli appunti' });
    } catch {
      /* annullato */
    }
  };

  const score = (p: FeedPost) => {
    let s = 0;
    if (following.has(p.user_id)) s += 100;
    if (myCoords && p.latitude != null && p.longitude != null) {
      const d = distanceKm(myCoords.lat, myCoords.lng, Number(p.latitude), Number(p.longitude));
      if (d < 50) s += 60;
      else if (d < 200) s += 35;
      else if (d < 1000) s += 15;
    }
    if ((p.tags || []).some((t) => myTags.has(t))) s += 25;
    // freschezza: fino a 20 punti per i post delle ultime 48 ore
    const hours = (Date.now() - new Date(p.created_at).getTime()) / 3_600_000;
    s += Math.max(0, 20 - hours / 2.4);
    return s;
  };

  const visible = (tab === 'saved' ? posts.filter((p) => mySaves.has(p.id)) : posts)
    .slice()
    .sort((a, b) => score(b) - score(a));

  const authorName = (userId: string) => {
    const p = profiles[userId];
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Viaggiatore' : 'Viaggiatore';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/map" className="flex items-center gap-2">
            <MiomondoLogo size="w-6 h-6" />
            <span className="text-lg font-bold text-foreground">Esplora</span>
          </Link>
          <Button size="sm" variant="secondary" onClick={() => navigate('/friends')}>
            <Search className="w-4 h-4 mr-1" /> Amici
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Consigli, foto e posti particolari condivisi dalla community
        </p>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'saved')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Recenti</TabsTrigger>
            <TabsTrigger value="saved">Preferiti</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <main className="p-4 space-y-5">
        <h1 className="sr-only">Feed della community Miomondo</h1>

        {loading && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {tab === 'saved'
              ? 'Non hai ancora salvato nessun post.'
              : 'Nessun post ancora. Pubblica il primo consiglio di viaggio!'}
          </div>
        )}

        {visible.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profiles[post.user_id]?.avatar_url} alt={authorName(post.user_id)} />
                  <AvatarFallback>{authorName(post.user_id)[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{authorName(post.user_id)}</CardTitle>
                  <CardDescription className="text-sm flex items-center gap-1">
                    {post.location && (
                      <>
                        <MapPin className="w-3 h-3" />
                        {post.location} •{' '}
                      </>
                    )}
                    {timeAgo(post.created_at)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {post.photo_url && (
              <div className="px-6 pb-3">
                <img
                  src={post.photo_url}
                  alt={`${post.title}${post.location ? ` - ${post.location}` : ''}`}
                  loading="lazy"
                  className="w-full h-52 object-cover rounded-lg"
                />
              </div>
            )}

            <CardContent className="pt-0">
              <h2 className="font-semibold text-sm mb-1">{post.title}</h2>
              {post.description && <p className="text-sm mb-3">{post.description}</p>}

              {!!post.tags?.length && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-2">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleLike(post.id)} aria-label="Mi piace">
                    <Heart
                      className={`w-5 h-5 mr-1 ${myLikes.has(post.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span className="text-sm">{likeCounts[post.id] || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSave(post.id)}
                    aria-label="Salva tra i preferiti"
                  >
                    <Bookmark
                      className={`w-5 h-5 mr-1 ${mySaves.has(post.id) ? 'fill-current text-primary' : ''}`}
                    />
                    <span className="text-sm">{mySaves.has(post.id) ? 'Salvato' : 'Salva'}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => share(post)} aria-label="Condividi">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default Experiences;
