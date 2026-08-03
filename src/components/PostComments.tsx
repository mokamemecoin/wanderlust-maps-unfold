import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface PostCommentsProps {
  postId: string;
  autoFocusText?: string;
}

const PostComments = ({ postId, autoFocusText }: PostCommentsProps) => {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) console.error(error);
    const rows = (data || []) as CommentRow[];
    setComments(rows);

    const ids = Array.from(new Set(rows.map((c) => c.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', ids);
      const map: Record<string, { name: string; avatar: string | null }> = {};
      (profs || []).forEach((p: any) => {
        map[p.user_id] = {
          name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Viaggiatore',
          avatar: p.avatar_url,
        };
      });
      setAuthors(map);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (autoFocusText) setText(autoFocusText);
  }, [autoFocusText]);

  const submit = async () => {
    const content = text.trim();
    if (!content) return;
    if (!user) {
      toast({ description: 'Accedi per commentare.' });
      navigate('/login');
      return;
    }
    setSending(true);
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select()
      .single();
    setSending(false);
    if (error) {
      toast({ description: 'Commento non inviato.', variant: 'destructive' });
      return;
    }
    setText('');
    setComments((prev) => [...prev, data as CommentRow]);
  };

  return (
    <div className="mt-3 pt-3 border-t space-y-3">
      {loading ? (
        <div className="flex justify-center py-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        comments.map((c) => {
          const a = authors[c.user_id];
          return (
            <div key={c.id} className="flex gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={a?.avatar ?? undefined} alt={a?.name ?? 'Viaggiatore'} />
                <AvatarFallback>{(a?.name ?? 'V')[0]}</AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <span className="font-medium">{a?.name ?? 'Viaggiatore'}: </span>
                <span className="text-muted-foreground">{c.content}</span>
              </div>
            </div>
          );
        })
      )}

      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Fai una domanda sul posto o sul cibo..."
          aria-label="Scrivi un commento"
          className="flex-1 h-9 text-xs bg-card text-foreground border-border"
        />
        <Button size="sm" className="h-9 px-3" onClick={submit} disabled={sending} aria-label="Invia commento">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default PostComments;
