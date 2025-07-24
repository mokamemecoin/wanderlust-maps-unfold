import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelFeatures } from "@/components/TravelFeatures";
import { TravelFooter } from "@/components/TravelFooter";
import WorldMap from "@/components/WorldMap";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Plane } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <TravelNavigation />
      
      {/* World Map Section */}
      <WorldMap />
      
      {/* Hero Section with Navigation Buttons */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-up">
            Benvenuto su <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Miomondo</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-up [animation-delay:0.2s]">
            Scopri il mondo attraverso le esperienze di altri viaggiatori
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-fade-up [animation-delay:0.4s]">
            <Link to="/users">
              <Button size="lg" className="w-64 h-20 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                <Users className="w-8 h-8 mr-3" />
                Users
              </Button>
            </Link>
            
            <Link to="/destinations">
              <Button size="lg" className="w-64 h-20 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                <MapPin className="w-8 h-8 mr-3" />
                Destinations
              </Button>
            </Link>
            
            <Link to="/trips">
              <Button size="lg" className="w-64 h-20 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                <Plane className="w-8 h-8 mr-3" />
                Trips
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <TravelFeatures />
      <TravelFooter />
    </div>
  );
};

export default Index;
