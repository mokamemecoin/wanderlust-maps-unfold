import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Calendar, Users, Heart } from "lucide-react";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    bio: string;
    avatar: string;
    visitedPlaces: string[];
    wishlist: string[];
    travelDays: number;
    followers: number;
    following: number;
  };
}

const UserProfile = ({ user }: UserProfileProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-muted-foreground text-sm">{user.bio}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{user.travelDays}</span>
            </div>
            <p className="text-xs">Giorni di viaggio</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{user.followers}</span>
            </div>
            <p className="text-xs">Follower</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>{user.following}</span>
            </div>
            <p className="text-xs">Seguiti</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Mete Visitate ({user.visitedPlaces.length})
          </h3>
          <div className="flex flex-wrap gap-1">
            {user.visitedPlaces.slice(0, 6).map((place, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {place}
              </Badge>
            ))}
            {user.visitedPlaces.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{user.visitedPlaces.length - 6}
              </Badge>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Wishlist ({user.wishlist.length})</h3>
          <div className="flex flex-wrap gap-1">
            {user.wishlist.slice(0, 4).map((place, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {place}
              </Badge>
            ))}
            {user.wishlist.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{user.wishlist.length - 4}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">Segui</Button>
          <Button size="sm" variant="outline" className="flex-1">Messaggio</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;