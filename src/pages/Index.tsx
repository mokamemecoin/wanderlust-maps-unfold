import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelHero } from "@/components/TravelHero";
import { TravelFeatures } from "@/components/TravelFeatures";
import { TravelGallery } from "@/components/TravelGallery";
import { TravelFooter } from "@/components/TravelFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <TravelNavigation />
      <TravelHero />
      <TravelFeatures />
      <TravelGallery />
      <TravelFooter />
    </div>
  );
};

export default Index;
