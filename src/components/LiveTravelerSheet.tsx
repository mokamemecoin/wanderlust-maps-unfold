import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, MessageCircle, User, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface LiveTraveler {
  id: string;
  user_id: string | null;
  name: string;
  location: string;
  status_text?: string | null;
  last_active?: string | null;
  avatar_url?: string | null;
}

const timeAgo = (iso?: string | null) => {
  if (!iso) return 'ora';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'ora';
  if (mins < 60) return `${mins} min fa`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h fa`;
  return `${Math.floor(hours / 24)} g fa`;
};

interface Props {
  traveler: LiveTraveler | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LiveTravelerSheet = ({ traveler, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[1200]">
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 ring-2 ring-primary">
              <AvatarImage src={traveler?.avatar_url ?? undefined} alt={traveler?.name ?? 'Viaggiatore'} />
              <AvatarFallback>{traveler?.name?.[0] ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <DrawerTitle className="flex items-center gap-2">
                {traveler?.name}
                <Badge className="gap-1">
                  <Radio className="w-3 h-3" /> Live
                </Badge>
              </DrawerTitle>
              <DrawerDescription className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{traveler?.location}</span>
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1">
              Cosa sta facendo ora · attivo {timeAgo(traveler?.last_active)}
            </p>
            <p className="text-sm">
              {traveler?.status_text || 'Sta condividendo la posizione in tempo reale.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" /> Profilo
            </Button>
            <Button
              onClick={() =>
                toast({ description: `Messaggio a ${traveler?.name}: la chat arriverà a breve.` })
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Messaggio
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LiveTravelerSheet;
