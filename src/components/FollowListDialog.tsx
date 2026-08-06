import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type FollowListMode = 'followers' | 'following';

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FollowListMode;
  userId: string;
  currentUserId?: string | null;
}

interface PersonRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location: string | null;
}

export const personName = (p: { first_name: string | null; last_name: string | null }) =>
  `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Viaggiatore';

const FollowListDialog = ({ open, onOpenChange, mode, userId, currentUserId }: FollowListDialogProps) => {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('follows')
      .select(mode === 'followers' ? 'follower_id' : 'following_id')
      .eq(mode === 'followers' ? 'following_id' : 'follower_id', userId);

    const ids = (rows || []).map((r: any) =>
      mode === 'followers' ? r.follower_id : r.following_id
    );

    if (ids.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url, location')
        .in('user_id', ids);
      setPeople((profiles || []) as PersonRow[]);
    } else {
      setPeople([]);
    }

    if (currentUserId) {
      const { data: mine } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);
      setFollowing(new Set((mine || []).map((r: any) => r.following_id)));
    }
    setLoading(false);
  }, [mode, userId, currentUserId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const toggleFollow = async (targetId: string) => {
    if (!currentUserId) {
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
      ? await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', targetId)
      : await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetId });
    if (error) {
      toast({ description: 'Operazione non riuscita.', variant: 'destructive' });
      load();
    }
  };

  const openProfile = (id: string) => {
    onOpenChange(false);
    navigate(`/u/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'followers' ? 'Follower' : 'Following'}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : people.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {mode === 'followers' ? 'Nessun follower per ora.' : 'Non segue ancora nessuno.'}
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {people.map((p) => (
              <div key={p.user_id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60">
                <button
                  type="button"
                  onClick={() => openProfile(p.user_id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <Avatar className="h-10 w-10">
                    {p.avatar_url && <AvatarImage src={p.avatar_url} alt={personName(p)} />}
                    <AvatarFallback>{personName(p)[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{personName(p)}</p>
                    {p.location && (
                      <Badge variant="secondary" className="mt-0.5 text-[10px]">
                        {p.location}
                      </Badge>
                    )}
                  </div>
                </button>
                {p.user_id !== currentUserId && (
                  <Button
                    size="sm"
                    variant={following.has(p.user_id) ? 'secondary' : 'default'}
                    onClick={() => toggleFollow(p.user_id)}
                  >
                    {following.has(p.user_id) ? (
                      <><UserCheck className="mr-1 h-4 w-4" />Segui già</>
                    ) : (
                      <><UserPlus className="mr-1 h-4 w-4" />Segui</>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
