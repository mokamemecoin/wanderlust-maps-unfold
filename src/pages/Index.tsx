import OpenStreetMap from "@/components/OpenStreetMap";
import BottomNavigation from "@/components/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Map View */}
      <div className="h-screen relative">
        <OpenStreetMap />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
