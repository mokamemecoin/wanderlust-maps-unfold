import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouteProtection } from "@/hooks/useRouteProtection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userTrips, setUserTrips] = useState<any[]>([]);

  // Protect route - require authentication
  useRouteProtection(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user trips/travels
      const { data: trips, error } = await supabase
        .from('travelers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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

  const initials = user.user_metadata?.first_name?.[0] + user.user_metadata?.last_name?.[0] || user.email?.[0].toUpperCase();

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
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-white text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                </CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  Membro dal {new Date(user.created_at).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Travel Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Le Mie Esperienze di Viaggio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userTrips.length}</div>
                <div className="text-sm text-muted-foreground">Viaggi totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{new Set(userTrips.map(trip => trip.location)).size}</div>
                <div className="text-sm text-muted-foreground">Luoghi visitati</div>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="space-y-3">
              <h3 className="font-semibold">Viaggi Recenti</h3>
              {userTrips.length > 0 ? (
                userTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium">{trip.location}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trip.created_at).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Visitato</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Non hai ancora registrato nessun viaggio. Inizia a viaggiare e condividi le tue esperienze!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Azioni Profilo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Modifica Profilo
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Gestisci i Miei Viaggi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;