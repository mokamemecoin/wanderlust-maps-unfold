import MapboxMap from "@/components/MapboxMap";
import BottomNavigation from "@/components/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Map View */}
      <div className="h-screen relative">
        <MapboxMap />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
