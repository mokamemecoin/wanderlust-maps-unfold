import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Follower/following counters plus the current user's follow state for a profile. */
export const useFollowStats = (userId?: string | null, currentUserId?: string | null) => {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
    ]);
    setFollowers(followersCount ?? 0);
    setFollowing(followingCount ?? 0);

    if (currentUserId && currentUserId !== userId) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .maybeSingle();
      setIsFollowing(!!data);
    } else {
      setIsFollowing(false);
    }
    setLoading(false);
  }, [userId, currentUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || !userId || currentUserId === userId) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowers((c) => Math.max(0, c + (wasFollowing ? -1 : 1)));
    const { error } = wasFollowing
      ? await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId)
      : await supabase.from('follows').insert({ follower_id: currentUserId, following_id: userId });
    if (error) load();
  }, [currentUserId, userId, isFollowing, load]);

  return { followers, following, isFollowing, loading, toggleFollow, reload: load };
};
