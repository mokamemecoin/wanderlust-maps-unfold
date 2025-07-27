import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MiomondoLogo } from "@/components/MiomondoLogo";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <div className="flex flex-col items-center space-y-4">
          <MiomondoLogo />
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Benvenuto in Miomondo
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Esplora il mondo, scopri nuove destinazioni e vivi esperienze indimenticabili
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/signup">Log In</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/map">Esplora la Mappa</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;