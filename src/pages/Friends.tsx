import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, Search, UserPlus, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfileRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location: string | null;
}

const fullName = (p: ProfileRow) =>
  `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Viaggiatore';

const Friends = () => {
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<ProfileRow[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    let request = supabase
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url, location')
      .limit(50);
    const q = query.trim();
    if (q) {
      request = request.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,location.ilike.%${q}%`
      );
    }
    const { data, error } = await request;
    if (error) console.error(error);
    setPeople(((data || []) as ProfileRow[]).filter((p) => p.user_id !== user?.id));

    if (user) {
      const { data: rows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      setFollowing(new Set((rows || []).map((r: any) => r.following_id)));
    }
    setLoading(false);
  }, [query, user]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const toggleFollow = async (targetId: string) => {
    if (!user) {
      toast({ description: 'Accedi per seguire altre persone.' });
      return;
    }
    const isFollowing = following.has(targetId);
    setFollowing((prev) => {
      const next = new Set(prev);
      isFollowing ? next.delete(targetId) : next.add(targetId);
      return next;
    });
    const { error } = isFollowing
      ? await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId)
      : await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
    if (error) {
      toast({ description: 'Operazione non riuscita.', variant: 'destructive' });
      load();
      return;
    }
    toast({ description: isFollowing ? 'Non segui più questa persona' : 'Ora segui questa persona' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link to="/experiences" aria-label="Torna a Esplora">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Trova amici</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome o città..."
            aria-label="Cerca persone iscritte"
            className="pl-9 bg-card text-foreground border-border"
          />
        </div>
      </header>

      <main className="p-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {!loading && people.length === 0 && (
          <p className="text-center py-12 text-sm text-muted-foreground">
            Nessuna persona trovata.
          </p>
        )}

        {people.map((p) => (
          <div
            key={p.user_id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <button
              type="button"
              onClick={() => navigate(`/u/${p.user_id}`)}
              className="flex flex-1 min-w-0 items-center gap-3 text-left"
              aria-label={`Apri profilo di ${fullName(p)}`}
            >
              <Avatar className="w-11 h-11">
                <AvatarImage src={p.avatar_url ?? undefined} alt={fullName(p)} />
                <AvatarFallback>{fullName(p)[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{fullName(p)}</p>
                {p.location && (
                  <p className="text-xs text-muted-foreground truncate">{p.location}</p>
                )}
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  user ? navigate(`/messages/${p.user_id}`) : navigate('/login')
                }
                aria-label={`Invia messaggio a ${fullName(p)}`}
              >
                <MessageCircle className="w-4 h-4 mr-1" /> Messaggio
              </Button>
              <Button
                size="sm"
                variant={following.has(p.user_id) ? 'secondary' : 'default'}
                onClick={() => toggleFollow(p.user_id)}
              >
                {following.has(p.user_id) ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" /> Segui già
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" /> Segui
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Friends;
