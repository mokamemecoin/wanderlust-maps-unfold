import { AlertTriangle, Clock, MapPin, Trash2, Wrench, CloudRain, Car, Info } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface AlertItem {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  expires_at: string;
}

export const ALERT_CATEGORIES = [
  { value: 'danger', label: 'Pericolo', icon: AlertTriangle, color: '#ef4444' },
  { value: 'service', label: 'Servizio', icon: Wrench, color: '#3b82f6' },
  { value: 'traffic', label: 'Traffico', icon: Car, color: '#f59e0b' },
  { value: 'weather', label: 'Meteo', icon: CloudRain, color: '#0ea5e9' },
  { value: 'other', label: 'Altro', icon: Info, color: '#6b7280' },
] as const;

export const categoryMeta = (value: string) =>
  ALERT_CATEGORIES.find((c) => c.value === value) ?? ALERT_CATEGORIES[4];

/** Restituisce il tempo rimanente in formato "3h 12m", o null se scaduto. */
export const formatRemaining = (expiresAt?: string | null): string | null => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

interface AlertDetailSheetProps {
  alert: AlertItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canDelete?: boolean;
  onDelete?: (alert: AlertItem) => void;
}

const AlertDetailSheet = ({ alert, open, onOpenChange, canDelete, onDelete }: AlertDetailSheetProps) => {
  if (!alert) return null;
  const meta = categoryMeta(alert.category);
  const Icon = meta.icon;
  const remaining = formatRemaining(alert.expires_at);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[1200]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full text-white"
              style={{ backgroundColor: meta.color }}
            >
              <Icon className="w-5 h-5" />
            </span>
            <div className="text-left">
              <DrawerTitle className="text-base">{alert.title}</DrawerTitle>
              <DrawerDescription className="flex items-center gap-1 text-xs">
                <MapPin className="w-3 h-3" />
                {alert.location || `${alert.latitude.toFixed(3)}, ${alert.longitude.toFixed(3)}`}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{meta.label}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {remaining ? `Scade tra ${remaining}` : 'Scaduto'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(alert.created_at).toLocaleString('it-IT')}
            </span>
          </div>

          {alert.description && <p className="text-sm">{alert.description}</p>}

          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => onDelete?.(alert)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Elimina segnalazione
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AlertDetailSheet;
