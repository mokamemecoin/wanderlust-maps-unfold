import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Upload, X, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onTripAdded: () => void;
}

export const AddTripDialog = ({ open, onOpenChange, user, onTripAdded }: AddTripDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_current: checked }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('trips')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('trips')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim()) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      // Create trip
      const tripData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        photo_url: photoUrl,
        is_current: formData.is_current,
      };

      const { error } = await supabase
        .from('trips')
        .insert([tripData]);

      if (error) throw error;

      // If this is a current trip, also add to travelers table for the map
      if (formData.is_current) {
        try {
          // Geocode location for map coordinates
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`);
          const data = await response.json();
          
          if (data && data.length > 0) {
            const { error: travelerError } = await supabase
              .from('travelers')
              .insert([{
                user_id: user.id,
                name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
                location: formData.location,
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
              }]);

            if (travelerError) {
              console.error('Error adding to travelers:', travelerError);
            }
          }
        } catch (geoError) {
          console.error('Error geocoding location:', geoError);
        }
      }

      toast({
        title: "Viaggio aggiunto",
        description: "Il tuo viaggio è stato salvato con successo!",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
      });
      setPhotoFile(null);
      setPhotoPreview(null);

      onTripAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding trip:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il viaggio. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Viaggio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titolo del viaggio *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Es. Viaggio in Giappone"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Destinazione *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Es. Tokyo, Giappone"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data inizio</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data fine</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_current" className="text-sm">
              Sto viaggiando ora (apparirà sulla mappa)
            </Label>
          </div>

          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Racconta la tua esperienza di viaggio..."
              rows={3}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label>Foto del viaggio</Label>
            {photoPreview ? (
              <Card className="p-4">
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card 
                className="p-8 border-dashed border-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm">Clicca per caricare una foto</p>
                </div>
              </Card>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salva Viaggio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};