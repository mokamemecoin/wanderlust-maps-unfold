import { MapPin, Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TravelFooter = () => {
  return (
    <footer className="bg-gradient-to-br from-primary to-primary/80 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Miomondo</span>
            </div>
            <p className="text-white/80 mb-6">
              La piattaforma sociale per viaggiatori che vogliono condividere e scoprire avventure autentiche.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Esplora</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Destinazioni Popolari</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Storie di Viaggio</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Guide Locali</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Consigli di Viaggio</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Community</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Unisciti a Noi</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Forum</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Eventi</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Trova Compagni</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Supporto</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Centro Aiuto</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Contattaci</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Termini</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8 mt-12 text-center">
          <p className="text-white/60">
            © 2024 Miomondo. Tutti i diritti riservati. Creato con ❤️ per i viaggiatori.
          </p>
        </div>
      </div>
    </footer>
  );
};