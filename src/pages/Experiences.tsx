import React, { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Experiences = () => {
  const [experiences, setExperiences] = useState([
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
      tags: ['Cultura', 'Città'],
      userLiked: false,
      commentsList: [
        { user: 'Anna', text: 'Bellissimo posto!', time: '1h' },
        { user: 'Luca', text: 'Devo andare assolutamente', time: '30min' }
      ]
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
      tags: ['Mare', 'Tramonto', 'Romantico'],
      userLiked: false,
      commentsList: [
        { user: 'Mario', text: 'Che spettacolo!', time: '2h' }
      ]
    }
  ]);

  const [newComment, setNewComment] = useState<{[key: number]: string}>({});
  const { toast } = useToast();

  const toggleLike = (expId: number) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === expId 
        ? { 
            ...exp, 
            likes: exp.userLiked ? exp.likes - 1 : exp.likes + 1,
            userLiked: !exp.userLiked 
          }
        : exp
    ));
  };

  const addComment = (expId: number) => {
    const comment = newComment[expId]?.trim();
    if (!comment) return;

    setExperiences(prev => prev.map(exp => 
      exp.id === expId 
        ? { 
            ...exp, 
            comments: exp.comments + 1,
            commentsList: [...exp.commentsList, { user: 'Tu', text: comment, time: 'ora' }]
          }
        : exp
    ));
    
    setNewComment(prev => ({ ...prev, [expId]: '' }));
    toast({ description: 'Commento aggiunto!' });
  };

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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto"
                    onClick={() => toggleLike(exp.id)}
                  >
                    <Heart className={`w-5 h-5 mr-1 ${exp.userLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm">{exp.likes}</span>
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MessageCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm">{exp.comments}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Commenti</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {exp.commentsList.map((comment, idx) => (
                          <div key={idx} className="flex gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                              {comment.user[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{comment.user}</span>
                                <span className="text-xs text-muted-foreground">{comment.time}</span>
                              </div>
                              <p className="text-sm">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Scrivi un commento..."
                          value={newComment[exp.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [exp.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && addComment(exp.id)}
                        />
                        <Button size="icon" onClick={() => addComment(exp.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={() => toast({ description: 'Condiviso!' })}
                >
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