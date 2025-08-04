import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share, MapPin, Camera } from "lucide-react";

interface FeedPost {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  location?: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
}

interface SocialFeedProps {
  searchQuery?: string;
}

const SocialFeed = ({ searchQuery = '' }: SocialFeedProps) => {
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: '1',
      user: { name: 'Marco Rossi', avatar: '/placeholder.svg' },
      content: 'Appena arrivato a Tokyo! La città è incredibile 🇯🇵',
      location: 'Tokyo, Giappone',
      image: '/placeholder.svg',
      timestamp: '2 ore fa',
      likes: 24,
      comments: 5,
      liked: false
    },
    {
      id: '2',
      user: { name: 'Sofia Chen', avatar: '/placeholder.svg' },
      content: 'Tramonto perfetto dalle scogliere di Santorini. Non potevo non condividere!',
      location: 'Santorini, Grecia',
      timestamp: '4 ore fa',
      likes: 87,
      comments: 12,
      liked: true
    },
    {
      id: '3',
      user: { name: 'Luca Bianchi', avatar: '/placeholder.svg' },
      content: 'Street food a Bangkok: ho appena provato il pad thai più buono della mia vita!',
      location: 'Bangkok, Thailandia',
      timestamp: '1 giorno fa',
      likes: 56,
      comments: 8,
      liked: false
    }
  ]);

  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  // Filtra i post basandosi sulla ricerca
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.user.name.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      (post.location && post.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {filteredPosts.length === 0 && searchQuery ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nessun post trovato per "{searchQuery}"</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
        <Card key={post.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{post.user.name}</h4>
                {post.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{post.location}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{post.timestamp}</span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm mb-3">{post.content}</p>
            
            {post.image && (
              <div className="relative mb-3 rounded-lg overflow-hidden bg-muted">
                <div className="aspect-video flex items-center justify-center">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 h-8 px-2"
                >
                  <Heart 
                    className={`w-4 h-4 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                  <span className="text-xs">{post.likes}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">{post.comments}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Scrivi un commento..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                  className="flex-1 h-8 text-xs"
                />
                <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                  Invia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
};

export default SocialFeed;