import { MapPin, Camera, Share2, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [];

export const TravelFeatures = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Il Tuo <span className="text-primary">Diario di Viaggio</span> Digitale
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Strumenti potenti per documentare, condividere e pianificare le tue avventure
          </p>
        </div>
        
        {features.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 text-center bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 hover:scale-105 group"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};