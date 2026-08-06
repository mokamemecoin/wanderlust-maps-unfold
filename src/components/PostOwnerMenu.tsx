import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface OwnedItem {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  photo_url: string | null;
}

interface PostOwnerMenuProps {
  table: 'posts' | 'trips';
  item: OwnedItem;
  currentUserId?: string | null;
  onChanged?: () => void;
  className?: string;
}

const PostOwnerMenu = ({ table, item, currentUserId, onChanged, className }: PostOwnerMenuProps) => {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(item.title ?? '');
  const [description, setDescription] = useState(item.description ?? '');
  const [location, setLocation] = useState(item.location ?? '');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  if (!currentUserId || currentUserId !== item.user_id) return null;

  const openEdit = () => {
    setTitle(item.title ?? '');
    setDescription(item.description ?? '');
    setLocation(item.location ?? '');
    setFile(null);
    setEditing(true);
  };

  const save = async () => {
    if (!title.trim()) {
      toast({ description: 'Il titolo è obbligatorio.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    let photoUrl = item.photo_url;
    try {
      if (file) {
        const path = `${currentUserId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
        const { error: upErr } = await supabase.storage.from('trips').upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        photoUrl = supabase.storage.from('trips').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase
        .from(table)
        .update({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          photo_url: photoUrl,
        })
        .eq('id', item.id);
      if (error) throw error;
      toast({ description: 'Post aggiornato.' });
      setEditing(false);
      onChanged?.();
      window.dispatchEvent(new Event('posts-updated'));
    } catch (err) {
      console.error(err);
      toast({ description: 'Modifica non riuscita.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    const { error } = await supabase.from(table).delete().eq('id', item.id);
    setDeleting(false);
    if (error) {
      console.error(error);
      toast({ description: 'Eliminazione non riuscita.', variant: 'destructive' });
      return;
    }
    setConfirming(false);
    toast({ description: 'Post eliminato.' });
    onChanged?.();
    window.dispatchEvent(new Event('posts-updated'));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label="Opzioni post"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover z-50">
          <DropdownMenuItem onClick={openEdit}>
            <Pencil className="w-4 h-4 mr-2" /> Modifica Post
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 className="w-4 h-4 mr-2" /> Elimina Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Post</DialogTitle>
            <DialogDescription>Aggiorna titolo, descrizione, luogo e immagine.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`title-${item.id}`}>Titolo</Label>
              <Input id={`title-${item.id}`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`desc-${item.id}`}>Descrizione</Label>
              <Textarea
                id={`desc-${item.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={4}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`loc-${item.id}`}>Luogo / Paese</Label>
              <Input id={`loc-${item.id}`} value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`img-${item.id}`}>Immagine</Label>
              {item.photo_url && !file && (
                <img src={item.photo_url} alt={title} className="w-full h-32 object-cover rounded-lg" />
              )}
              <Input
                id={`img-${item.id}`}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Annulla
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo post?</AlertDialogTitle>
            <AlertDialogDescription>
              L'operazione è definitiva: il post e i suoi commenti verranno rimossi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove();
              }}
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostOwnerMenu;
