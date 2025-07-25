import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelFeatures } from "@/components/TravelFeatures";
import { TravelFooter } from "@/components/TravelFooter";
import WorldMap from "@/components/WorldMap";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import worldPatternBg from "@/assets/world-pattern-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${worldPatternBg})` }}>
      <TravelNavigation />
      
      {/* Hero Section with Start Journey Button */}
      <section className="relative min-h-screen flex items-start justify-center pt-20 md:pt-32 bg-gradient-to-br from-primary/15 via-background/85 to-accent/15">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-up mb-12 md:mb-16">
            <Link to="/signup">
              <Button size="xl" className="w-72 md:w-80 h-14 md:h-16 text-lg md:text-xl bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                Inizia il Viaggio
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 md:mt-16">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 animate-fade-up [animation-delay:0.2s]">
              Benvenuto su <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Miomondo</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-up [animation-delay:0.4s]">
              Scopri il mondo attraverso le esperienze di altri viaggiatori
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center animate-fade-up [animation-delay:0.6s] mb-8 md:mb-12">
            <Link to="/users">
              <Button size="lg" className="w-56 md:w-64 h-16 md:h-20 text-base md:text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                <Users className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                Users
              </Button>
            </Link>
            
            <Link to="/destinations">
              <Button size="lg" className="w-56 md:w-64 h-16 md:h-20 text-base md:text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                Destinations
              </Button>
            </Link>
            
            <Link to="/trips">
              <Button size="lg" className="w-56 md:w-64 h-16 md:h-20 text-base md:text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                <Plane className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                Trips
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* World Map Section */}
      <WorldMap />
      
      <TravelFeatures />
      <TravelFooter />
    </div>
  );
};

export default Index;
