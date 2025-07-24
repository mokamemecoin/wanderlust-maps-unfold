import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users } from "lucide-react";

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

  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 mt-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Viaggiatori <span className="text-primary">Attivi</span> nel Mondo
          </h2>
          <p className="text-lg text-muted-foreground">
            Scopri dove stanno esplorando i nostri utenti in questo momento
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">{activeUsers.length} viaggiatori online</span>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Mappa del mondo stilizzata */}
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl overflow-hidden shadow-lg border border-border/50">
            {/* Continenti stilizzati */}
            <div className="absolute inset-0">
              {/* Nord America */}
              <div className="absolute w-24 h-32 bg-green-200 dark:bg-green-800/40 rounded-lg transform rotate-12" 
                   style={{ left: '15%', top: '20%' }}></div>
              {/* Sud America */}
              <div className="absolute w-16 h-28 bg-green-200 dark:bg-green-800/40 rounded-lg transform -rotate-12" 
                   style={{ left: '22%', top: '45%' }}></div>
              {/* Europa */}
              <div className="absolute w-20 h-20 bg-green-200 dark:bg-green-800/40 rounded-lg" 
                   style={{ left: '45%', top: '15%' }}></div>
              {/* Africa */}
              <div className="absolute w-18 h-24 bg-green-200 dark:bg-green-800/40 rounded-lg" 
                   style={{ left: '48%', top: '35%' }}></div>
              {/* Asia */}
              <div className="absolute w-32 h-28 bg-green-200 dark:bg-green-800/40 rounded-lg transform rotate-6" 
                   style={{ left: '60%', top: '20%' }}></div>
              {/* Australia */}
              <div className="absolute w-16 h-12 bg-green-200 dark:bg-green-800/40 rounded-lg" 
                   style={{ left: '75%', top: '65%' }}></div>
            </div>

            {/* Marker degli utenti */}
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110"
                style={{ left: `${user.position.x}%`, top: `${user.position.y}%` }}
                onClick={() => setSelectedUser(user)}
              >
                <div className="relative">
                  {/* Pulse animation */}
                  <div className="absolute inset-0 w-8 h-8 bg-primary/30 rounded-full animate-ping"></div>
                  <div className="relative w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info panel dell'utente selezionato */}
          {selectedUser && (
            <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 bg-gradient-card border-border/50 shadow-lg">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{selectedUser.name}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-sm text-muted-foreground">{selectedUser.location}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedUser.activity}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Lista utenti per mobile */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
          {activeUsers.map((user) => (
            <Card key={user.id} className="p-4 bg-gradient-card border-border/50">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">{user.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldMap;