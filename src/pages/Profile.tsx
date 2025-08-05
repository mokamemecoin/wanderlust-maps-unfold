import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouteProtection } from "@/hooks/useRouteProtection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, LogOut, Plus, Edit, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AddTripDialog } from "@/components/AddTripDialog";

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);

  // Protect route - require authentication
  useRouteProtection(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setUserProfile(profile);

      // Load user trips
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;
      setUserTrips(trips || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
  }

  if (!user) return null;

  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : user.user_metadata?.first_name && user.user_metadata?.last_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : 'Utente';

  const initials = userProfile?.first_name && userProfile?.last_name
    ? `${userProfile.first_name[0]}${userProfile.last_name[0]}`
    : user.user_metadata?.first_name && user.user_metadata?.last_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`
    : user.email?.[0].toUpperCase();

  const currentTrips = userTrips.filter(trip => trip.is_current);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Il Mio Profilo</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                {userProfile?.avatar_url ? (
                  <AvatarImage src={userProfile.avatar_url} alt="Avatar" />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{displayName}</CardTitle>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Mail className="w-4 h-4 mr-1" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {userProfile?.phone && (
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <Phone className="w-4 h-4 mr-1" />
                    <span className="text-sm">{userProfile.phone}</span>
                  </div>
                )}
                {userProfile?.location && (
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{userProfile.location}</span>
                  </div>
                )}
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  Membro dal {new Date(user.created_at).toLocaleDateString('it-IT')}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditProfile(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Modifica
              </Button>
            </div>
            {userProfile?.description && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{userProfile.description}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Current Trips */}
        {currentTrips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <MapPin className="w-5 h-5 mr-2" />
                Viaggi in Corso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">{trip.title}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">{trip.location}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      In corso
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Travel Statistics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Le Mie Esperienze di Viaggio
              </CardTitle>
              <Button onClick={() => setShowAddTrip(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Aggiungi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userTrips.length}</div>
                <div className="text-sm text-muted-foreground">Viaggi totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{new Set(userTrips.map(trip => trip.location)).size}</div>
                <div className="text-sm text-muted-foreground">Luoghi visitati</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentTrips.length}</div>
                <div className="text-sm text-muted-foreground">In viaggio ora</div>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="space-y-3">
              <h3 className="font-semibold">Viaggi Recenti</h3>
              {userTrips.length > 0 ? (
                userTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {trip.photo_url ? (
                        <img 
                          src={trip.photo_url} 
                          alt={trip.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{trip.title}</div>
                        <div className="text-sm text-muted-foreground">{trip.location}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(trip.created_at).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {trip.is_current && (
                        <Badge variant="outline" className="border-green-500 text-green-700 mb-1">
                          In corso
                        </Badge>
                      )}
                      {!trip.is_current && (
                        <Badge variant="secondary">Completato</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Non hai ancora registrato nessun viaggio.
                  </p>
                  <Button onClick={() => setShowAddTrip(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi il tuo primo viaggio
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        user={user}
        userProfile={userProfile}
        onProfileUpdated={loadUserData}
      />

      <AddTripDialog
        open={showAddTrip}
        onOpenChange={setShowAddTrip}
        user={user}
        onTripAdded={loadUserData}
      />
    </div>
  );
};

export default Profile;