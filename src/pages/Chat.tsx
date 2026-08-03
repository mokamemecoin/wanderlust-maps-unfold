import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<{ name: string; avatar: string | null }>({
    name: 'Viaggiatore',
    avatar: null,
  });
  const [text, setText] = useState(searchParams.get('text') ?? '');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user || !userId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })
      .limit(500);
    if (error) console.error(error);
    setMessages((data || []) as Message[]);
    setLoading(false);

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', userId)
      .eq('recipient_id', user.id)
      .is('read_at', null);
  }, [user, userId]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOther({
            name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || 'Viaggiatore',
            avatar: data.avatar_url,
          });
        }
      });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user || !userId) return;
    const channel = supabase
      .channel(`chat-${[user.id, userId].sort().join('-')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new as Message;
        const mine =
          (m.sender_id === user.id && m.recipient_id === userId) ||
          (m.sender_id === userId && m.recipient_id === user.id);
        if (mine) setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || !user || !userId) return;
    setSending(true);
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: user.id, recipient_id: userId, content })
      .select()
      .single();
    setSending(false);
    if (error) {
      toast({ description: 'Messaggio non inviato.', variant: 'destructive' });
      return;
    }
    setText('');
    setMessages((prev) => (prev.some((p) => p.id === data.id) ? prev : [...prev, data as Message]));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 p-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => navigate(-1)} aria-label="Indietro">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src={other.avatar ?? undefined} alt={other.name} />
          <AvatarFallback>{other.name[0]}</AvatarFallback>
        </Avatar>
        <h1 className="text-base font-semibold truncate">{other.name}</h1>
      </header>

      <main className="flex-1 p-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center py-10 text-sm text-muted-foreground">
            Inizia la conversazione con {other.name}.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <div className="sticky bottom-16 bg-background/95 backdrop-blur border-t border-border/50 p-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Scrivi un messaggio..."
          aria-label="Scrivi un messaggio"
          className="flex-1 bg-card text-foreground border-border"
        />
        <Button onClick={send} disabled={sending || !text.trim()} aria-label="Invia messaggio">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default Chat;
