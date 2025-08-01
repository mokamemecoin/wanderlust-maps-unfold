import { useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import { MiomondoLogo } from "@/components/MiomondoLogo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Users, Heart, MessageCircle, Camera, Plus } from "lucide-react";

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
  const [userTrips, setUserTrips] = useState(trips);
  const [likes, setLikes] = useState<{[key: number]: number}>({});
  const [newTrip, setNewTrip] = useState({
    title: "",
    location: "",
    description: "",
    duration: "",
    date: ""
  });

  const toggleLike = (tripId: number) => {
    setLikes(prev => ({
      ...prev,
      [tripId]: (prev[tripId] || 0) + 1
    }));
  };

  const addTrip = () => {
    if (newTrip.title && newTrip.location) {
      const trip = {
        id: userTrips.length + 1,
        ...newTrip,
        author: "Tu",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
        participants: 1,
        likes: 0,
        comments: 0,
        photos: 0,
        tags: ["Nuovo"]
      };
      setUserTrips([trip, ...userTrips]);
      setNewTrip({ title: "", location: "", description: "", duration: "", date: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <MiomondoLogo size="w-6 h-6" />
              <span className="text-lg font-bold text-foreground">Miomondo</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-xl font-bold text-foreground">I Miei Viaggi</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/signup">Crea Account</Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Rivivi le tue avventure</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Viaggio</DialogTitle>
                <DialogDescription>Condividi la tua ultima avventura</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titolo</Label>
                  <Input
                    id="title"
                    value={newTrip.title}
                    onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
                    placeholder="Es. Weekend a Roma"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Destinazione</Label>
                  <Input
                    id="location"
                    value={newTrip.location}
                    onChange={(e) => setNewTrip({...newTrip, location: e.target.value})}
                    placeholder="Es. Roma, Italia"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={newTrip.description}
                    onChange={(e) => setNewTrip({...newTrip, description: e.target.value})}
                    placeholder="Racconta la tua esperienza..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Durata</Label>
                    <Input
                      id="duration"
                      value={newTrip.duration}
                      onChange={(e) => setNewTrip({...newTrip, duration: e.target.value})}
                      placeholder="Es. 3 giorni"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      value={newTrip.date}
                      onChange={(e) => setNewTrip({...newTrip, date: e.target.value})}
                      placeholder="Es. Marzo 2024"
                    />
                  </div>
                </div>
                
                <Button onClick={addTrip} className="w-full">
                  Aggiungi Viaggio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="p-4">
          
          <div className="space-y-6">
          {userTrips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={trip.image} 
                  alt={trip.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2">
                    <h3 className="text-white font-bold text-sm mb-1">{trip.title}</h3>
                    <p className="text-white/80 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trip.location}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={trip.authorAvatar} alt={trip.author} />
                    <AvatarFallback>{trip.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-foreground">{trip.author}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{trip.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{trip.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{trip.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {trip.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => toggleLike(trip.id)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      <span>{trip.likes + (likes[trip.id] || 0)}</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{trip.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>{trip.photos}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {trip.duration}
                  </Badge>
                </div>
                
                <Button asChild className="w-full" size="sm">
                  <Link to="/experiences">
                    <MapPin className="w-4 h-4 mr-2" />
                    Rivivi il Viaggio
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Trips;