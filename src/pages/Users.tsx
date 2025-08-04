import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from "react-router-dom";
import { MiomondoLogo } from "@/components/MiomondoLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from "@/components/UserProfile";
import SocialFeed from "@/components/SocialFeed";
import BottomNavigation from "@/components/BottomNavigation";
import { Search, Plus, Edit } from "lucide-react";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState('feed');
  
  // Dati degli utenti (dovrebbero essere sincronizzati con quelli della mappa)
  const allUsers = {
    1: {
      id: '1',
      name: 'Marco Rossi',
      bio: 'Viaggiatore appassionato | Food lover | 📍 Attualmente in Giappone',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      visitedPlaces: ['Tokyo', 'Parigi', 'New York', 'Londra', 'Roma', 'Bangkok', 'Sydney', 'Barcellona'],
      wishlist: ['Islanda', 'Nuova Zelanda', 'Perù', 'Nepal', 'Madagascar'],
      travelDays: 127,
      followers: 456,
      following: 234,
      currentLocation: 'Tokyo, Giappone'
    },
    2: {
      id: '2',
      name: 'Sofia Bianchi',
      bio: 'Digital nomad | Fotografa | 📍 Esplorando New York',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      visitedPlaces: ['New York', 'Los Angeles', 'Miami', 'San Francisco', 'Boston'],
      wishlist: ['Australia', 'Nuova Zelanda', 'Giappone', 'Corea del Sud'],
      travelDays: 89,
      followers: 312,
      following: 189,
      currentLocation: 'New York, USA'
    },
    3: {
      id: '3',
      name: 'Luca Ferrari',
      bio: 'Chef in viaggio | Amante della cultura francese | 📍 Parigi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      visitedPlaces: ['Parigi', 'Lione', 'Marsiglia', 'Roma', 'Milano'],
      wishlist: ['Giappone', 'Vietnam', 'Thailandia', 'India'],
      travelDays: 156,
      followers: 678,
      following: 245,
      currentLocation: 'Parigi, Francia'
    },
    4: {
      id: '4',
      name: 'Elena Costa',
      bio: 'Architetta | Amante dell\'arte | 📍 Scoprendo Sydney',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      visitedPlaces: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
      wishlist: ['Europa', 'Scandinavia', 'Islanda', 'Groenlandia'],
      travelDays: 67,
      followers: 234,
      following: 156,
      currentLocation: 'Sydney, Australia'
    },
    5: {
      id: '5',
      name: 'Andrea Conti',
      bio: 'Storico dell\'arte | Londinese per scelta | 📍 Londra',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      visitedPlaces: ['Londra', 'Edimburgo', 'Dublino', 'York', 'Canterbury'],
      wishlist: ['Egitto', 'Grecia', 'Turchia', 'Giordania'],
      travelDays: 203,
      followers: 891,
      following: 334,
      currentLocation: 'Londra, Regno Unito'
    },
    6: {
      id: '6',
      name: 'Giulia Romano',
      bio: 'Ballerina | Amante della natura | 📍 Rio de Janeiro',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      visitedPlaces: ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília'],
      wishlist: ['Argentina', 'Cile', 'Colombia', 'Perù'],
      travelDays: 45,
      followers: 567,
      following: 123,
      currentLocation: 'Rio de Janeiro, Brasile'
    }
  };
  
  // Filtra gli utenti basandosi sulla ricerca
  const filteredUsers = Object.values(allUsers).filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.bio.toLowerCase().includes(query) ||
      user.currentLocation.toLowerCase().includes(query) ||
      user.visitedPlaces.some(place => place.toLowerCase().includes(query)) ||
      user.wishlist.some(place => place.toLowerCase().includes(query))
    );
  });

  // Determina quale utente mostrare
  const profileId = searchParams.get('profile');
  const currentUser = profileId && allUsers[parseInt(profileId)] ? allUsers[parseInt(profileId)] : allUsers[1];

  // Effetto per cambiare tab se viene specificato un profilo nell'URL
  useEffect(() => {
    if (profileId) {
      setSelectedTab('profile');
    }
  }, [profileId]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <MiomondoLogo size="w-6 h-6" />
              <span className="text-lg font-bold text-foreground">Miomondo</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-xl font-bold text-foreground">Social</h1>
          </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button size="sm" className="rounded-full px-4">
            <Edit className="w-4 h-4 mr-1" />
            Post
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search travelers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-white/90 backdrop-blur-sm border-0 rounded-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="profile">
              {profileId ? `Profilo di ${currentUser.name.split(' ')[0]}` : 'Profilo'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="p-4">
            <SocialFeed searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="profile" className="p-4 flex justify-center">
            <UserProfile user={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Users;