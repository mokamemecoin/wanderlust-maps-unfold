import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelFooter } from "@/components/TravelFooter";
import { Card } from "@/components/ui/card";
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
    <div className="min-h-screen">
      <TravelNavigation />
      
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Comunità di <span className="text-accent">Viaggiatori</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connettiti con altri esploratori e condividi le tue avventure
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {users.map((user) => (
              <Card key={user.id} className="p-6 bg-gradient-card hover:shadow-travel transition-all duration-300 hover:scale-105 border-border/50">
                <div className="text-center mb-4">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-bold text-foreground text-lg">{user.name}</h3>
                  <p className="text-muted-foreground text-sm">{user.username}</p>
                  
                  <div className="flex items-center justify-center gap-1 mt-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{user.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{user.rating}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.trips}</div>
                    <div className="text-xs text-muted-foreground">Viaggi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{user.photos}</div>
                    <div className="text-xs text-muted-foreground">Foto</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{user.bio}</p>
                
                <Button className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Vedi Profilo
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <TravelFooter />
    </div>
  );
};

export default Users;