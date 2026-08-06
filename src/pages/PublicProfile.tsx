import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Globe, Images, Loader2, MapPin, MessageCircle, UserCheck, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollowStats } from '@/hooks/useFollowStats';
import { useVisitedCountries } from '@/hooks/useVisitedCountries';
import FollowListDialog, { FollowListMode } from '@/components/FollowListDialog';
import ProfileTravelMap from '@/components/ProfileTravelMap';
import ProfilePostsGrid from '@/components/ProfilePostsGrid';

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listMode, setListMode] = useState<FollowListMode | null>(null);

  const { followers, following, isFollowing, toggleFollow } = useFollowStats(userId, user?.id);
  const entries = posts.map((p) => ({ ...p, source: 'posts' as const }));
  const { places, countries, loading: mapLoading } = useVisitedCountries(
    entries.map((e) => e.location).filter(Boolean)
  );
  const worldPercentage = Math.round((countries.length / 195) * 1000) / 10;

  useEffect(() => {
    if (user && userId === user.id) navigate('/profile', { replace: true });
  }, [user, userId, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      const [{ data: p }, { data: ps }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      setProfile(p);
      setPosts(ps || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  const displayName =
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Viaggiatore';
  const initials = displayName[0]?.toUpperCase() ?? 'V';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 pb-20">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Torna indietro" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Profilo</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{displayName}</CardTitle>
                {profile?.location && (
                  <div className="mt-1 flex items-center text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                <div className="mt-2 flex gap-4">
                  <button type="button" className="text-sm" onClick={() => setListMode('followers')}>
                    <span className="font-bold">{followers}</span>{' '}
                    <span className="text-muted-foreground">Follower</span>
                  </button>
                  <button type="button" className="text-sm" onClick={() => setListMode('following')}>
                    <span className="font-bold">{following}</span>{' '}
                    <span className="text-muted-foreground">Following</span>
                  </button>
                </div>
              </div>
            </div>

            {profile?.description && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-sm">{profile.description}</p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1"
                variant={isFollowing ? 'secondary' : 'default'}
                onClick={() => (user ? toggleFollow() : navigate('/login'))}
              >
                {isFollowing ? (
                  <><UserCheck className="mr-1 h-4 w-4" />Segui già</>
                ) : (
                  <><UserPlus className="mr-1 h-4 w-4" />Segui</>
                )}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => (user ? navigate(`/messages/${userId}`) : navigate('/login'))}
              >
                <MessageCircle className="mr-1 h-4 w-4" />
                Invia Messaggio
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-primary" />
              La Sua Mappa del Mondo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileTravelMap places={places} countries={countries} />
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <div className="text-3xl font-bold text-primary">{countries.length}</div>
                <div className="text-sm text-muted-foreground">Paesi visitati</div>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <div className="text-3xl font-bold text-accent">{worldPercentage}%</div>
                <div className="text-sm text-muted-foreground">del mondo esplorato</div>
              </div>
            </div>
            <Progress value={worldPercentage} aria-label="Percentuale di mondo esplorato" />
            <p className="text-xs text-muted-foreground">
              {mapLoading ? 'Calcolo dei paesi visitati in corso...' : `${countries.length} paesi su 195 nel mondo`}
            </p>
            {countries.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {countries.map((c) => (
                  <Badge key={c.countryCode || c.country} variant="secondary">
                    {c.country}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Images className="mr-2 h-5 w-5 text-primary" />
              I Suoi Post e Foto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfilePostsGrid trips={entries} places={places} currentUserId={null} />
          </CardContent>
        </Card>
      </div>

      {userId && (
        <FollowListDialog
          open={!!listMode}
          onOpenChange={(open) => !open && setListMode(null)}
          mode={listMode ?? 'followers'}
          userId={userId}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default PublicProfile;
