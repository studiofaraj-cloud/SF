'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMyProfileAction, updateMyProfileAction, type MyProfileInput } from '@/lib/auth-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, User as UserIcon, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EMPTY: MyProfileInput = {
  displayName: '',
  phone: '',
  company: '',
  vatNumber: '',
  taxCode: '',
  addressLine: '',
  city: '',
  province: '',
  zip: '',
  country: '',
  sdiPec: '',
};

export default function HubProfilePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const { toast } = useToast();

  const [form, setForm] = useState<MyProfileInput>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfileAction()
      .then((p) => {
        if (p) {
          setForm({
            displayName: p.displayName ?? '',
            phone: p.phone ?? '',
            company: p.company ?? '',
            vatNumber: p.vatNumber ?? '',
            taxCode: p.taxCode ?? '',
            addressLine: p.addressLine ?? '',
            city: p.city ?? '',
            province: p.province ?? '',
            zip: p.zip ?? '',
            country: p.country ?? '',
            sdiPec: p.sdiPec ?? '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof MyProfileInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await updateMyProfileAction({ ...form, locale });
    setSaving(false);
    if (res.success) {
      toast({ title: en ? 'Saved' : 'Salvato', description: en ? 'Your profile has been updated.' : 'Il tuo profilo è stato aggiornato.' });
    } else {
      toast({ variant: 'destructive', title: en ? 'Error' : 'Errore', description: res.error });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const field = (key: keyof MyProfileInput, label: string, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} value={form[key] ?? ''} onChange={set(key)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href={`/${locale}/hub`} className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{en ? 'Profile' : 'Profilo'}</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-5 w-5 text-primary" />
              {en ? 'Personal details' : 'Dati personali'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {field('displayName', en ? 'Full name' : 'Nome e cognome', en ? 'Your name' : 'Il tuo nome')}
            {field('phone', en ? 'Phone' : 'Telefono', '+39 …')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              {en ? 'Billing details' : 'Dati di fatturazione'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {en
                ? 'Optional — fill these in only if you need invoices addressed to a company.'
                : 'Facoltativi — compila solo se desideri la fattura intestata a un’azienda.'}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {field('company', en ? 'Company name' : 'Ragione sociale', en ? 'Company S.r.l.' : 'Azienda S.r.l.')}
            {field('vatNumber', en ? 'VAT number' : 'Partita IVA', 'IT01234567890')}
            {field('taxCode', en ? 'Tax code' : 'Codice Fiscale')}
            {field('sdiPec', en ? 'SDI / PEC code' : 'Codice SDI / PEC')}
            {field('addressLine', en ? 'Address' : 'Indirizzo', en ? 'Street, no.' : 'Via, n.')}
            {field('city', en ? 'City' : 'Città')}
            {field('province', en ? 'Province' : 'Provincia', 'PD')}
            {field('zip', en ? 'ZIP' : 'CAP', '35100')}
            {field('country', en ? 'Country' : 'Paese', 'Italia')}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {en ? 'Save' : 'Salva'}
          </Button>
        </div>
      </div>
    </div>
  );
}
