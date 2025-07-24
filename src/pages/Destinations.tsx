import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelFooter } from "@/components/TravelFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Users, Camera } from "lucide-react";

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
  return (
    <div className="min-h-screen">
      <TravelNavigation />
      
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ispirazioni di <span className="text-accent">Viaggio</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lasciati ispirare dalle destinazioni più straordinarie del mondo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden bg-gradient-card hover:shadow-travel transition-all duration-300 hover:scale-105 group border-border/50">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white text-sm font-medium">{destination.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-foreground">{destination.name}</h3>
                    <p className="text-muted-foreground text-sm">{destination.country}</p>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{destination.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{destination.visitors}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Camera className="w-4 h-4" />
                      <span>{destination.photos}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {destination.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Pianifica Viaggio
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

export default Destinations;