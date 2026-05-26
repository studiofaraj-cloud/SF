'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createServiceRequestAction } from '@/lib/service-request-actions';
import { contactServices } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function NewRequestPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const router = useRouter();
  const en = locale === 'en';

  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);
    try {
      const result = await createServiceRequestAction({ type, title, brief, budget });
      if (!result.success) {
        setError(result.message ?? (en ? 'Something went wrong.' : 'Qualcosa è andato storto.'));
        setErrors(result.errors ?? {});
        setLoading(false);
        return;
      }
      router.replace(`/${locale}/hub/requests`);
    } catch {
      setError(en ? 'Something went wrong. Please try again.' : 'Qualcosa è andato storto. Riprova.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href={`/${locale}/hub/requests`}
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {en ? 'My Requests' : 'Le mie richieste'}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{en ? 'New request' : 'Nuova richiesta'}</h1>

      <Card>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label>{en ? 'Service' : 'Servizio'}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder={en ? 'Choose a service' : 'Scegli un servizio'} />
                </SelectTrigger>
                <SelectContent>
                  {contactServices.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">{en ? 'Title' : 'Titolo'}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={en ? 'e.g. Marketing website for my company' : 'es. Sito vetrina per la mia azienda'}
                disabled={loading}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief">{en ? 'Brief' : 'Descrizione'}</Label>
              <Textarea
                id="brief"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={6}
                placeholder={
                  en
                    ? 'Tell us what you need, your goals, deadlines, references…'
                    : 'Raccontaci cosa ti serve, obiettivi, scadenze, riferimenti…'
                }
                disabled={loading}
              />
              {errors.brief && <p className="text-xs text-destructive">{errors.brief[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget">{en ? 'Budget (optional)' : 'Budget (opzionale)'}</Label>
              <Input
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={en ? 'e.g. €2,000 – €5,000' : 'es. €2.000 – €5.000'}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : en ? (
                'Submit request'
              ) : (
                'Invia richiesta'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
