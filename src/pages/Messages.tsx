import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Conversation {
  userId: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

const timeAgo = (iso: string) => {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'ora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} g`;
};

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) console.error(error);

    const byUser = new Map<string, Conversation>();
    (data || []).forEach((m: any) => {
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      const existing = byUser.get(other);
      const unreadInc = m.recipient_id === user.id && !m.read_at ? 1 : 0;
      if (!existing) {
        byUser.set(other, {
          userId: other,
          name: 'Viaggiatore',
          avatar: null,
          lastMessage: m.content,
          lastAt: m.created_at,
          unread: unreadInc,
        });
      } else {
        existing.unread += unreadInc;
      }
    });

    const ids = Array.from(byUser.keys());
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', ids);
      (profs || []).forEach((p: any) => {
        const c = byUser.get(p.user_id);
        if (c) {
          c.name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Viaggiatore';
          c.avatar = p.avatar_url;
        }
      });
    }
    setItems(Array.from(byUser.values()));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('messages-list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <Link to="/experiences" aria-label="Torna a Esplora">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground flex-1">Messaggi</h1>
          <Button size="sm" variant="secondary" onClick={() => navigate('/friends')}>
            <Search className="w-4 h-4 mr-1" /> Amici
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nessuna conversazione. Trova amici e scrivi il primo messaggio!</p>
          </div>
        )}

        {items.map((c) => (
          <button
            key={c.userId}
            onClick={() => navigate(`/messages/${c.userId}`)}
            className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"
          >
            <Avatar className="w-11 h-11">
              <AvatarImage src={c.avatar ?? undefined} alt={c.name} />
              <AvatarFallback>{c.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-muted-foreground">{timeAgo(c.lastAt)}</p>
              {c.unread > 0 && (
                <span className="inline-block mt-1 min-w-5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  {c.unread}
                </span>
              )}
            </div>
          </button>
        ))}
      </main>
    </div>
  );
};

export default Messages;
