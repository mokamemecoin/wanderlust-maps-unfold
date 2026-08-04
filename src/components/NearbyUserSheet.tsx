import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface NearbyUserInfo {
  user_id: string;
  name: string;
  avatar_url?: string | null;
  latitude: number;
  longitude: number;
}

interface Props {
  person: NearbyUserInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PostPreview {
  id: string;
  title: string;
  photo_url: string | null;
  location: string | null;
}

const NearbyUserSheet = ({ person, open, onOpenChange }: Props) => {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !person) return;
    supabase
      .from('posts')
      .select('id, title, photo_url, location')
      .eq('user_id', person.user_id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts((data || []) as PostPreview[]));
  }, [open, person]);

  const sendQuick = async (preset?: string) => {
    const content = (preset ?? text).trim();
    if (!content || !person) return;
    if (!user) {
      toast({ description: 'Accedi per inviare messaggi.' });
      navigate('/login');
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({ sender_id: user.id, recipient_id: person.user_id, content });
    setSending(false);
    if (error) {
      toast({ description: 'Messaggio non inviato.', variant: 'destructive' });
      return;
    }
    setText('');
    toast({ description: 'Messaggio inviato!' });
    onOpenChange(false);
    navigate(`/messages/${person.user_id}`);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[2000]">
        {person && (
          <div className="p-4 pb-8 space-y-4">
            <DrawerHeader className="p-0 text-left">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={person.avatar_url ?? undefined} alt={person.name} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <DrawerTitle>{person.name}</DrawerTitle>
                  <DrawerDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Vicino a te
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendQuick();
                  }
                }}
                placeholder="Messaggio rapido..."
                aria-label="Messaggio rapido"
                className="flex-1 bg-card text-foreground border-border"
              />
              <Button onClick={sendQuick} disabled={sending} aria-label="Invia messaggio rapido">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate(`/messages/${person.user_id}`);
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Apri chat
            </Button>

            <Button
              className="w-full"
              disabled={sending}
              onClick={() => sendQuick('Ci prendiamo un caffè? ☕')}
            >
              <Coffee className="w-4 h-4 mr-2" /> Invita per un caffè
            </Button>

            <div>
              <p className="text-sm font-medium mb-2">Ultimi post</p>
              {posts.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nessun post pubblicato.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {posts.map((p) => (
                    <div key={p.id} className="rounded-lg overflow-hidden border border-border">
                      {p.photo_url ? (
                        <img
                          src={p.photo_url}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-20 object-cover"
                        />
                      ) : (
                        <div className="w-full h-20 bg-muted" />
                      )}
                      <p className="text-[10px] p-1 truncate">{p.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default NearbyUserSheet;
