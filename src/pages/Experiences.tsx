import React from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Experiences = () => {
  const experiences = [
    {
      id: 1,
      user: 'Marco Rossi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      location: 'Tokyo, Giappone',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      description: 'Incredibile esperienza nel quartiere di Shibuya! I colori e l\'energia di questa città sono indescrivibili.',
      likes: 24,
      comments: 8,
      time: '2 ore fa',
      tags: ['Cultura', 'Città']
    },
    {
      id: 2,
      user: 'Sofia Bianchi',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      location: 'Santorini, Grecia',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
      description: 'Il tramonto più bello della mia vita! Santorini supera ogni aspettativa.',
      likes: 45,
      comments: 12,
      time: '5 ore fa',
      tags: ['Mare', 'Tramonto', 'Romantico']
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-primary text-white p-4">
        <h1 className="text-xl font-semibold">Esperienze</h1>
        <p className="text-sm text-white/80">Scopri cosa stanno vivendo altri viaggiatori</p>
      </div>

      <div className="p-4 space-y-6">
        {experiences.map((exp) => (
          <Card key={exp.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={exp.avatar} 
                  alt={exp.user}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-base">{exp.user}</CardTitle>
                  <CardDescription className="text-sm">{exp.location} • {exp.time}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <div className="px-6 pb-3">
              <img 
                src={exp.image} 
                alt={exp.location}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <CardContent className="pt-0">
              <p className="text-sm mb-3">{exp.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {exp.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Heart className="w-5 h-5 mr-1" />
                    <span className="text-sm">{exp.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <MessageCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm">{exp.comments}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Experiences;