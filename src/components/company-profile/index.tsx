import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Star,
  CheckCircle2,
  Sparkles,
  Quote,
} from 'lucide-react';
import type {
  CompanyProfileContact,
  CompanyProfileSocial,
  CompanyProfileService,
  CompanyProfileStat,
  CompanyProfilePoint,
  CompanyProfileTaxId,
} from '@/lib/firestore-data';

export function ProfileHero({
  companyName,
  tagline,
  logoUrl,
  heroUrl,
}: {
  companyName: string;
  tagline?: string;
  logoUrl?: string;
  heroUrl?: string;
}) {
  // Descriptive alt text powers image SEO + accessibility. We compose them
  // from the company name + tagline so they aren't generic placeholders.
  const heroAlt = tagline
    ? `${companyName} — ${tagline}`
    : `${companyName} — immagine di copertina`;
  const logoAlt = `Logo di ${companyName}`;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {logoUrl ? (
            <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-background/80 shadow-lg">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {companyName}
          </h1>
          {tagline && (
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function DescriptionSection({
  description,
  lang = 'it',
}: {
  description?: string;
  lang?: 'it' | 'en';
}) {
  if (!description) return null;

  // Split into "lead sentence" + "body" for visual hierarchy. We don't want to
  // mangle abbreviations like "S.r.l." or "P.IVA" so we split on a period
  // followed by a space and a capital letter — a reasonable heuristic.
  const splitIdx = description.search(/\.\s+[A-ZÀ-Ý]/);
  const lead = splitIdx > 0 ? description.slice(0, splitIdx + 1) : description;
  const body = splitIdx > 0 ? description.slice(splitIdx + 1).trim() : '';

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-24">
      {/* Subtle background gradient + radial accent */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div className="absolute inset-x-0 top-1/2 -z-10 h-96 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Section badge */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3 w-3" />
              {lang === 'en' ? 'About us' : 'Chi siamo'}
            </span>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>

          {/* Decorative quote glyph */}
          <Quote
            aria-hidden="true"
            className="mx-auto mb-6 h-10 w-10 text-primary/25"
            strokeWidth={1.25}
          />

          {/* Lead — larger, lighter weight, foreground color */}
          <p className="whitespace-pre-line text-center text-xl font-light leading-relaxed text-foreground md:text-2xl md:leading-relaxed">
            {lead}
          </p>

          {/* Body — softer, smaller */}
          {body && (
            <p className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-center text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed">
              {body}
            </p>
          )}

          {/* Bottom accent */}
          <div className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}

export function ServicesGrid({ services }: { services?: CompanyProfileService[] }) {
  if (!services || services.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-3xl font-bold">Servizi</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-shadow hover:shadow-md"
            >
              <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
              {service.description && (
                <p className="text-sm text-muted-foreground">{service.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsRow({ stats }: { stats?: CompanyProfileStat[] }) {
  if (!stats || stats.length === 0) return null;
  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">{stat.value}</div>
              <div className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PointsOfStrength({ points }: { points?: CompanyProfilePoint[] }) {
  if (!points || points.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-3xl font-bold">Perché sceglierci</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point, i) => (
            <div
              key={i}
              className="rounded-xl border border-primary/20 bg-primary/5 p-6"
            >
              <Star className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">{point.title}</h3>
              {point.description && (
                <p className="text-sm text-muted-foreground">{point.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactBlock({ contact }: { contact?: CompanyProfileContact }) {
  if (!contact) return null;
  const hasAny =
    contact.email ||
    contact.phone ||
    contact.website ||
    contact.addressLine ||
    contact.city ||
    contact.country;
  if (!hasAny) return null;

  const items: Array<{ icon: React.ReactNode; label: string; href?: string }> = [];
  if (contact.email)
    items.push({
      icon: <Mail className="h-5 w-5 text-primary" />,
      label: contact.email,
      href: `mailto:${contact.email}`,
    });
  if (contact.phone)
    items.push({
      icon: <Phone className="h-5 w-5 text-primary" />,
      label: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, '')}`,
    });
  if (contact.website)
    items.push({
      icon: <Globe className="h-5 w-5 text-primary" />,
      label: contact.website.replace(/^https?:\/\//, ''),
      href: contact.website.startsWith('http') ? contact.website : `https://${contact.website}`,
    });
  const addr = [contact.addressLine, contact.city, contact.country].filter(Boolean).join(', ');
  if (addr)
    items.push({
      icon: <MapPin className="h-5 w-5 text-primary" />,
      label: addr,
    });

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold">Contatti</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) =>
            item.href ? (
              <Link
                key={i}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/50 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                {item.icon}
                <span className="truncate text-sm font-medium">{item.label}</span>
              </Link>
            ) : (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/50 p-4"
              >
                {item.icon}
                <span className="truncate text-sm">{item.label}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export function SocialRow({ social }: { social?: CompanyProfileSocial }) {
  if (!social) return null;
  const entries: Array<{ url: string; icon: React.ReactNode; label: string }> = [];
  const norm = (u: string) => (u.startsWith('http') ? u : `https://${u}`);
  if (social.instagram)
    entries.push({
      url: norm(social.instagram),
      icon: <Instagram className="h-5 w-5" />,
      label: 'Instagram',
    });
  if (social.linkedin)
    entries.push({
      url: norm(social.linkedin),
      icon: <Linkedin className="h-5 w-5" />,
      label: 'LinkedIn',
    });
  if (social.facebook)
    entries.push({
      url: norm(social.facebook),
      icon: <Facebook className="h-5 w-5" />,
      label: 'Facebook',
    });
  if (social.x)
    entries.push({
      url: norm(social.x),
      icon: <span className="text-sm font-bold">X</span>,
      label: 'X',
    });
  if (social.youtube)
    entries.push({
      url: norm(social.youtube),
      icon: <Youtube className="h-5 w-5" />,
      label: 'YouTube',
    });
  if (social.tiktok)
    entries.push({
      url: norm(social.tiktok),
      icon: <span className="text-xs font-bold">TikTok</span>,
      label: 'TikTok',
    });
  if (entries.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-center gap-3">
        {entries.map((e) => (
          <Link
            key={e.label}
            href={e.url}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={e.label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/50 text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            {e.icon}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TaxIdBlock({
  taxId,
  show,
}: {
  taxId?: CompanyProfileTaxId;
  show: boolean;
}) {
  if (!show || !taxId?.value) return null;
  const label =
    taxId.type === 'IT_PIVA' ? 'Partita IVA' : taxId.type === 'EU_VAT' ? 'VAT' : 'Tax ID';
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
        <span className="font-medium">{label}:</span> {taxId.value}
        {taxId.verified && (
          <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 align-text-bottom text-primary" />
        )}
      </div>
    </section>
  );
}

export function UnavailableProfile({ companyName }: { companyName?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold">
          {companyName ? `${companyName}: pagina non disponibile` : 'Pagina non disponibile'}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Questa pagina aziendale non è al momento attiva. Se sei il titolare,
          accedi all&apos;area Hub per riattivare il tuo abbonamento.
        </p>
        <div className="mt-6">
          <Link
            href="/it/hub"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Vai all&apos;Hub
          </Link>
        </div>
      </div>
    </div>
  );
}

export function OrganizationJsonLd({
  companyName,
  url,
  logoUrl,
  description,
  social,
  contact,
  taxId,
  lang,
}: {
  companyName: string;
  url: string;
  logoUrl?: string;
  description?: string;
  social?: CompanyProfileSocial;
  contact?: CompanyProfileContact;
  taxId?: CompanyProfileTaxId;
  lang?: 'it' | 'en';
}) {
  const sameAs = [
    social?.instagram,
    social?.linkedin,
    social?.facebook,
    social?.x,
    social?.youtube,
    social?.tiktok,
  ]
    .filter(Boolean)
    .map((u) => (u!.startsWith('http') ? u! : `https://${u!}`));

  // LocalBusiness schema (when we have a physical address) ranks markedly
  // better than generic Organization for "near me" / city-scoped queries —
  // exactly the queries our B2B customers hope to win in Italy. Fall back to
  // Organization when no address is provided.
  const hasAddress = !!(contact?.addressLine || contact?.city || contact?.country);
  const schemaType = hasAddress ? 'LocalBusiness' : 'Organization';

  const json: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: companyName,
    url,
  };
  if (logoUrl) json.logo = logoUrl;
  // image helps rich results; use logo as fallback
  if (logoUrl) json.image = logoUrl;
  if (description) json.description = description;
  if (lang) json.inLanguage = lang === 'en' ? 'en' : 'it';
  if (sameAs.length) json.sameAs = sameAs;
  if (contact?.email) json.email = contact.email;
  if (contact?.phone) json.telephone = contact.phone;
  if (contact?.website) {
    json.sameAs = [...(json.sameAs ?? []), contact.website.startsWith('http') ? contact.website : `https://${contact.website}`];
  }
  if (hasAddress) {
    json.address = {
      '@type': 'PostalAddress',
      streetAddress: contact?.addressLine,
      addressLocality: contact?.city,
      addressCountry: contact?.country || (taxId?.country ?? 'IT'),
    };
    // LocalBusiness benefits from areaServed for local SEO ranking.
    if (contact?.city) {
      json.areaServed = contact.city;
    }
  }
  // Tax identifier helps with verification + business search in Google IT.
  if (taxId?.value) {
    json.taxID = `${taxId.country}${taxId.value.replace(/^[A-Z]{2}/i, '')}`;
    json.vatID = json.taxID;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
