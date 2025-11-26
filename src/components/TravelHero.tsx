import { Button } from "@/components/ui/button";
import { MapPin, Camera, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-travel.jpg";

export const TravelHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-accent/30" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-up">
            Traccia i Tuoi
            <span className="block bg-gradient-to-r from-accent-glow to-primary-glow bg-clip-text text-transparent">
              Viaggi Indimenticabili
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-up [animation-delay:0.2s]">
            Condividi le tue avventure, scopri nuove destinazioni e ispirati 
            attraverso le mappe personalizzate di altri viaggiatori.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up [animation-delay:0.4s]">
            <Button asChild variant="hero" size="xl" className="text-lg">
              <Link to="/signup">
                <MapPin className="mr-2" />
                Inizia il Tuo Viaggio
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="text-lg bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/destinations">
                <Globe className="mr-2" />
                Esplora Destinazioni
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating Stats */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-8 text-white animate-float">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 mr-2" />
            <span className="text-2xl font-bold">10K+</span>
          </div>
          <p className="text-sm opacity-80">Viaggiatori</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Camera className="w-6 h-6 mr-2" />
            <span className="text-2xl font-bold">50K+</span>
          </div>
          <p className="text-sm opacity-80">Esperienze</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <MapPin className="w-6 h-6 mr-2" />
            <span className="text-2xl font-bold">180+</span>
          </div>
          <p className="text-sm opacity-80">Paesi</p>
        </div>
      </div>
    </section>
  );
};