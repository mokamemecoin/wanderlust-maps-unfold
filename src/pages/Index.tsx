import { useState } from "react";
import OpenStreetMap from "@/components/OpenStreetMap";
import BottomNavigation from "@/components/BottomNavigation";
import { Link } from "react-router-dom";
import { MiomondoLogo } from "@/components/MiomondoLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Qui andrà la logica di ricerca
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center gap-2">
              <MiomondoLogo size="w-6 h-6" />
              <span className="text-lg font-bold text-foreground">Miomondo</span>
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations, experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Map View */}
      <div className="h-screen pt-24 pb-16 relative">
        <OpenStreetMap />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
