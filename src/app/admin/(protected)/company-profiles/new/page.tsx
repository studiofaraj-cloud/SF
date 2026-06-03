'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminCreateCompanyProfileAction } from '@/lib/company-profile-actions';
import type { CompanyProfileInput } from '@/lib/company-profile-schemas';
import {
  CompanyProfileForm,
  EMPTY_PROFILE_FORM,
} from '@/components/admin/company-profile-form';

export default function AdminNewCompanyProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publish, setPublish] = useState(true);

  const handleSubmit = async (form: CompanyProfileInput) => {
    setSaving(true);
    try {
      const res = await adminCreateCompanyProfileAction(form, { publish });
      if (res.success) {
        toast({ title: 'Creata', description: `Pagina /${res.slug} creata.` });
        router.push('/admin/company-profiles');
      } else {
        toast({ variant: 'destructive', title: 'Errore', description: res.error });
      }
    } catch (err) {
      console.error('[admin/company-profiles/new] save failed:', err);
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto. Controlla la console.';
      toast({ variant: 'destructive', title: 'Errore di salvataggio', description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/company-profiles"
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Tutte le pagine
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Nuova pagina aziendale</h1>

      <CompanyProfileForm
        initial={EMPTY_PROFILE_FORM}
        saving={saving}
        submitLabel="Crea pagina"
        onSubmit={handleSubmit}
        extra={
          <Card>
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <Label htmlFor="publish" className="text-sm font-semibold cursor-pointer">
                  Pubblica subito
                </Label>
                <p className="text-xs text-muted-foreground">
                  Le pagine admin-managed sono pubbliche senza abbonamento Stripe.
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
