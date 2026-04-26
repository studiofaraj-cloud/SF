'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, RefreshCw, Trash2, Eye, EyeOff, Plus, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  getReviewsAction,
  syncGoogleReviewsAction,
  addReviewAction,
  toggleReviewVisibilityAction,
  deleteReviewAction,
} from '@/lib/review-actions';
import type { ReviewDocument } from '@/lib/firestore-data';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`w-5 h-5 ${n <= value ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // New review form state
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReviewsAction();
      setReviews(data);
    } catch {
      toast({ title: 'Errore', description: 'Impossibile caricare le recensioni', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // ── Sync from Google ──────────────────────────────────────────────────────
  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncGoogleReviewsAction();
      if (result.error) {
        toast({ title: 'Errore sync', description: result.error, variant: 'destructive' });
      } else {
        toast({
          title: 'Sincronizzazione completata',
          description: `${result.synced} recensioni importate da Google`,
        });
        await load();
      }
    } finally {
      setSyncing(false);
    }
  }

  // ── Add manual review ─────────────────────────────────────────────────────
  async function handleAdd() {
    if (!newName.trim() || !newText.trim()) {
      toast({ title: 'Campi obbligatori', description: 'Nome e testo sono obbligatori', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      const result = await addReviewAction({
        authorDisplayName: newName.trim(),
        rating: newRating,
        text: newText.trim(),
        publishTime: new Date(newDate).toISOString(),
      });
      if (result.error) {
        toast({ title: 'Errore', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Recensione aggiunta', description: 'Verrà mostrata sul sito' });
        setAddOpen(false);
        setNewName(''); setNewText(''); setNewRating(5);
        await load();
      }
    } finally {
      setAdding(false);
    }
  }

  // ── Toggle visibility ──────────────────────────────────────────────────────
  async function handleToggle(id: string, visible: boolean) {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, visible } : r));
    const result = await toggleReviewVisibilityAction(id, visible);
    if (result.error) {
      toast({ title: 'Errore', description: result.error, variant: 'destructive' });
      await load(); // revert
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    const result = await deleteReviewAction(id);
    if (result.error) {
      toast({ title: 'Errore', description: result.error, variant: 'destructive' });
      await load();
    } else {
      toast({ title: 'Recensione eliminata' });
    }
  }

  const visible = reviews.filter((r) => r.visible).length;
  const googleCount = reviews.filter((r) => r.source === 'google').length;
  const manualCount = reviews.filter((r) => r.source === 'manual').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recensioni</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestisci le recensioni mostrate in homepage. Sincronizza da Google o aggiungile manualmente.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizzazione...' : 'Sincronizza da Google'}
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi manuale
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Totale', value: reviews.length, icon: Star },
          { label: 'Visibili', value: visible, icon: Eye },
          { label: 'Da Google', value: googleCount, icon: CheckCircle },
          { label: 'Manuali', value: manualCount, icon: Plus },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info banner when empty */}
      {!loading && reviews.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-medium">Nessuna recensione</p>
            <p className="text-sm text-muted-foreground">
              Clicca <strong>Sincronizza da Google</strong> per importare le 5 recensioni dalla tua scheda Google Maps,
              poi aggiungi le restanti manualmente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-28" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className={`transition-opacity ${!review.visible ? 'opacity-50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {review.authorDisplayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-semibold text-sm">{review.authorDisplayName}</span>
                      <StarRating value={review.rating} />
                      <Badge variant={review.source === 'google' ? 'default' : 'secondary'} className="text-xs">
                        {review.source === 'google' ? 'Google' : 'Manuale'}
                      </Badge>
                      {!review.visible && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Nascosta</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{review.text}</p>
                    {review.publishTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.publishTime).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {review.relativeTime && ` · ${review.relativeTime}`}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {review.authorUri && (
                      <a href={review.authorUri} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Apri su Google">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={review.visible ? 'Nascondi' : 'Mostra'}
                      onClick={() => handleToggle(review.id!, !review.visible)}
                    >
                      {review.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Elimina"
                      onClick={() => handleDelete(review.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add manual review dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aggiungi recensione manuale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rev-name">Nome *</Label>
              <Input
                id="rev-name"
                placeholder="es. Luca Ferrari"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valutazione *</Label>
              <StarRating value={newRating} onChange={setNewRating} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rev-text">Testo *</Label>
              <Textarea
                id="rev-text"
                rows={4}
                placeholder="Testo della recensione..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rev-date">Data</Label>
              <Input
                id="rev-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annulla</Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? 'Salvataggio...' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
