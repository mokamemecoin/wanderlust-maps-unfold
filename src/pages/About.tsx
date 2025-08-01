import { TravelNavigation } from "@/components/TravelNavigation";
import { TravelFooter } from "@/components/TravelFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, Heart, Code } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <TravelNavigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About Miomondo
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the story behind our passion for travel and how we're building 
              the future of travel experiences.
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Miomondo was born from a simple belief: travel should be accessible, inspiring, and transformative for everyone. 
                We envision a world where discovering new destinations, connecting with fellow travelers, and sharing unforgettable 
                experiences is just a click away. Our platform is designed to bridge cultures, create lasting friendships, 
                and make the world feel a little smaller and more connected.
              </p>
            </CardContent>
          </Card>

          {/* How It Was Created */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  How It Was Built
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Miomondo was crafted using cutting-edge web technologies to ensure a seamless and responsive experience:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>React & TypeScript</strong> for robust, type-safe development</li>
                  <li>• <strong>Tailwind CSS</strong> for beautiful, responsive design</li>
                  <li>• <strong>Vite</strong> for lightning-fast development and builds</li>
                  <li>• <strong>Supabase</strong> for secure backend services and real-time data</li>
                  <li>• <strong>Lovable</strong> platform for rapid prototyping and deployment</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-primary" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Every feature and design decision is guided by our core values:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Accessibility</strong> - Travel planning for everyone</li>
                  <li>• <strong>Community</strong> - Connecting travelers worldwide</li>
                  <li>• <strong>Authenticity</strong> - Real experiences, genuine connections</li>
                  <li>• <strong>Innovation</strong> - Constantly improving the travel experience</li>
                  <li>• <strong>Sustainability</strong> - Promoting responsible tourism</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-3 mb-4">
                <Users className="w-8 h-8 text-primary" />
                What Makes Us Special
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="text-xl font-semibold mb-3">Interactive World Map</h4>
                  <p className="text-muted-foreground">
                    Explore destinations through our immersive 3D globe and detailed maps
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-3">Travel Community</h4>
                  <p className="text-muted-foreground">
                    Connect with like-minded travelers and share your adventures
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-3">Personalized Experiences</h4>
                  <p className="text-muted-foreground">
                    Curated travel recommendations based on your preferences
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Vision */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Looking Forward</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                We're just getting started. Our roadmap includes AI-powered travel recommendations, 
                virtual reality destination previews, carbon footprint tracking for sustainable travel, 
                and partnerships with local communities worldwide. Join us on this journey as we reshape 
                how the world travels and connects.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <TravelFooter />
    </div>
  );
};

export default About;