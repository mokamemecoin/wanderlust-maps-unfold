import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MiomondoLogo } from "@/components/MiomondoLogo";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";

const Welcome = () => {
  const { user, signOut } = useAuth();
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center pb-16">
        <div className="text-center space-y-8 px-4">
          <div className="flex flex-col items-center space-y-4">
            <MiomondoLogo />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Welcome to Miomondo
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Explore the world, discover new destinations and live unforgettable experiences
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => signOut()}>
                Log Out
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link to="/map">Explore Map</Link>
            </Button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
};

export default Welcome;