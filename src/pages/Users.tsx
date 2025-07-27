import React, { useState } from 'react';
import { Link } from "react-router-dom";
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
  
  const sampleUser = {
    id: '1',
    name: 'Marco Rossi',
    bio: 'Viaggiatore appassionato | Food lover | 📍 Attualmente in Giappone',
    avatar: '/placeholder.svg',
    visitedPlaces: ['Tokyo', 'Parigi', 'New York', 'Londra', 'Roma', 'Bangkok', 'Sydney', 'Barcellona'],
    wishlist: ['Islanda', 'Nuova Zelanda', 'Perù', 'Nepal', 'Madagascar'],
    travelDays: 127,
    followers: 456,
    following: 234
  };

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
            <Link to="/signup">Registrati</Link>
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
            placeholder="Cerca viaggiatori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-white/90 backdrop-blur-sm border-0 rounded-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="p-4">
            <SocialFeed />
          </TabsContent>
          
          <TabsContent value="profile" className="p-4 flex justify-center">
            <UserProfile user={sampleUser} />
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Users;