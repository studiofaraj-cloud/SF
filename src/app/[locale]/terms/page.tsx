import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { LegalDoc, type LegalSection } from '@/components/site/legal-doc';
import { CONTACT } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

/** Date of the last change to this text: update it with every edit. */
const UPDATED = '2026-09-29';

type Props = { params: Promise<{ locale: string }> };

const META = {
  it: {
    title: 'Termini e condizioni',
    description: 'I termini che regolano l’uso di studiofaraj.it e i servizi di Studio Faraj: preventivi e pagamenti, proprietà dei lavori, pagine aziendali, responsabilità e foro competente.',
  },
  en: {
    title: 'Terms and conditions',
    description: 'The terms for using studiofaraj.it and Studio Faraj’s services: quotes and payments, ownership of the work, business pages, liability and jurisdiction.',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  return generateSEOMetadata({
    ...META[lang],
    url: `${siteConfig.url}/${lang}/terms`,
    locale: lang,
    alternateUrls: { it: `${siteConfig.url}/it/terms`, en: `${siteConfig.url}/en/terms` },
  });
}

const mail = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;

function content(lang: Locale): { lead: string; sections: LegalSection[] } {
  const privacy = getLocalizedPath('/privacy', lang);
  const cookie = getLocalizedPath('/cookie', lang);

  if (lang === 'en') {
    return {
      lead: 'The terms for using studiofaraj.it and the services of Studio Faraj, and for the relationship between Studio Faraj and its clients. Please read them before using our services.',
      sections: [
        {
          id: 'who',
          title: 'Who we are and what these terms cover',
          body: (
            <>
              <p>
                <strong>Studio Faraj</strong>, VAT no. 05783550287, Via Ludovico Ariosto 42, 35128 Padova (PD), Italy · {mail}
              </p>
              <p>These terms govern the use of studiofaraj.it and access to the services of Studio Faraj. By using the site or the services you accept them; if you don’t, please don’t use them.</p>
            </>
          ),
        },
        {
          id: 'services',
          title: 'Services',
          body: (
            <>
              <p>Studio Faraj provides professional digital services, including:</p>
              <ul>
                <li>design and development of custom websites and web applications;</li>
                <li>online stores and custom business software;</li>
                <li>user-interface design;</li>
                <li>search-engine optimisation and digital marketing;</li>
                <li>artificial-intelligence and automation integrations;</li>
                <li>maintenance, updates and performance monitoring;</li>
                <li>cloud infrastructure and hosting;</li>
                <li>consulting for the digital side of a business.</li>
              </ul>
              <p>The details of each project, including scope, timing, costs and deliverables, are set out in a written quote and/or a separate contract agreed with the client before work starts.</p>
            </>
          ),
        },
        {
          id: 'use',
          title: 'Using the site',
          body: (
            <>
              <p>You agree to use the site and the services only for lawful purposes and in line with these terms. In particular, you will:</p>
              <ul>
                <li>give true, accurate and up-to-date information when you contact us or sign up;</li>
                <li>not use the site to send unlawful, offensive or defamatory content, or content that infringes the rights of others;</li>
                <li>not try to gain unauthorised access to the systems, networks or data of Studio Faraj;</li>
                <li>not use automated tools (bots, scrapers and the like) without prior written permission;</li>
                <li>comply with all applicable laws when using the site and the services.</li>
              </ul>
              <p>It is also forbidden to reproduce, distribute or modify the site’s content without written permission, to send unsolicited messages (spam), to infringe the intellectual property of Studio Faraj or of others, to get around the site’s security measures and to collect other users’ personal data without their consent.</p>
            </>
          ),
        },
        {
          id: 'ip',
          title: 'Intellectual property',
          body: (
            <>
              <h3>The site’s content</h3>
              <p>All the content of studiofaraj.it, including text, graphics, logos, icons, images and software, belongs to Studio Faraj or its content suppliers and is protected by Italian and international copyright and intellectual-property law. Any reproduction, distribution, modification or use without prior written permission from Studio Faraj is forbidden.</p>
              <h3>Work made for the client</h3>
              <p>Unless otherwise agreed in writing in the project contract, once the agreed fee has been paid in full:</p>
              <ul>
                <li>the rights to use the finished product (website, graphics and so on) pass to the client on the terms set in the project contract;</li>
                <li>Studio Faraj may show the project in its portfolio and as a commercial reference, unless the client explicitly asks for confidentiality;</li>
                <li>open-source software, libraries and third-party plugins used in the project remain under their own licences.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'payments',
          title: 'Quotes and payments',
          body: (
            <>
              <ul>
                <li>The first consultation is free and without obligation.</li>
                <li>Quotes are valid for 30 days from the date they are issued.</li>
                <li>The accepted quote is the basis of the project contract.</li>
                <li>Typically, a 30–50% deposit is due at the start and the balance on delivery.</li>
                <li>Payments by bank transfer or other agreed methods.</li>
                <li>Invoices are due 15 days from their date.</li>
              </ul>
              <p>If a payment is not made on time, Studio Faraj may suspend the work and/or the active services until it is settled, and apply late-payment interest under Legislative Decree 231/2002.</p>
            </>
          ),
        },
        {
          id: 'business-pages',
          title: 'Business pages',
          body: (
            <>
              <p>From the client area, companies can create and publish a public page at studiofaraj.it/&lt;slug&gt; presenting their business, services, contacts and company details. Publishing requires an active subscription.</p>
              <ul>
                <li>Price: €4.99 a month or €49.99 a year (VAT included, invoiced separately where applicable).</li>
                <li>The first activation includes a free 30-day trial; payment starts when the trial ends.</li>
                <li>Automatic charge on each renewal, to the registered payment method.</li>
                <li>You can cancel at any time from the client area or the Stripe customer portal.</li>
                <li>The page is public only while the subscription is active or in its trial.</li>
                <li>When the subscription ends or is cancelled, the page is removed from the sitemap and shown as unavailable.</li>
                <li>The slug stays reserved for its original holder in case of reactivation. Reserved or offensive slugs can be refused or withdrawn.</li>
              </ul>
              <h3>Effects of cancelling</h3>
              <ul>
                <li>During the free trial: the public page is suspended immediately and nothing is charged.</li>
                <li>On the monthly plan: the page stays public until the end of the current billing period, then it is suspended. There are no refunds for the period already billed.</li>
                <li>On the annual plan: the page stays public until the end of the year already paid, then it is suspended. No partial refunds.</li>
              </ul>
              <p>If a payment fails, there is a 5-day grace period in which Stripe retries the charge. After 5 days without a successful payment the subscription is cancelled automatically and the page becomes unavailable; it can be reactivated by starting a new subscription.</p>
              <p>Payments are handled by Stripe Payments Europe Ltd; Studio Faraj doesn’t store card details. The client is solely responsible for the truthfulness and lawfulness of what it publishes, and Studio Faraj may suspend pages that break the law, the rights of others or these terms.</p>
              <p>The service is for businesses only (B2B): activating a business page requires a VAT number. It is not offered to consumers under art. 3 of the Italian Consumer Code (Legislative Decree 206/2005), so the 14-day right of withdrawal (art. 52) does not apply. The page is hosted on the studiofaraj.it domain and stays part of it: no ownership of the domain or of the infrastructure passes to the client.</p>
            </>
          ),
        },
        {
          id: 'liability',
          title: 'Limitation of liability',
          body: (
            <>
              <p>Studio Faraj works with the utmost care and professionalism. However:</p>
              <ul>
                <li>the site is provided “as is”: Studio Faraj doesn’t guarantee that it is free of errors or interruptions, and is not liable for damage caused by temporary unavailability;</li>
                <li>Studio Faraj is not responsible for the content of third-party sites the site links to;</li>
                <li>in no case is Studio Faraj liable for indirect, incidental, special or consequential damage arising from the use of, or inability to use, the services;</li>
                <li>Studio Faraj is not liable for delays or failures caused by events beyond its reasonable control (for example natural disasters, internet outages, emergency regulations).</li>
              </ul>
            </>
          ),
        },
        {
          id: 'privacy',
          title: 'Personal data',
          body: (
            <p>
              Studio Faraj processes personal data under Regulation (EU) 2016/679 (GDPR) and Italian law. The details are in the <Link href={privacy}>privacy policy</Link> and the <Link href={cookie}>cookie policy</Link>, which are part of these terms.
            </p>
          ),
        },
        {
          id: 'confidentiality',
          title: 'Confidentiality',
          body: <p>Both parties agree to keep confidential the information obtained during the relationship and not to disclose it to third parties without prior written permission, except where the law requires it.</p>,
        },
        {
          id: 'changes',
          title: 'Changes to these terms',
          body: <p>Studio Faraj may change these terms at any time. Changes take effect from the date they are published on the site, which is shown at the top of this page. Continuing to use the site or the services after that means accepting the new terms.</p>,
        },
        {
          id: 'law',
          title: 'Governing law and jurisdiction',
          body: (
            <>
              <p>These terms are governed by Italian law; for anything not covered, the Italian Civil Code and the applicable sector rules apply. For any dispute about these terms or the services, unless otherwise agreed in writing, the Court of Padova has exclusive jurisdiction.</p>
              <p>For consumers (individuals acting for purposes outside their trade or profession), the Italian Consumer Code (Legislative Decree 206/2005) and the mandatory consumer-protection rules apply.</p>
            </>
          ),
        },
        {
          id: 'contact',
          title: 'Contact',
          body: <p>For any question about these terms write to {mail}, or to Studio Faraj, Via Ludovico Ariosto 42, 35128 Padova (PD), Italy.</p>,
        },
      ],
    };
  }

  return {
    lead: 'I termini che regolano l’uso di studiofaraj.it e dei servizi di Studio Faraj, e il rapporto tra Studio Faraj e i suoi clienti. Leggili prima di usare i nostri servizi.',
    sections: [
      {
        id: 'chi-siamo',
        title: 'Chi siamo e cosa regolano questi termini',
        body: (
          <>
            <p>
              <strong>Studio Faraj</strong>, P.IVA 05783550287, Via Ludovico Ariosto 42, 35128 Padova (PD) · {mail}
            </p>
            <p>Questi termini disciplinano l’uso del sito studiofaraj.it e l’accesso ai servizi di Studio Faraj. Usando il sito o i servizi li accetti; se non li accetti, ti chiediamo di non usarli.</p>
          </>
        ),
      },
      {
        id: 'servizi',
        title: 'Servizi',
        body: (
          <>
            <p>Studio Faraj fornisce servizi professionali nel digitale, tra cui:</p>
            <ul>
              <li>progettazione e sviluppo di siti web e applicazioni web su misura;</li>
              <li>negozi online e software gestionali su misura;</li>
              <li>progettazione di interfacce utente;</li>
              <li>ottimizzazione per i motori di ricerca e marketing digitale;</li>
              <li>integrazione di intelligenza artificiale e automazione dei processi;</li>
              <li>manutenzione, aggiornamenti e monitoraggio delle prestazioni;</li>
              <li>infrastrutture cloud e hosting;</li>
              <li>consulenza per il digitale dell’attività.</li>
            </ul>
            <p>I dettagli di ogni progetto, compresi attività, tempi, costi e consegne, sono definiti in un preventivo scritto e/o in un contratto separato concordato con il cliente prima dell’avvio dei lavori.</p>
          </>
        ),
      },
      {
        id: 'uso',
        title: 'Uso del sito',
        body: (
          <>
            <p>Ti impegni a usare il sito e i servizi solo per finalità lecite e nel rispetto di questi termini. In particolare:</p>
            <ul>
              <li>fornirai informazioni veritiere, accurate e aggiornate quando ci contatti o ti registri;</li>
              <li>non userai il sito per trasmettere contenuti illeciti, offensivi, diffamatori o lesivi dei diritti di terzi;</li>
              <li>non tenterai di accedere senza autorizzazione a sistemi, reti o dati di Studio Faraj;</li>
              <li>non userai strumenti automatizzati (bot, scraper e simili) senza previa autorizzazione scritta;</li>
              <li>rispetterai tutte le leggi applicabili nell’uso del sito e dei servizi.</li>
            </ul>
            <p>È inoltre vietato riprodurre, distribuire o modificare i contenuti del sito senza autorizzazione scritta, inviare comunicazioni non sollecitate (spam), violare i diritti di proprietà intellettuale di Studio Faraj o di terzi, aggirare le misure di sicurezza del sito e raccogliere dati personali di altri utenti senza il loro consenso.</p>
          </>
        ),
      },
      {
        id: 'proprieta',
        title: 'Proprietà intellettuale',
        body: (
          <>
            <h3>Contenuti del sito</h3>
            <p>Tutti i contenuti di studiofaraj.it, inclusi testi, grafica, loghi, icone, immagini e software, sono di proprietà di Studio Faraj o dei suoi fornitori di contenuti e sono protetti dalle leggi italiane e internazionali sul diritto d’autore e sulla proprietà intellettuale. È vietata qualsiasi riproduzione, distribuzione, modifica o utilizzo senza previa autorizzazione scritta di Studio Faraj.</p>
            <h3>Lavori realizzati per il cliente</h3>
            <p>Salvo diversi accordi scritti nel contratto di progetto, una volta saldato integralmente il corrispettivo pattuito:</p>
            <ul>
              <li>i diritti di utilizzo del prodotto finito (sito web, grafica e simili) passano al cliente nei termini definiti nel contratto di progetto;</li>
              <li>Studio Faraj può citare il progetto nel proprio portfolio e come referenza commerciale, salvo esplicita richiesta di riservatezza del cliente;</li>
              <li>il software open source, le librerie e i plugin di terze parti usati nel progetto restano soggetti alle rispettive licenze.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'pagamenti',
        title: 'Preventivi e pagamenti',
        body: (
          <>
            <ul>
              <li>La prima consulenza è gratuita e senza impegno.</li>
              <li>I preventivi sono validi 30 giorni dalla data di emissione.</li>
              <li>Il preventivo accettato è la base del contratto di progetto.</li>
              <li>Di norma: acconto del 30–50% all’avvio, saldo alla consegna.</li>
              <li>Pagamenti tramite bonifico bancario o altri metodi concordati.</li>
              <li>Le fatture scadono a 15 giorni dalla data di emissione.</li>
            </ul>
            <p>In caso di mancato pagamento nei termini, Studio Faraj può sospendere i lavori e/o i servizi attivi fino alla regolarizzazione e applicare gli interessi di mora previsti dal D.Lgs. 231/2002.</p>
          </>
        ),
      },
      {
        id: 'pagine-aziendali',
        title: 'Pagine aziendali',
        body: (
          <>
            <p>Dall’area clienti le aziende possono creare e pubblicare una pagina pubblica all’indirizzo studiofaraj.it/&lt;slug&gt;, con la presentazione dell’attività, i servizi, i contatti e i dati aziendali. La pubblicazione richiede un abbonamento attivo.</p>
            <ul>
              <li>Costo: 4,99 € al mese oppure 49,99 € all’anno (IVA inclusa, fatturata a parte se applicabile).</li>
              <li>La prima attivazione include 30 giorni di prova gratuita; il pagamento parte alla fine della prova.</li>
              <li>Addebito automatico a ogni rinnovo sul metodo di pagamento registrato.</li>
              <li>Disdetta in qualsiasi momento dall’area clienti o dal portale clienti di Stripe.</li>
              <li>La pagina è pubblica solo finché l’abbonamento è attivo o in prova.</li>
              <li>Alla scadenza o in caso di disdetta la pagina viene tolta dalla sitemap e mostrata come non disponibile.</li>
              <li>Lo slug resta riservato al titolare originario in caso di riattivazione. Slug riservati o offensivi possono essere rifiutati o revocati.</li>
            </ul>
            <h3>Effetti della disdetta</h3>
            <ul>
              <li>Durante la prova gratuita: la pagina pubblica viene sospesa subito e non viene addebitato nulla.</li>
              <li>Sul piano mensile: la pagina resta pubblica fino alla fine del periodo di fatturazione in corso, poi viene sospesa. Nessun rimborso per il periodo già fatturato.</li>
              <li>Sul piano annuale: la pagina resta pubblica fino alla fine dell’anno già pagato, poi viene sospesa. Nessun rimborso parziale.</li>
            </ul>
            <p>Se un pagamento non va a buon fine, c’è un periodo di tolleranza di 5 giorni in cui Stripe ritenta l’addebito. Passati 5 giorni senza un pagamento riuscito, l’abbonamento viene cancellato automaticamente e la pagina non è più disponibile; si può riattivare avviando un nuovo abbonamento.</p>
            <p>I pagamenti sono gestiti da Stripe Payments Europe Ltd; Studio Faraj non conserva i dati della carta. Il cliente è l’unico responsabile della veridicità e della liceità dei contenuti che pubblica, e Studio Faraj può sospendere le pagine che violano la legge, i diritti di terzi o questi termini.</p>
            <p>Il servizio è riservato alle aziende (B2B): per attivare una pagina aziendale serve una Partita IVA. Non è offerto ai consumatori ai sensi dell’art. 3 del D.Lgs. 206/2005, quindi non si applica il diritto di recesso di 14 giorni (art. 52). La pagina è ospitata sul dominio studiofaraj.it e ne resta parte: al cliente non passa alcun diritto sul dominio o sull’infrastruttura.</p>
          </>
        ),
      },
      {
        id: 'responsabilita',
        title: 'Limitazione di responsabilità',
        body: (
          <>
            <p>Studio Faraj lavora con la massima cura e professionalità. Tuttavia:</p>
            <ul>
              <li>il sito è fornito “così com’è”: Studio Faraj non garantisce che sia privo di errori o interruzioni e non risponde dei danni dovuti a indisponibilità temporanea;</li>
              <li>Studio Faraj non è responsabile dei contenuti dei siti di terzi a cui il sito rimanda;</li>
              <li>in nessun caso Studio Faraj risponde di danni indiretti, incidentali, speciali o consequenziali derivanti dall’uso o dall’impossibilità di usare i servizi;</li>
              <li>Studio Faraj non risponde di ritardi o inadempimenti dovuti a eventi fuori dal suo ragionevole controllo (ad esempio calamità naturali, interruzioni di internet, normative emergenziali).</li>
            </ul>
          </>
        ),
      },
      {
        id: 'dati-personali',
        title: 'Dati personali',
        body: (
          <p>
            Studio Faraj tratta i dati personali secondo il Regolamento (UE) 2016/679 (GDPR) e la normativa italiana. I dettagli sono nell’<Link href={privacy}>informativa privacy</Link> e nella <Link href={cookie}>cookie policy</Link>, che fanno parte di questi termini.
          </p>
        ),
      },
      {
        id: 'riservatezza',
        title: 'Riservatezza',
        body: <p>Le parti si impegnano a mantenere riservate le informazioni ottenute nel corso del rapporto e a non divulgarle a terzi senza previa autorizzazione scritta, salvo obblighi di legge.</p>,
      },
      {
        id: 'modifiche',
        title: 'Modifiche a questi termini',
        body: <p>Studio Faraj può modificare questi termini in qualsiasi momento. Le modifiche valgono dalla data di pubblicazione sul sito, indicata in cima a questa pagina. Continuare a usare il sito o i servizi dopo la pubblicazione significa accettare i nuovi termini.</p>,
      },
      {
        id: 'legge',
        title: 'Legge applicabile e foro competente',
        body: (
          <>
            <p>Questi termini sono regolati dalla legge italiana; per quanto non previsto si applicano il Codice civile e le norme di settore. Per qualsiasi controversia relativa a questi termini o ai servizi, salvo diverso accordo scritto, è competente in via esclusiva il Tribunale di Padova.</p>
            <p>Per i consumatori (persone fisiche che agiscono per scopi estranei all’attività professionale) si applicano il Codice del consumo (D.Lgs. 206/2005) e le norme inderogabili a loro tutela.</p>
          </>
        ),
      },
      {
        id: 'contatti',
        title: 'Contatti',
        body: <p>Per qualsiasi domanda su questi termini scrivi a {mail}, oppure a Studio Faraj, Via Ludovico Ariosto 42, 35128 Padova (PD).</p>,
      },
    ],
  };
}

/** /terms — terms and conditions, in Italian and English. Server component. */
export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const c = content(lang);
  return <LegalDoc locale={lang} doc="terms" title={META[lang].title} lead={c.lead} updated={UPDATED} sections={c.sections} />;
}
