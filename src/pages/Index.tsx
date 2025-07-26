import OpenStreetMap from "@/components/OpenStreetMap";
import BottomNavigation from "@/components/BottomNavigation";
import { Link } from "react-router-dom";
import { MiomondoLogo } from "@/components/MiomondoLogo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border/50 h-16">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center h-full">
            <Link to="/" className="flex items-center gap-2">
              <MiomondoLogo size="w-8 h-8" />
              <span className="text-lg font-bold text-foreground">Miomondo</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Map View */}
      <div className="h-screen pt-16 pb-16 relative">
        <OpenStreetMap />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
