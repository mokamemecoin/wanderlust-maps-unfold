import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Camera } from "lucide-react";

const users = [
  {
    id: 1,
    name: "Marco Rossi",
    username: "@marco_travel",
    location: "Milano, Italia",
    trips: 23,
    photos: 456,
    rating: 4.8,
    bio: "Appassionato di fotografia e viaggi. Amo scoprire luoghi nascosti e culture autentiche.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Sofia Bianchi",
    username: "@sofia_wanderer",
    location: "Roma, Italia",
    trips: 31,
    photos: 672,
    rating: 4.9,
    bio: "Travel blogger e guida turistica. Specializzata in viaggi culturali e gastronomici.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b0c0?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Alessandro Verde",
    username: "@alex_explorer",
    location: "Napoli, Italia",
    trips: 18,
    photos: 289,
    rating: 4.7,
    bio: "Amante dell'avventura e dei trekking. Sempre alla ricerca di nuove sfide.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Giulia Romano",
    username: "@giulia_globe",
    location: "Torino, Italia",
    trips: 27,
    photos: 534,
    rating: 4.8,
    bio: "Fotografa professionista specializzata in paesaggi e wildlife.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  }
];

const Users = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-primary text-white p-4">
        <h1 className="text-xl font-semibold">Community Viaggiatori</h1>
        <p className="text-sm text-white/80">Connettiti con viaggiatori da tutto il mondo</p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-primary/10 to-accent/10">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="absolute bottom-2 left-4 w-16 h-16 rounded-full border-3 border-white shadow-lg object-cover"
                />
              </div>
              
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="text-sm">@{user.username}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{user.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{user.location}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex justify-between text-center mb-3">
                  <div>
                    <div className="text-xl font-bold text-primary">{user.trips}</div>
                    <div className="text-xs text-muted-foreground">Viaggi</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-accent">{user.photos}</div>
                    <div className="text-xs text-muted-foreground">Foto</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {user.bio}
                </p>
                
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
                  Vedi Profilo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Users;