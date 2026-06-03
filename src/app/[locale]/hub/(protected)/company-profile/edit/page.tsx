'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Plus, Trash2, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/image-upload';
import {
  getMyCompanyProfileAction,
  updateCompanyProfileAction,
  recordConsentAction,
  suggestSlugAction,
} from '@/lib/company-profile-actions';
import type { CompanyProfileInput } from '@/lib/company-profile-schemas';
import { TOS_VERSION } from '@/lib/legal';
import { slugify } from '@/lib/company-slugs';

const EU_COUNTRIES = [
  { code: 'IT', label: 'Italia (IT) — Partita IVA' },
  { code: 'AT', label: 'Austria (AT)' },
  { code: 'BE', label: 'Belgio (BE)' },
  { code: 'DE', label: 'Germania (DE)' },
  { code: 'ES', label: 'Spagna (ES)' },
  { code: 'FR', label: 'Francia (FR)' },
  { code: 'NL', label: 'Paesi Bassi (NL)' },
  { code: 'PT', label: 'Portogallo (PT)' },
  { code: 'IE', label: 'Irlanda (IE)' },
  { code: 'PL', label: 'Polonia (PL)' },
  { code: 'GR', label: 'Grecia (GR)' },
];
const OTHER_COUNTRIES = [
  { code: 'GB', label: 'Regno Unito (GB) — VAT/Company number' },
  { code: 'CH', label: 'Svizzera (CH) — UID' },
  { code: 'US', label: 'Stati Uniti (US) — EIN' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'AU', label: 'Australia (AU) — ABN' },
];

type FormState = CompanyProfileInput & {
  // helpers
  taxIdCountry?: string;
};

const EMPTY_FORM: FormState = {
  slug: '',
  companyName: '',
  tagline: '',
  description: '',
  logoUrl: '',
  heroUrl: '',
  services: [],
  stats: [],
  pointsOfStrength: [],
  contact: {},
  social: {},
  taxId: undefined,
  taxIdPublic: true,
  numberOfEmployees: undefined,
};

export default function HubCompanyProfileEditPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxIdType, setTaxIdType] = useState<'EU_VAT' | 'IT_PIVA' | 'OTHER'>('IT_PIVA');
  const [taxIdCountry, setTaxIdCountry] = useState('IT');
  const [taxIdValue, setTaxIdValue] = useState('');
  const [consentRecorded, setConsentRecorded] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  // Tracks whether the user already has an active subscription on initial
  // load. Used to redirect first-time savers to the "discover pricing" page.
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    getMyCompanyProfileAction()
      .then((p) => {
        if (!p) return;
        setForm({
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
          invoicing: p.invoicing ?? {},
        });
        if (p.taxId) {
          setTaxIdType(p.taxId.type);
          setTaxIdCountry(p.taxId.country);
          setTaxIdValue(p.taxId.value);
        }
        if (p.consent?.tosVersion === TOS_VERSION) {
          setConsentRecorded(true);
          setTosAccepted(true);
          setMarketingConsent(!!p.consent.marketingConsent);
        }
        // Subscription is "active" for our purposes when it's trialing or active.
        const status = p.subscription?.status;
        setHasActiveSubscription(status === 'trialing' || status === 'active');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSuggestSlug = async () => {
    if (!form.companyName) return;
    const { slug } = await suggestSlugAction(form.companyName);
    set('slug', slug);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist consent first if needed
      if (!consentRecorded) {
        const res = await recordConsentAction({ tosAccepted, marketingConsent });
        if (!res.success) {
          toast({ variant: 'destructive', title: 'Errore', description: res.error });
          setSaving(false);
          return;
        }
        setConsentRecorded(true);
      }

      const taxId = taxIdValue.trim()
        ? { country: taxIdCountry, value: taxIdValue.trim(), type: taxIdType }
        : undefined;

      const payload: CompanyProfileInput = {
        ...form,
        taxId,
      } as CompanyProfileInput;

      const result = await updateCompanyProfileAction(payload);
      if (result.success) {
        // Refetch fresh profile state — the cached `hasActiveSubscription`
        // from initial load can be stale (e.g. user paid in another tab, or
        // the webhook hasn't fired yet locally). Source of truth = DB.
        const fresh = await getMyCompanyProfileAction();
        const status = fresh?.subscription?.status;
        const hasPaidSignal =
          status === 'trialing' ||
          status === 'active' ||
          status === 'past_due' ||
          !!fresh?.subscription?.stripeSubscriptionId;

        if (hasPaidSignal && result.slug) {
          // User has paid (or at least started checkout) — send them to see
          // their page. `?preview=1` lets the owner view even if the webhook
          // hasn't yet flipped isPublished=true.
          toast({
            title: en ? 'Saved' : 'Salvato',
            description: en
              ? 'Here\'s your public page.'
              : 'Ecco la tua pagina pubblica.',
          });
          router.push(`/${result.slug}?preview=1`);
          return;
        }

        if (!hasPaidSignal) {
          // Truly no subscription yet: this is the "discover the price" moment.
          toast({
            title: en ? 'Saved — last step' : 'Salvato — ultimo passaggio',
            description: en
              ? 'Activate your subscription to publish the page online.'
              : 'Attiva l\'abbonamento per pubblicare la pagina online.',
          });
          router.push(`/${locale}/hub/company-profile/subscription/start`);
          return;
        }

        toast({ title: en ? 'Saved' : 'Salvato', description: en ? 'Profile updated.' : 'Profilo aggiornato.' });
      } else {
        toast({
          variant: 'destructive',
          title: en ? 'Error' : 'Errore',
          description: result.error,
        });
      }
    } catch (err) {
      console.error('[hub/company-profile/edit] save failed:', err);
      const msg = err instanceof Error ? err.message : (en ? 'Unknown error. Check the console.' : 'Errore sconosciuto. Controlla la console.');
      toast({
        variant: 'destructive',
        title: en ? 'Save failed' : 'Errore di salvataggio',
        description: msg,
      });
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

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href={`/${locale}/hub/company-profile`}
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {en ? 'Back' : 'Indietro'}
      </Link>
      <div className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{en ? 'Edit company page' : 'Modifica pagina aziendale'}</h1>
        {form.slug && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/${form.slug}?preview=1`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              {en ? 'Preview' : 'Anteprima'}
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Identity' : 'Identità'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="companyName">{en ? 'Company name *' : 'Ragione sociale *'}</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                placeholder="Acme S.r.l."
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="slug">URL / slug *</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => set('slug', slugify(e.target.value))}
                    placeholder="acme-corp"
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleSuggestSlug}>
                  {en ? 'Suggest' : 'Suggerisci'}
                </Button>
              </div>
              {form.slug && (
                <p className="text-xs text-muted-foreground">studiofaraj.it/{form.slug}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={form.tagline ?? ''}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder={en ? 'A short pitch (one line).' : 'Una frase di presentazione.'}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">
                {en ? 'Description' : 'Descrizione'}{' '}
                <span className="text-xs text-muted-foreground">
                  ({form.description?.length ?? 0}/1400)
                </span>
              </Label>
              <Textarea
                id="description"
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                maxLength={1400}
                rows={6}
                placeholder={en ? 'Tell visitors who you are…' : 'Racconta ai visitatori chi sei…'}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="employees">{en ? 'Number of employees' : 'Numero di dipendenti'}</Label>
              <Input
                id="employees"
                type="number"
                min={1}
                value={form.numberOfEmployees ?? ''}
                onChange={(e) =>
                  set('numberOfEmployees', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Media' : 'Immagini'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <ImageUpload
              label={en ? 'Logo' : 'Logo'}
              name="logo"
              initialValue={form.logoUrl}
              onUploadComplete={(url) => set('logoUrl', url)}
              onDelete={() => set('logoUrl', '')}
            />
            <ImageUpload
              label={en ? 'Hero image' : 'Immagine hero'}
              name="hero"
              initialValue={form.heroUrl}
              onUploadComplete={(url) => set('heroUrl', url)}
              onDelete={() => set('heroUrl', '')}
            />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Contact' : 'Contatti'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.contact?.email ?? ''}
                onChange={(e) => set('contact', { ...form.contact, email: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact-phone">{en ? 'Phone' : 'Telefono'}</Label>
              <Input
                id="contact-phone"
                value={form.contact?.phone ?? ''}
                onChange={(e) => set('contact', { ...form.contact, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact-website">{en ? 'Website' : 'Sito web'}</Label>
              <Input
                id="contact-website"
                value={form.contact?.website ?? ''}
                onChange={(e) => set('contact', { ...form.contact, website: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact-city">{en ? 'City' : 'Città'}</Label>
              <Input
                id="contact-city"
                value={form.contact?.city ?? ''}
                onChange={(e) => set('contact', { ...form.contact, city: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="contact-address">{en ? 'Address' : 'Indirizzo'}</Label>
              <Input
                id="contact-address"
                value={form.contact?.addressLine ?? ''}
                onChange={(e) => set('contact', { ...form.contact, addressLine: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Social links' : 'Social'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(['instagram', 'linkedin', 'facebook', 'x', 'youtube', 'tiktok'] as const).map(
              (k) => (
                <div key={k} className="grid gap-1.5">
                  <Label htmlFor={`social-${k}`} className="capitalize">{k}</Label>
                  <Input
                    id={`social-${k}`}
                    value={form.social?.[k] ?? ''}
                    onChange={(e) => set('social', { ...form.social, [k]: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <RepeatableList
          title={en ? 'Services' : 'Servizi'}
          items={form.services ?? []}
          onChange={(v) => set('services', v as any)}
          newItem={() => ({ title: '', description: '' })}
          renderItem={(item, update) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder={en ? 'Title' : 'Titolo'}
                value={item.title}
                onChange={(e) => update({ ...item, title: e.target.value })}
              />
              <Input
                placeholder={en ? 'Short description' : 'Breve descrizione'}
                value={item.description ?? ''}
                onChange={(e) => update({ ...item, description: e.target.value })}
              />
            </div>
          )}
          max={20}
        />

        {/* Stats */}
        <RepeatableList
          title={en ? 'Stats' : 'Statistiche'}
          items={form.stats ?? []}
          onChange={(v) => set('stats', v as any)}
          newItem={() => ({ label: '', value: '' })}
          renderItem={(item, update) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder={en ? 'Label (e.g. Years active)' : 'Etichetta (es. Anni di attività)'}
                value={item.label}
                onChange={(e) => update({ ...item, label: e.target.value })}
              />
              <Input
                placeholder={en ? 'Value (e.g. 12)' : 'Valore (es. 12)'}
                value={item.value}
                onChange={(e) => update({ ...item, value: e.target.value })}
              />
            </div>
          )}
          max={12}
        />

        {/* Points of strength */}
        <RepeatableList
          title={en ? 'Points of strength (max 3)' : 'Punti di forza (max 3)'}
          items={form.pointsOfStrength ?? []}
          onChange={(v) => set('pointsOfStrength', v as any)}
          newItem={() => ({ title: '', description: '' })}
          renderItem={(item, update) => (
            <div className="grid gap-2">
              <Input
                placeholder={en ? 'Title' : 'Titolo'}
                value={item.title}
                onChange={(e) => update({ ...item, title: e.target.value })}
              />
              <Input
                placeholder={en ? 'Short description' : 'Breve descrizione'}
                value={item.description ?? ''}
                onChange={(e) => update({ ...item, description: e.target.value })}
              />
            </div>
          )}
          max={3}
        />

        {/* Tax ID */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Tax ID *' : 'Codice fiscale azienda *'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>{en ? 'Country' : 'Paese'}</Label>
              <Select
                value={taxIdCountry}
                onValueChange={(v) => {
                  setTaxIdCountry(v);
                  if (v === 'IT') setTaxIdType('IT_PIVA');
                  else if (['AT', 'BE', 'DE', 'ES', 'FR', 'NL', 'PT', 'IE', 'PL', 'GR'].includes(v))
                    setTaxIdType('EU_VAT');
                  else setTaxIdType('OTHER');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EU_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                  {OTHER_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="taxIdValue">
                {taxIdType === 'IT_PIVA' ? 'Partita IVA' : taxIdType === 'EU_VAT' ? 'VAT' : 'Tax ID'}
              </Label>
              <Input
                id="taxIdValue"
                value={taxIdValue}
                onChange={(e) => setTaxIdValue(e.target.value)}
                placeholder={taxIdType === 'IT_PIVA' ? 'IT01234567890' : ''}
              />
              {(form.taxId as any)?.verified && (
                <p className="flex items-center gap-1 text-xs text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {en ? 'Verified via VIES' : 'Verificato via VIES'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="taxIdPublic"
                checked={form.taxIdPublic ?? true}
                onCheckedChange={(v) => set('taxIdPublic', v)}
              />
              <Label htmlFor="taxIdPublic" className="cursor-pointer text-sm font-normal">
                {en ? 'Show the Tax ID on the public page' : 'Mostra il Tax ID sulla pagina pubblica'}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Consent — only shown until accepted */}
        {!consentRecorded && (
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                {en ? 'Consent required' : 'Consenso richiesto'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={tosAccepted}
                  onCheckedChange={(v) => setTosAccepted(v === true)}
                  className="mt-0.5"
                />
                <span>
                  {en
                    ? 'I accept the '
                    : 'Accetto i '}
                  <Link href={`/${locale}/terms`} target="_blank" className="text-primary underline">
                    {en ? 'Terms of Service' : 'Termini di Servizio'}
                  </Link>
                  {en ? ' and ' : ' e la '}
                  <Link href={`/${locale}/legal`} target="_blank" className="text-primary underline">
                    {en ? 'Privacy Policy' : 'Privacy Policy'}
                  </Link>
                  . *
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={marketingConsent}
                  onCheckedChange={(v) => setMarketingConsent(v === true)}
                  className="mt-0.5"
                />
                <span>
                  {en
                    ? "I agree to receive marketing communications from Studio Faraj (optional, you can withdraw at any time)."
                    : "Acconsento a ricevere comunicazioni di marketing da Studio Faraj (opzionale, revocabile in qualsiasi momento)."}
                </span>
              </label>
            </CardContent>
          </Card>
        )}

        <div className="sticky bottom-4 z-10 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || (!consentRecorded && !tosAccepted)}
            className="gap-2 shadow-lg"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {en ? 'Save profile' : 'Salva profilo'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable list editor (services / stats / points-of-strength) ─────────

function RepeatableList<T>({
  title,
  items,
  onChange,
  newItem,
  renderItem,
  max,
}: {
  title: string;
  items: T[];
  onChange: (v: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, update: (next: T) => void) => React.ReactNode;
  max: number;
}) {
  const update = (i: number, next: T) => {
    const out = [...items];
    out[i] = next;
    onChange(out);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, newItem()]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={add}
          disabled={items.length >= max}
        >
          <Plus className="mr-1 h-4 w-4" />
          {items.length}/{max}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessun elemento.</p>
        )}
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg border border-border/40 bg-background/50 p-3"
          >
            <div className="flex-1">{renderItem(item, (next) => update(i, next))}</div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => remove(i)}
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
