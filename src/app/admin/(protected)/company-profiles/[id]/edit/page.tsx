'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  adminGetCompanyProfileAction,
  adminUpdateCompanyProfileAction,
} from '@/lib/company-profile-actions';
import type { CompanyProfileInput } from '@/lib/company-profile-schemas';
import {
  CompanyProfileForm,
  EMPTY_PROFILE_FORM,
  type CompanyProfileFormState,
} from '@/components/admin/company-profile-form';
import type { CompanyProfileDoc } from '@/lib/firestore-data';

export default function AdminEditCompanyProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [doc, setDoc] = useState<CompanyProfileDoc | null>(null);
  const [initial, setInitial] = useState<CompanyProfileFormState>(EMPTY_PROFILE_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publish, setPublish] = useState(true);

  useEffect(() => {
    adminGetCompanyProfileAction(id)
      .then((p) => {
        if (!p) return;
        setDoc(p);
        setInitial({
          slug: p.slug ?? '',
          companyName: p.companyName ?? '',
          tagline: p.tagline ?? '',
          description: p.description ?? '',
          logoUrl: p.logoUrl ?? '',
          heroUrl: p.heroUrl ?? '',
          services: p.services ?? [],
          stats: p.stats ?? [],
          pointsOfStrength: p.pointsOfStrength ?? [],
          contact: p.contact ?? {},
          social: p.social ?? {},
          taxId: p.taxId,
          taxIdPublic: p.taxIdPublic ?? true,
          numberOfEmployees: p.numberOfEmployees,
        });
        setPublish(!!p.isPublished);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (form: CompanyProfileInput) => {
    setSaving(true);
    try {
      const res = await adminUpdateCompanyProfileAction(id, form, { publish });
      if (res.success) {
        toast({ title: 'Salvato', description: 'Pagina aggiornata.' });
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Errore', description: res.error });
      }
    } catch (err) {
      console.error('[admin/company-profiles/edit] save failed:', err);
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto. Controlla la console.';
      toast({ variant: 'destructive', title: 'Errore di salvataggio', description: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!doc) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p>Pagina non trovata.</p>
        <Link href="/admin/company-profiles" className="text-primary underline">
          Torna all&apos;elenco
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/company-profiles"
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Tutte le pagine
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Modifica pagina</h1>
        <div className="flex flex-wrap items-center gap-2">
          {doc.adminManaged ? (
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/15 text-purple-600">
              Admin-managed
            </Badge>
          ) : (
            <Badge variant="outline">Cliente</Badge>
          )}
          {doc.slug && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/${doc.slug}?preview=1`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" />
                Anteprima
              </Link>
            </Button>
          )}
        </div>
      </div>

      <CompanyProfileForm
        initial={initial}
        initialTaxIdCountry={doc.taxId?.country ?? 'IT'}
        initialTaxIdType={doc.taxId?.type ?? 'IT_PIVA'}
        initialTaxIdValue={doc.taxId?.value ?? ''}
        taxIdVerified={!!doc.taxId?.verified}
        saving={saving}
        submitLabel="Salva"
        onSubmit={handleSubmit}
        extra={
          <Card>
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <Label htmlFor="publish" className="text-sm font-semibold cursor-pointer">
                  Pubblicata
                </Label>
                <p className="text-xs text-muted-foreground">
                  Disattiva per nascondere la pagina senza eliminarla.
                </p>
              </div>
              <Switch id="publish" checked={publish} onCheckedChange={setPublish} />
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
