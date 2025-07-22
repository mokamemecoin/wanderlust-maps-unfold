import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MapPin, Eye } from "lucide-react";

const travelPosts = [
  {
    id: 1,
    user: "Marco Rossi",
    location: "Santorini, Grecia",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    description: "Tramonti mozzafiato nelle Cicladi",
    likes: 156,
    comments: 23
  },
  {
    id: 2,
    user: "Sofia Bianchi",
    location: "Kyoto, Giappone",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
    description: "Templi antichi e cultura millenaria",
    likes: 243,
    comments: 41
  },
  {
    id: 3,
    user: "Alessandro Verde",
    location: "Machu Picchu, Perù",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop",
    description: "L'incredibile cittadella Inca tra le nuvole",
    likes: 389,
    comments: 67
  },
  {
    id: 4,
    user: "Giulia Romano",
    location: "Isole Lofoten, Norvegia",
    image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&h=300&fit=crop",
    description: "Aurora boreale sopra i fiordi",
    likes: 201,
    comments: 34
  },
  {
    id: 5,
    user: "Matteo Costa",
    location: "Bagan, Myanmar",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop",
    description: "Migliaia di pagode all'alba",
    likes: 178,
    comments: 28
  },
  {
    id: 6,
    user: "Francesca Marino",
    location: "Petra, Giordania",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    description: "La città rosa scolpita nella roccia",
    likes: 295,
    comments: 52
  }
];

export const TravelGallery = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Esperienze <span className="text-accent">Condivise</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Lasciati ispirare dalle avventure di altri viaggiatori e condividi le tue storie
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {travelPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden bg-gradient-card hover:shadow-travel transition-all duration-300 hover:scale-105 group border-border/50">
              {/* Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.location}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {post.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{post.user}</span>
                </div>
                
                <h3 className="font-semibold text-foreground mb-2">{post.location}</h3>
                <p className="text-muted-foreground text-sm mb-4">{post.description}</p>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    <Eye className="w-4 h-4 mr-1" />
                    Vedi Mappa
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="travel" size="lg">
            Scopri Altre Storie
          </Button>
        </div>
      </div>
    </section>
  );
};