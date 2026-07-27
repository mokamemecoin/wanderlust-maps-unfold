import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MiomondoLogo } from '@/components/MiomondoLogo';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

const NewPost = () => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({ description: 'Scrivi qualcosa prima di pubblicare.' });
      return;
    }
    toast({ description: 'Post pubblicato!' });
    navigate('/users');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/users" aria-label="Torna indietro">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <MiomondoLogo size="w-6 h-6" />
          <h1 className="text-xl font-bold text-foreground">Nuovo post</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="Racconta la tua esperienza di viaggio..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Luogo (es. Tokyo, Giappone)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Link immagine (opzionale)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Anteprima del post"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                Annulla
              </Button>
              <Button type="submit">Pubblica</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <BottomNavigation />
    </div>
  );
};

export default NewPost;