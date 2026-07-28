import React, { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MapPin, Bookmark, Send, ImageIcon, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface PostDetail {
  id: string;
  title: string;
  photos?: string[];
  place?: string;
  country?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

const AVAILABLE_TAGS = ['#Consiglio', '#Cibo', '#Avventura', '#PuntoPanoramico'];

type Comment = { user: string; text: string };

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

interface PostDetailSheetProps {
  post: PostDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCenterMap?: (post: PostDetail) => void;
}

const PostDetailSheet = ({ post, open, onOpenChange, onCenterMap }: PostDetailSheetProps) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!post) return;
    const state = readStore(`post-social-${post.id}`, {
      liked: false,
      likes: 0,
      saved: false,
      comments: [] as Comment[],
      tags: [] as string[],
    });
    setLiked(state.liked);
    setLikes(state.likes);
    setSaved(state.saved);
    setComments(state.comments ?? []);
    setTags(state.tags ?? []);
  }, [post?.id]);

  const persist = (next: Partial<{ liked: boolean; likes: number; saved: boolean; comments: Comment[]; tags: string[] }>) => {
    if (!post) return;
    writeStore(`post-social-${post.id}`, { liked, likes, saved, comments, tags, ...next });
  };

  const toggleLike = () => {
    const nextLiked = !liked;
    const nextLikes = Math.max(0, likes + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikes(nextLikes);
    persist({ liked: nextLiked, likes: nextLikes });
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    persist({ saved: next });
    toast({ description: next ? 'Salvato tra i luoghi da visitare' : 'Rimosso dai luoghi da visitare' });
  };

  const toggleTag = (tag: string) => {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setTags(next);
    persist({ tags: next });
  };

  const addComment = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...comments, { user: 'Tu', text }];
    setComments(next);
    setDraft('');
    persist({ comments: next });
  };

  const photos = post?.photos?.filter(Boolean) ?? [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[1200] max-h-[90vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle>{post?.title}</DrawerTitle>
          <DrawerDescription className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>
              {post?.place ?? '—'}
              {post?.country ? `, ${post.country}` : ''}
            </span>
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="max-h-[65vh] px-4">
          <div className="pb-8 space-y-4">
            {/* Carosello foto */}
            {photos.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {photos.map((src, i) => (
                    <CarouselItem key={i}>
                      <img
                        src={src}
                        alt={`${post?.title ?? 'Post'} - foto ${i + 1}`}
                        loading="lazy"
                        className="w-full h-56 object-cover rounded-lg"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {photos.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            {post?.description && <p className="text-sm text-foreground">{post.description}</p>}

            {/* Tag */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Aggiungi tag
              </p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)} aria-pressed={tags.includes(tag)}>
                    <Badge variant={tags.includes(tag) ? 'default' : 'outline'} className="cursor-pointer">
                      {tag}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Azioni */}
            <div className="flex items-center gap-2 border-y border-border py-2">
              <Button variant="ghost" size="sm" onClick={toggleLike} aria-label="Mi piace">
                <Heart className={`w-5 h-5 mr-1 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-sm">{likes}</span>
              </Button>
              <Button
                variant={saved ? 'default' : 'outline'}
                size="sm"
                onClick={toggleSave}
                className="ml-auto"
              >
                <Bookmark className={`w-4 h-4 mr-1 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Salvato' : 'Salva tra i luoghi da visitare'}
              </Button>
            </div>

            {/* Commenti */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Commenti ({comments.length})</h3>
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground">Nessun commento. Scrivi il primo!</p>
              )}
              {comments.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">
                    {c.user[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.user}</p>
                    <p className="text-sm text-muted-foreground">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Scrivi un commento..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                  className="bg-card text-foreground"
                />
                <Button size="icon" onClick={addComment} aria-label="Invia commento">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {onCenterMap && post && (
              <Button variant="secondary" className="w-full" onClick={() => onCenterMap(post)}>
                Centra sulla mappa
              </Button>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default PostDetailSheet;
