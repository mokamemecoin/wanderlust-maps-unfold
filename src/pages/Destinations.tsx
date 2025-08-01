import { useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import { MiomondoLogo } from "@/components/MiomondoLogo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Users, Camera, Search, Heart, Filter } from "lucide-react";

const destinations = [
  {
    id: 1,
    name: "Santorini",
    country: "Grecia",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    description: "Isola vulcanica famosa per i suoi tramonti mozzafiato e l'architettura cicladica unica.",
    rating: 4.9,
    visitors: 1234,
    photos: 5678,
    tags: ["Spiagge", "Romantico", "Fotografia", "Tramonti"]
  },
  {
    id: 2,
    name: "Kyoto",
    country: "Giappone",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
    description: "Antica capitale del Giappone, ricca di templi, giardini zen e tradizioni millenarie.",
    rating: 4.8,
    visitors: 2156,
    photos: 7891,
    tags: ["Cultura", "Templi", "Tradizioni", "Zen"]
  },
  {
    id: 3,
    name: "Machu Picchu",
    country: "Perù",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop",
    description: "Cittadella Inca tra le nuvole, una delle sette meraviglie del mondo moderno.",
    rating: 4.9,
    visitors: 987,
    photos: 3456,
    tags: ["Storia", "Trekking", "Montagne", "Archeologia"]
  },
  {
    id: 4,
    name: "Isole Lofoten",
    country: "Norvegia",
    image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&h=300&fit=crop",
    description: "Arcipelago artico famoso per l'aurora boreale e i paesaggi drammatici.",
    rating: 4.7,
    visitors: 654,
    photos: 2134,
    tags: ["Aurora Boreale", "Natura", "Pesca", "Artico"]
  },
  {
    id: 5,
    name: "Bagan",
    country: "Myanmar",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop",
    description: "Pianura archeologica con migliaia di templi e pagode antiche.",
    rating: 4.6,
    visitors: 432,
    photos: 1876,
    tags: ["Templi", "Storia", "Spiritualità", "Alba"]
  },
  {
    id: 6,
    name: "Petra",
    country: "Giordania",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    description: "Città rosa scolpita nella roccia, patrimonio UNESCO e meraviglia archeologica.",
    rating: 4.8,
    visitors: 876,
    photos: 4321,
    tags: ["Archeologia", "Deserto", "Storia", "UNESCO"]
  }
];

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           dest.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <MiomondoLogo size="w-6 h-6" />
              <span className="text-lg font-bold text-foreground">Miomondo</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-xl font-bold text-foreground">Destinazioni</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/signup">Registrati Gratis</Link>
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca destinazioni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="spiagge">Spiagge</SelectItem>
                <SelectItem value="cultura">Cultura</SelectItem>
                <SelectItem value="natura">Natura</SelectItem>
                <SelectItem value="storia">Storia</SelectItem>
                <SelectItem value="avventura">Avventura</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="p-4">
          
          <div className="grid gap-6">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white"
                  onClick={() => toggleFavorite(destination.id)}
                >
                  <Heart 
                    className={`w-5 h-5 ${favorites.includes(destination.id) ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-white text-xs font-medium">{destination.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-foreground">{destination.name}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {destination.country}
                  </p>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{destination.description}</p>
                
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{destination.visitors}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{destination.photos}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {destination.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button asChild className="w-full" size="sm">
                  <Link to="/trips">
                    <MapPin className="w-4 h-4 mr-2" />
                    Pianifica Viaggio
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

export default Destinations;