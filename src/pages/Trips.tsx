import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelFooter } from "@/components/TravelFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Users, Heart, MessageCircle, Camera } from "lucide-react";

const trips = [
  {
    id: 1,
    title: "Isole Greche in Primavera",
    author: "Marco Rossi",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Santorini → Mykonos → Creta",
    duration: "10 giorni",
    date: "Aprile 2024",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    description: "Un viaggio incredibile attraverso le isole più belle della Grecia, tra tramonti mozzafiato e cultura millenaria.",
    participants: 4,
    likes: 156,
    comments: 23,
    photos: 87,
    tags: ["Mare", "Cultura", "Relax", "Fotografia"]
  },
  {
    id: 2,
    title: "Giappone: Tradizione e Modernità",
    author: "Sofia Bianchi",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b0c0?w=150&h=150&fit=crop&crop=face",
    location: "Tokyo → Kyoto → Osaka",
    duration: "14 giorni",
    date: "Marzo 2024",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
    description: "Esperienza unica nel Sol Levante, dai grattacieli di Tokyo ai templi zen di Kyoto.",
    participants: 2,
    likes: 243,
    comments: 41,
    photos: 156,
    tags: ["Cultura", "Gastronomia", "Templi", "Tecnologia"]
  },
  {
    id: 3,
    title: "Avventura Andina in Perù",
    author: "Alessandro Verde",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: "Lima → Cusco → Machu Picchu",
    duration: "8 giorni",
    date: "Maggio 2024",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop",
    description: "Trekking verso la cittadella Inca perduta, un'esperienza che cambia la vita.",
    participants: 6,
    likes: 389,
    comments: 67,
    photos: 124,
    tags: ["Trekking", "Storia", "Avventura", "Montagne"]
  },
  {
    id: 4,
    title: "Aurora Boreale in Norvegia",
    author: "Giulia Romano",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    location: "Tromsø → Isole Lofoten",
    duration: "7 giorni",
    date: "Febbraio 2024",
    image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&h=300&fit=crop",
    description: "Caccia all'aurora boreale tra i fiordi norvegesi, un spettacolo della natura indimenticabile.",
    participants: 3,
    likes: 201,
    comments: 34,
    photos: 78,
    tags: ["Aurora", "Natura", "Fotografia", "Inverno"]
  }
];

const Trips = () => {
  return (
    <div className="min-h-screen">
      <TravelNavigation />
      
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              I Miei <span className="text-accent">Viaggi</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rivivi le tue avventure e i ricordi dei viaggi passati
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {trips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden bg-gradient-card hover:shadow-travel transition-all duration-300 hover:scale-105 group border-border/50">
                <div className="relative overflow-hidden">
                  <img 
                    src={trip.image} 
                    alt={trip.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                      <h3 className="text-white font-bold text-lg mb-1">{trip.title}</h3>
                      <p className="text-white/80 text-sm">{trip.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={trip.authorAvatar} alt={trip.author} />
                      <AvatarFallback>{trip.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{trip.author}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{trip.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{trip.participants}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{trip.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trip.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{trip.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{trip.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        <span>{trip.photos}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {trip.duration}
                    </Badge>
                  </div>
                  
                  <Button className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Rivivi il Viaggio
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <TravelFooter />
    </div>
  );
};

export default Trips;