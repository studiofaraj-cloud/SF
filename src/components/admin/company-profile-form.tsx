'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { ImageUpload } from '@/components/admin/image-upload';
import type { CompanyProfileInput } from '@/lib/company-profile-schemas';
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

export type CompanyProfileFormState = CompanyProfileInput;

export const EMPTY_PROFILE_FORM: CompanyProfileFormState = {
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
  invoicing: {},
};

export interface CompanyProfileFormProps {
  initial: CompanyProfileFormState;
  initialTaxIdCountry?: string;
  initialTaxIdType?: 'EU_VAT' | 'IT_PIVA' | 'OTHER';
  initialTaxIdValue?: string;
  taxIdVerified?: boolean;
  saving: boolean;
  submitLabel: string;
  /** Called when user presses submit. Caller is responsible for showing toasts. */
  onSubmit: (form: CompanyProfileFormState) => void | Promise<void>;
  /** Optional extra controls (e.g. publish toggle, delete button) rendered above submit. */
  extra?: React.ReactNode;
}

export function CompanyProfileForm({
  initial,
  initialTaxIdCountry = 'IT',
  initialTaxIdType = 'IT_PIVA',
  initialTaxIdValue = '',
  taxIdVerified = false,
  saving,
  submitLabel,
  onSubmit,
  extra,
}: CompanyProfileFormProps) {
  const [form, setForm] = useState<CompanyProfileFormState>(initial);
  const [taxIdType, setTaxIdType] = useState(initialTaxIdType);
  const [taxIdCountry, setTaxIdCountry] = useState(initialTaxIdCountry);
  const [taxIdValue, setTaxIdValue] = useState(initialTaxIdValue);

  const set = <K extends keyof CompanyProfileFormState>(
    k: K,
    v: CompanyProfileFormState[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const taxId = taxIdValue.trim()
      ? { country: taxIdCountry, value: taxIdValue.trim(), type: taxIdType }
      : undefined;
    await onSubmit({ ...form, taxId });
  };

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identità</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="companyName">Ragione sociale *</Label>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => set('slug', slugify(form.companyName) || 'my-company')}
              >
                Suggerisci
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
              placeholder="Una frase di presentazione."
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">
              Descrizione{' '}
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
              placeholder="Racconta ai visitatori chi sei…"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="employees">Numero di dipendenti</Label>
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
          <CardTitle className="text-base">Immagini</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ImageUpload
            label="Logo"
            name="logo"
            initialValue={form.logoUrl}
            onUploadComplete={(url) => set('logoUrl', url)}
            onDelete={() => set('logoUrl', '')}
          />
          <ImageUpload
            label="Immagine hero"
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
          <CardTitle className="text-base">Contatti</CardTitle>
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
            <Label htmlFor="contact-phone">Telefono</Label>
            <Input
              id="contact-phone"
              value={form.contact?.phone ?? ''}
              onChange={(e) => set('contact', { ...form.contact, phone: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-website">Sito web</Label>
            <Input
              id="contact-website"
              value={form.contact?.website ?? ''}
              onChange={(e) => set('contact', { ...form.contact, website: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-city">Città</Label>
            <Input
              id="contact-city"
              value={form.contact?.city ?? ''}
              onChange={(e) => set('contact', { ...form.contact, city: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="contact-address">Indirizzo</Label>
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
          <CardTitle className="text-base">Social</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(['instagram', 'linkedin', 'facebook', 'x', 'youtube', 'tiktok'] as const).map((k) => (
            <div key={k} className="grid gap-1.5">
              <Label htmlFor={`social-${k}`} className="capitalize">{k}</Label>
              <Input
                id={`social-${k}`}
                value={form.social?.[k] ?? ''}
                onChange={(e) => set('social', { ...form.social, [k]: e.target.value })}
                placeholder="https://"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Services */}
      <RepeatableList
        title="Servizi"
        items={form.services ?? []}
        onChange={(v) => set('services', v as any)}
        newItem={() => ({ title: '', description: '' })}
        renderItem={(item, update) => (
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Titolo"
              value={item.title}
              onChange={(e) => update({ ...item, title: e.target.value })}
            />
            <Input
              placeholder="Breve descrizione"
              value={item.description ?? ''}
              onChange={(e) => update({ ...item, description: e.target.value })}
            />
          </div>
        )}
        max={20}
      />

      {/* Stats */}
      <RepeatableList
        title="Statistiche"
        items={form.stats ?? []}
        onChange={(v) => set('stats', v as any)}
        newItem={() => ({ label: '', value: '' })}
        renderItem={(item, update) => (
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Etichetta"
              value={item.label}
              onChange={(e) => update({ ...item, label: e.target.value })}
            />
            <Input
              placeholder="Valore"
              value={item.value}
              onChange={(e) => update({ ...item, value: e.target.value })}
            />
          </div>
        )}
        max={12}
      />

      {/* Points of strength */}
      <RepeatableList
        title="Punti di forza (max 3)"
        items={form.pointsOfStrength ?? []}
        onChange={(v) => set('pointsOfStrength', v as any)}
        newItem={() => ({ title: '', description: '' })}
        renderItem={(item, update) => (
          <div className="grid gap-2">
            <Input
              placeholder="Titolo"
              value={item.title}
              onChange={(e) => update({ ...item, title: e.target.value })}
            />
            <Input
              placeholder="Breve descrizione"
              value={item.description ?? ''}
              onChange={(e) => update({ ...item, description: e.target.value })}
            />
          </div>
        )}
        max={3}
      />

      {/* Fatturazione (SDI / PEC) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fatturazione</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-xs text-muted-foreground">
            Compila solo se hai un Codice SDI specifico o una PEC dedicata.
            Lasciando vuoto la fattura verr&agrave; recapitata via SDI con il
            codice destinatario universale <code>0000000</code> nell&apos;area
            riservata Agenzia Entrate.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="sdiCode">Codice destinatario SDI</Label>
              <Input
                id="sdiCode"
                value={form.invoicing?.sdiCode ?? ''}
                maxLength={7}
                onChange={(e) =>
                  set('invoicing', { ...form.invoicing, sdiCode: e.target.value.toUpperCase() })
                }
                placeholder="M5UXCR1"
              />
              <p className="text-[10px] text-muted-foreground">7 caratteri alfanumerici</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pecEmail">PEC fatturazione</Label>
              <Input
                id="pecEmail"
                type="email"
                value={form.invoicing?.pecEmail ?? ''}
                onChange={(e) =>
                  set('invoicing', { ...form.invoicing, pecEmail: e.target.value })
                }
                placeholder="azienda@pec.it"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax ID */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax ID</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Paese</Label>
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
            {taxIdVerified && (
              <p className="flex items-center gap-1 text-xs text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verificato via VIES
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
              Mostra il Tax ID sulla pagina pubblica
            </Label>
          </div>
        </CardContent>
      </Card>

      {extra}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button onClick={handleSubmit} disabled={saving} className="gap-2 shadow-lg">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
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
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={items.length >= max}>
          <Plus className="mr-1 h-4 w-4" />
          {items.length}/{max}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nessun elemento.</p>}
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
