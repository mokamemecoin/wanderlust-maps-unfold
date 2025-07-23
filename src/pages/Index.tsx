import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelHero } from "@/components/TravelHero";
import { TravelFeatures } from "@/components/TravelFeatures";
import { InteractiveGlobe } from "@/components/InteractiveGlobe";
import { TravelGallery } from "@/components/TravelGallery";
import { TravelFooter } from "@/components/TravelFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <TravelNavigation />
      <InteractiveGlobe />
      <TravelFeatures />
      <TravelGallery />
      <TravelFooter />
    </div>
  );
};

export default Index;
