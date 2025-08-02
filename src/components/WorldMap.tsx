import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Users, User } from "lucide-react";

// Dati degli utenti attivi nel mondo
const activeUsers = [
  {
    id: 1,
    name: "Marco Rossi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Tokyo, Giappone",
    position: { x: 75, y: 35 },
    activity: "Visitando il tempio Senso-ji"
  },
  {
    id: 2,
    name: "Sofia Bianchi",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    location: "New York, USA",
    position: { x: 25, y: 40 },
    activity: "Central Park tour"
  },
  {
    id: 3,
    name: "Luca Ferrari",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: "Parigi, Francia",
    position: { x: 50, y: 30 },
    activity: "Torre Eiffel al tramonto"
  },
  {
    id: 4,
    name: "Elena Costa",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    location: "Sydney, Australia",
    position: { x: 80, y: 75 },
    activity: "Opera House tour"
  },
  {
    id: 5,
    name: "Andrea Conti",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: "Londra, Regno Unito",
    position: { x: 48, y: 25 },
    activity: "British Museum"
  },
  {
    id: 6,
    name: "Giulia Romano",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    location: "Rio de Janeiro, Brasile",
    position: { x: 30, y: 65 },
    activity: "Cristo Redentore"
  }
];

const WorldMap = () => {
  const [selectedUser, setSelectedUser] = useState<typeof activeUsers[0] | null>(null);
  const navigate = useNavigate();

  const handleViewProfile = (userId: number) => {
    navigate(`/users?profile=${userId}`);
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 mt-6 md:mt-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Viaggiatori <span className="text-primary">in Viaggio</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Scopri dove stanno viaggiando i nostri utenti in questo momento
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">{activeUsers.length} viaggiatori in movimento</span>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-2 md:px-0">
          {/* Mappa del mondo dettagliata */}
          <div className="relative w-full h-[320px] md:h-[450px] lg:h-[550px] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/40 dark:to-blue-900/40 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/20">
            {/* SVG mappa più dettagliata */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full">
              {/* Oceani */}
              <rect width="1000" height="500" fill="hsl(var(--primary) / 0.1)" />
              
              {/* Nord America - più dettagliato */}
              <path d="M80,80 Q120,60 180,70 Q240,65 290,90 Q340,100 360,130 Q370,160 350,180 Q320,200 280,190 Q240,180 180,170 Q120,160 90,140 Q60,120 80,80 Z" 
                    fill="hsl(var(--accent))" fillOpacity="0.4" stroke="hsl(var(--accent))" strokeWidth="2" />
              
              {/* Sud America - forma più realistica */}
              <path d="M200,260 Q220,250 240,260 Q260,270 280,300 Q300,340 290,380 Q280,420 260,440 Q240,430 220,400 Q200,360 190,320 Q180,280 200,260 Z" 
                    fill="hsl(var(--nature))" fillOpacity="0.4" stroke="hsl(var(--nature))" strokeWidth="2" />
              
              {/* Europa */}
              <path d="M450,60 Q490,50 530,60 Q550,70 560,90 Q570,110 560,130 Q540,150 510,140 Q480,130 450,120 Q430,100 450,60 Z" 
                    fill="hsl(var(--primary))" fillOpacity="0.4" stroke="hsl(var(--primary))" strokeWidth="2" />
              
              {/* Africa - dettagliata */}
              <path d="M460,160 Q500,150 540,160 Q560,170 570,200 Q580,240 570,280 Q560,320 540,350 Q520,360 500,350 Q480,330 470,300 Q460,260 455,220 Q450,180 460,160 Z" 
                    fill="hsl(var(--accent))" fillOpacity="0.4" stroke="hsl(var(--accent))" strokeWidth="2" />
              
              {/* Asia - estesa */}
              <path d="M580,40 Q660,30 740,40 Q820,50 880,70 Q920,90 940,120 Q950,150 930,170 Q900,180 860,170 Q800,160 740,150 Q680,140 630,130 Q590,110 580,40 Z" 
                    fill="hsl(var(--nature))" fillOpacity="0.4" stroke="hsl(var(--nature))" strokeWidth="2" />
              
              {/* Australia */}
              <path d="M760,320 Q800,310 840,320 Q870,330 880,350 Q870,370 840,380 Q800,375 760,365 Q740,355 760,320 Z" 
                    fill="hsl(var(--primary))" fillOpacity="0.4" stroke="hsl(var(--primary))" strokeWidth="2" />
              
              {/* Isole e dettagli aggiuntivi */}
              {/* Groenlandia */}
              <path d="M360,20 Q400,15 430,25 Q440,40 430,55 Q400,60 360,55 Q340,40 360,20 Z" 
                    fill="hsl(var(--muted-foreground))" fillOpacity="0.3" />
              
              {/* Madagascar */}
              <path d="M600,300 Q610,290 620,300 Q625,320 620,340 Q610,350 600,340 Q595,320 600,300 Z" 
                    fill="hsl(var(--accent))" fillOpacity="0.3" />
              
              {/* Giappone */}
              <path d="M900,130 Q910,125 920,135 Q925,145 920,155 Q910,160 900,155 Q895,145 900,130 Z" 
                    fill="hsl(var(--nature))" fillOpacity="0.3" />
            </svg>

            {/* Marker viaggiatori in movimento */}
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 z-10"
                style={{ left: `${user.position.x}%`, top: `${user.position.y}%` }}
                onClick={() => setSelectedUser(user)}
              >
                <div className="relative">
                  {/* Triple pulse effect for traveling users */}
                  <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping animation-delay-0"></div>
                  <div className="absolute inset-0 w-10 h-10 bg-accent/30 rounded-full animate-ping animation-delay-300"></div>
                  <div className="absolute inset-0 w-8 h-8 bg-primary/40 rounded-full animate-ping animation-delay-600"></div>
                  
                  {/* Main marker */}
                  <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full border-3 border-white shadow-xl flex items-center justify-center">
                    <div className="text-white text-sm">✈️</div>
                  </div>
                  
                  {/* Travel status indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Info panel del viaggiatore selezionato - Mobile First */}
          {selectedUser && (
            <Card className="absolute bottom-2 md:bottom-4 left-2 right-2 md:left-auto md:right-4 md:w-80 p-3 md:p-4 bg-white/95 dark:bg-card/95 backdrop-blur-md border-primary/30 shadow-2xl z-20">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 md:w-12 md:h-12">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback>{selectedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 text-xs">✈️</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm md:text-base">{selectedUser.name}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-xs md:text-sm text-muted-foreground truncate">{selectedUser.location}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedUser.activity}
                  </Badge>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleViewProfile(selectedUser.id)}
                      className="text-xs px-2 py-1 h-6"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Profilo
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedUser(null)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Lista viaggiatori per mobile */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
          {activeUsers.map((user) => (
            <Card 
              key={user.id} 
              className="p-3 bg-white/90 dark:bg-card/90 backdrop-blur-sm border-primary/20 cursor-pointer hover:bg-white/95 dark:hover:bg-card/95 transition-all"
              onClick={() => handleViewProfile(user.id)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{user.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{user.location}</p>
                </div>
                <div className="text-sm">✈️</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldMap;