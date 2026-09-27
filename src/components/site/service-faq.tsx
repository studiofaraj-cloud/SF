import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataFAQPage } from '@/lib/seo';
import { RevealWords } from './reveal-words';

type Faq = { question: string; answer: string };

/**
 * FAQ as native <details>: opens without JavaScript and keeps every answer in
 * the HTML. Also emits the FAQPage JSON-LD for the same questions.
 */
export function FaqList({ faqs, id }: { faqs: Faq[]; id: string }) {
  return (
    <>
      <StructuredDataServer data={generateStructuredDataFAQPage(faqs)} id={id} />
      <div className="border-t border-border">
        {faqs.map((f) => (
          <details key={f.question} className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 font-display text-lg font-semibold tracking-[-0.01em] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:text-xl [&::-webkit-details-marker]:hidden">
              {f.question}
              <Plus aria-hidden className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45 group-open:text-primary" />
            </summary>
            <p className="pb-6 pr-10 leading-relaxed text-muted-foreground">{f.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}

/** A service page's FAQ section: heading on the left, the questions beside it. */
export function FaqSection({ title, faqs, id, children }: { title: string; faqs: Faq[]; id: string; children?: ReactNode }) {
  return (
    <section className="container mx-auto px-5 md:px-8">
      <div className="grid gap-10 lg:grid-cols-12">
        <h2 className="rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem] lg:col-span-4">
          <RevealWords text={title} />
        </h2>
        <div className="lg:col-span-8">
          <FaqList faqs={faqs} id={id} />
          {children}
        </div>
      </div>
    </section>
  );
}
