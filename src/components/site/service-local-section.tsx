import { CheckCircle, HelpCircle, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import {
  SERVICE_ACCENTS,
  ServiceFaq,
  ServiceFeatureCard,
  ServiceRelated,
  ServiceSection,
  ServiceSectionHeader,
  type ServiceAccent,
} from '@/components/site/service-theme';
import { generateStructuredDataFAQPage } from '@/lib/seo';
import {
  SERVICE_AREA,
  SERVICE_LOCAL_CONTENT,
  type ServiceLocalKey,
} from '@/lib/service-local-content';

/** Each service page's colour, as used by its hero and feature cards. */
const ACCENT_BY_SERVICE: Record<ServiceLocalKey, ServiceAccent> = {
  ecommerce: 'emerald',
  seoMarketing: 'teal',
  designUIUX: 'violet',
  aiAutomation: 'pink',
  consulting: 'fuchsia',
  maintenance: 'orange',
  hostingCloud: 'indigo',
};

/**
 * Long-form local-SEO block for a /servizi/* page: explanatory copy, service
 * area, FAQ (+ FAQPage JSON-LD) and links to related services.
 *
 * Italian only — the copy targets "<servizio> Padova/Veneto" searches, so the
 * English pages render nothing. Styled like the sections above it, but with
 * no client hooks and no fade-in, so the full text is in the server HTML and
 * visible immediately.
 *
 * Two sections with alternating backgrounds. `firstBackground` lets a page
 * whose previous section is already a band start with the gradient instead.
 */
export function ServiceLocalSection({
  service,
  locale,
  firstBackground = 'band',
}: {
  service: ServiceLocalKey;
  locale: string;
  firstBackground?: 'band' | 'gradient';
}) {
  if (locale !== 'it') return null;
  const c = SERVICE_LOCAL_CONTENT[service];
  const accent = ACCENT_BY_SERVICE[service];
  const a = SERVICE_ACCENTS[accent];
  const secondBackground = firstBackground === 'band' ? 'gradient' : 'band';

  return (
    <>
      <ServiceSection background={firstBackground}>
        <ServiceSectionHeader
          accent={accent}
          icon={MapPin}
          badge="Padova e Veneto"
          title={c.heading}
          highlight={c.headingHighlight}
        />

        <div className="max-w-5xl mx-auto">
          <Card className="holographic-card neon-border overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {c.paragraphs.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {c.points.map((pt) => (
              <ServiceFeatureCard key={pt.title} accent={accent} icon={CheckCircle} title={pt.title}>
                {pt.body}
              </ServiceFeatureCard>
            ))}
          </div>

          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm mt-6">
            <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center ${a.iconTile}`}>
                <MapPin className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${a.text}`}>{SERVICE_AREA.heading}</h3>
                <p className="text-muted-foreground leading-relaxed">{SERVICE_AREA.body}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ServiceSection>

      <ServiceSection background={secondBackground}>
        <StructuredDataServer data={generateStructuredDataFAQPage(c.faqs)} id={`faq-${service}`} />

        <ServiceSectionHeader
          accent={accent}
          icon={HelpCircle}
          badge="FAQ"
          title="Domande"
          highlight="frequenti"
        />
        <ServiceFaq accent={accent} faqs={c.faqs} />
        <ServiceRelated accent={accent} links={c.related} locale={locale} />
      </ServiceSection>
    </>
  );
}
