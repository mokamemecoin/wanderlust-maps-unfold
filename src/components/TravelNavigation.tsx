import { Button } from "@/components/ui/button";
import { Menu, User, Plus } from "lucide-react";
import { MiomondoLogo } from "./MiomondoLogo";
import { useState } from "react";
import { Link } from "react-router-dom";

export const TravelNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo - moved down slightly */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 mt-1 md:mt-0">
            <MiomondoLogo size="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-lg md:text-xl font-bold text-foreground">Miomondo</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#explore" className="text-foreground hover:text-primary transition-colors font-medium">
              Esplora
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors font-medium">
              Community
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              Chi Siamo
            </a>
          </div>
          
          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="adventure" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Viaggio
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Accedi
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 bg-white/95 backdrop-blur-lg">
            <div className="flex flex-col gap-4">
              <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                Home
              </a>
              <a href="#explore" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                Esplora
              </a>
              <a href="#community" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                Community
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                Chi Siamo
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="adventure" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Viaggio
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Accedi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};