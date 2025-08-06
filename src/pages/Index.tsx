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
    <div className="min-h-screen bg-background relative">
      {/* Floating Header Section */}
      <div className="absolute top-6 left-4 right-4 z-50">
        <div className="bg-primary/90 backdrop-blur-lg rounded-2xl shadow-xl p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2">
              <MiomondoLogo size="w-6 h-6" />
              <span className="text-lg font-bold">Miomondo</span>
            </Link>
            <Button asChild variant="secondary" size="sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
          
          <div className="mb-3">
            <h2 className="text-xl font-semibold">Viaggiatori in viaggio</h2>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cerca luoghi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
            <Button onClick={handleSearch} size="icon" variant="secondary">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="h-screen pb-16 relative">
        <OpenStreetMap />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
