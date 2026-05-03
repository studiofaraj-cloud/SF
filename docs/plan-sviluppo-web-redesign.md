# Sviluppo Web — Page Redesign Plan

Path: `src/app/[locale]/servizi/sviluppo-web/page.tsx`
Goal: Move from a generic "cards-only" services page to a **structured, narrative, conversion-oriented** page that communicates *who we are*, *how we work*, *what we build*, and *why we are different* — with quote pop-ups embedded at every decision point.

---

## 1. Strategic positioning (the story we tell)

We are NOT a no-code agency. We are NOT a template shop. We are:

- **100% code-first** — every site is hand-built with HTML / CSS / JS / TS / React / Next.js.
- **Gen-Z team** — modern aesthetics, fluent in current UX patterns, native to the tools we use.
- **Engineers, not just designers** — we model data, build admin dashboards, integrate payments, automate marketing, ship AI.
- **Domain-aware** — we onboard the technical language of regulated/specialist industries (medical, legal, real estate, automotive, architecture, surveying, dental) before writing a line of code.
- **Padova-based, EU-grade** — fast response, real people, real accountability (P.IVA visible).

This positioning must be felt across every section, not just stated in a hero tagline.

---

## 2. Section-by-section structure (top → bottom)

Each section has: purpose · content · key visual · CTA hook.

### 2.1 Hero — "Code is our craft"
- **Purpose**: instant identity — code, not drag-and-drop.
- **Content**:
  - Eyebrow badge: `Sviluppo Web · Padova`
  - H1 with gradient: "Siti e piattaforme costruite **riga per riga**."
  - Sub: short claim about 100% code, performance, autonomia per il cliente.
  - Primary CTA: **"Richiedi un preventivo"** → opens QuoteDialog (preselected service: `sviluppo-web`).
  - Secondary CTA: "Vedi i nostri progetti" → `/projects`.
  - Trust strip: response time · preventivo gratuito · P.IVA · Made in Italy.
- **Visual**: keep `RippleGrid` background. Add a small **live code snippet card** (animated typewriter) showing a real React component instead of just floating shapes — reinforces "we actually code".

### 2.2 "Perché siamo diversi" — Differentiators (replaces generic features grid)
- **Purpose**: address the elephant — *"why not Wix / Squarespace / random freelance?"*.
- **Format**: 4 horizontal comparison rows (table-style, NOT cards):

| | Template / No-code | Freelance generico | **Studio Faraj** |
|---|---|---|---|
| Codice | ❌ chiuso | ⚠️ variabile | ✅ 100% open, tuo |
| Performance | ⚠️ media | ⚠️ variabile | ✅ Lighthouse 95+ |
| Admin dashboard | ❌ limitato | ❌ raro | ✅ su misura |
| Scalabilità | ❌ blocca su pricing | ⚠️ refactor | ✅ Next.js + cloud |
| Conoscenza di dominio | ❌ generico | ⚠️ generalista | ✅ on-boarding tecnico |
| Supporto | 🤖 chatbot | ❓ "quando posso" | ✅ team dedicato |

- **CTA inline**: "Parla con noi 15 min" → opens QuoteDialog (variant: consulenza gratuita).

### 2.3 "Cosa costruiamo" — Solution archetypes (the meat of the page)
Replace abstract "features" with **3 concrete product archetypes** the visitor can self-identify with. Each is a full-width section with text + mockup illustration, alternating left/right.

#### Archetype A — Sito vetrina professionale
- For: studi professionali, freelance, piccole aziende.
- Includes: design custom, SEO base, modulo richiesta preventivo, integrazione email transazionale, multilingua.
- Tech badges: Next.js · TS · Tailwind · Resend · Vercel.
- CTA: **"Preventivo vetrina"** → QuoteDialog (prefill: `sviluppo-web`, package: `vetrina`).

#### Archetype B — Sito dinamico con dashboard admin (★ flagship)
- For: **immobiliari, concessionarie, noleggi, e-commerce flash, eventi** — chiunque gestisca inventario che entra/esce.
- Pain we solve: "ogni volta devo chiamare lo sviluppatore per aggiungere una casa / un'auto / un appartamento". → **Mai più.**
- Includes:
  - Admin dashboard con autenticazione e ruoli.
  - CRUD completo: aggiungi · modifica · pubblica · archivia · elimina.
  - Upload immagini, galleria, schede tecniche, varianti.
  - Filtri pubblici dinamici (prezzo, zona, anno, ecc.).
  - Notifiche email automatiche al cambio stato.
- Concrete examples called out by name:
  - **Real estate** — appartamenti, case, terreni, virtual tour.
  - **Automotive** — auto usate/nuove, schede tecniche, KM, prezzo, foto.
  - **Noleggi** — calendario disponibilità, prenotazioni online.
  - **Eventi / corsi** — sessioni a tempo limitato.
- CTA: **"Voglio gestire il mio inventario"** → QuoteDialog (prefill: `sviluppo-web`, package: `dashboard`).

#### Archetype C — Piattaforma con pagamenti + automazioni
- For: e-commerce, SaaS, marketplace, abbonamenti.
- Includes:
  - Pagamenti: **Stripe, PayPal, Satispay, Klarna, bonifico, carte**.
  - Email transazionali (ordini, fatture, reset password).
  - **Sistema di mail marketing automatico** (drip campaigns, segmentazione).
  - **AI bot** (assistenza clienti, qualificazione lead, FAQ dinamiche).
  - Analytics / dashboard KPI.
- CTA: **"Costruisci la mia piattaforma"** → QuoteDialog (prefill: `e-commerce` or `sviluppo-web`, package: `platform`).

### 2.4 "Settori che padroneggiamo" — Domain expertise band
- **Purpose**: dissolvere il dubbio *"capiranno il mio settore?"*.
- **Format**: griglia compatta di 8–12 settori con icona + 1 riga di vocabolario tecnico che padroneggiamo. Esempi:
  - 🏛️ **Architetti** — render, tavole, portfolio progetti, area clienti riservata.
  - 🦷 **Dentisti / Medici** — prenotazioni online, GDPR, anamnesi digitali, area pazienti.
  - 📐 **Geometri / Periti** — pratiche catastali, gestione documentale, firma digitale.
  - 🏠 **Immobiliari** — gestione immobili, planimetrie, virtual tour, lead capture.
  - 🚗 **Concessionarie auto** — schede veicolo, finanziamenti, configuratore.
  - ⚖️ **Studi legali** — area clienti, fascicoli, riservatezza, calendario udienze.
  - 🏗️ **Imprese edili** — cantieri, gallerie progetti, preventivi rapidi.
  - 💊 **Farmacie / Parafarmacie** — catalogo, prenotazione ritiro, abbonamenti.
  - 🎓 **Scuole / Formazione** — iscrizioni, pagamenti corsi, area studenti.
  - 🏨 **Hospitality** — booking engine, calendario, multilingua.
  - 🍽️ **Ristoranti** — menù dinamico, prenotazioni, ordini online.
  - 🛠️ **Artigiani / B2B tecnici** — cataloghi tecnici, schede prodotto con specifiche.
- Riga di chiusura: *"Non vedi il tuo settore? Lo studiamo. Ogni progetto inizia con un'analisi tecnica del tuo dominio."*
- CTA: **"Raccontami il mio settore"** → QuoteDialog.

### 2.5 "Come lavoriamo" — Process (timeline, not cards)
- Riusa il componente esistente `process-timeline.tsx` se compatibile, altrimenti fa una vera **timeline verticale** (line + nodes), non una griglia di cards.
- 6 step:
  1. **Discovery & analisi tecnica** — capiamo dominio, vincoli, obiettivi misurabili.
  2. **Architettura & wireframe** — struttura dati, flussi, prototipi.
  3. **Design UI** — moodboard, design system, prototipo cliccabile.
  4. **Sviluppo** — sprints settimanali, demo live, repo accessibile.
  5. **QA, performance, SEO, accessibilità** — Lighthouse 95+, WCAG.
  6. **Lancio + formazione admin** — handoff dashboard, manuale, supporto.
- Ogni step: durata indicativa + deliverable concreto.
- CTA finale di sezione: **"Inizia il discovery"** → QuoteDialog.

### 2.6 "Il nostro stack" — Technology section (riprogettato)
- Sostituire le **progress bar percentuali** (sembrano arbitrarie) con una **griglia di logo-card raggruppate per categoria**:
  - **Frontend**: HTML, CSS, JS, TS, React, Next.js, Tailwind.
  - **Backend / Data**: Node.js, Firebase, PostgreSQL, MongoDB, Prisma.
  - **Email & Marketing**: Resend, SendGrid, Postmark, automazioni custom.
  - **AI**: OpenAI, Anthropic, embeddings, RAG, chatbot custom.
  - **Pagamenti**: Stripe, PayPal, Satispay, Klarna.
  - **Cloud / DevOps**: Vercel, AWS, Firebase Hosting, GitHub Actions.
- Sotto la griglia: 1 riga di claim — *"Ogni scelta tecnica giustificata. Nessuna black box."*
- Riusare `tech-icons.tsx` / `tech-logos-client.tsx` se già presenti.

### 2.7 "Risultati misurabili" — Proof band (NEW)
- 4 KPI numerici a tutta larghezza con counter on-scroll:
  - `95+` Lighthouse score medio
  - `< 1.5s` LCP medio
  - `100%` codice consegnato al cliente
  - `24h` tempo medio di risposta
- Sotto: 2-3 mini-testimonial reali (riusare `testimonials-section.tsx` se già esiste in versione ridotta).

### 2.8 FAQ (NEW)
- 6–8 domande reali, con accordion:
  - "Posso modificare il sito da solo dopo la consegna?"
  - "Il codice è mio?"
  - "Quanto costa un sito vetrina? Un gestionale?"
  - "Lavorate fuori da Padova?"
  - "Cosa succede se il mio fornitore di hosting cambia?"
  - "Potete riscrivere un sito esistente?"
  - "Integrate con il mio gestionale (es. CRM, Fatturapro)?"
  - "Fate manutenzione dopo il lancio?"
- Schema.org FAQPage JSON-LD per SEO.

### 2.9 CTA finale — "Parliamone"
- Mantenere la sezione attuale ma riorientarla: due path chiari.
  - **Path A**: "Ho già un'idea chiara" → QuoteDialog completo.
  - **Path B**: "Voglio prima parlarne" → BookingDialog (call 30 min gratuita) — riusare `booking-dialog.tsx`.
- Trust strip finale: tempi · gratuito · P.IVA · sede Padova.

---

## 3. Quote pop-up — UX flow

Esiste già `src/components/site/quote-dialog.tsx`. Lo riutilizziamo, estendendolo:

### 3.1 Trigger points (almeno 6 nella pagina)
1. Hero CTA primario.
2. Differenziatori — "Parla con noi 15 min".
3. Ogni Archetype card (3 trigger).
4. Settori band — "Raccontami il mio settore".
5. Process — "Inizia il discovery".
6. CTA finale.

### 3.2 Prefill via context
Modificare `QuoteDialogProps` per accettare:
```ts
type QuoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: {
    service?: string;       // 'sviluppo-web' | 'e-commerce' | ...
    package?: 'vetrina' | 'dashboard' | 'platform' | 'consulenza';
    industry?: string;      // 'real-estate' | 'automotive' | ...
    message?: string;       // pre-compiled context line
  };
};
```
- Quando un visitatore clicca "Voglio gestire il mio inventario" da Archetype B, il dialog si apre con: service=sviluppo-web, package=dashboard, message="Sono interessato a un sito dinamico con dashboard admin per gestire…".
- Riduce attrito → migliora conversione.

### 3.3 Stato globale lightweight
- Un `useState` a livello pagina + un `QuoteContext` opzionale è eccessivo per ora; basta uno stato locale `<SviluppoWebPage>` con `{open, prefill}` e una funzione `openQuote(prefill)` passata ai bottoni.

---

## 4. Componenti nuovi vs riusati

### Riusare (già presenti)
- `QuoteDialog` (estendere props con `prefill`).
- `BookingDialog` (CTA "parliamone").
- `ScrollFadeIn`, `GradientText`, `RippleGrid`, `Card`, `Badge`, `Button`.
- `tech-icons.tsx` / `tech-logos-client.tsx` per la sezione stack.
- `process-timeline.tsx` se compatibile.
- `testimonials-section.tsx` (variante compatta).

### Nuovi componenti (in `src/components/site/sviluppo-web/`)
- `hero-code-card.tsx` — card con typewriter snippet animato.
- `differentiators-table.tsx` — comparison table responsive (su mobile diventa cards stack).
- `archetype-section.tsx` — sezione full-width image+text alternata, accetta props (title, description, bullets, techs, ctaLabel, prefill).
- `industries-grid.tsx` — griglia settori con icona + tagline + click→quote.
- `tech-stack-grid.tsx` — griglia loghi raggruppata per categoria.
- `kpi-strip.tsx` — counter on-scroll.
- `faq-accordion.tsx` (con JSON-LD).

---

## 5. i18n

Tutta la nuova copy va in:
- `messages/it.json` → `services.webDevelopment.*`
- `messages/en.json` → corrispettivo.

Nuove chiavi da aggiungere (struttura proposta):
```
services.webDevelopment.differentiators.{title, rows[]}
services.webDevelopment.archetypes.{vetrina, dashboard, platform}.{title, description, bullets[], cta}
services.webDevelopment.industries.{title, items[]}
services.webDevelopment.kpis.{lighthouse, lcp, ownership, response}
services.webDevelopment.faq.items[]
services.webDevelopment.cta.pathA, cta.pathB
```

---

## 6. Performance & SEO

- Tutte le sezioni pesanti (`RippleGrid`, archetype illustrations) → `dynamic()` con `ssr: false` solo dove serve interattività.
- Immagini archetypes → `next/image` con `priority` solo per la prima.
- FAQ → JSON-LD `FAQPage` schema.
- Page → JSON-LD `Service` schema (areaServed: Padova/Veneto/Italia).
- Meta title/description in `layout.tsx`.

---

## 7. Accessibilità

- Comparison table: usare `<table>` semantica con `<caption>` su desktop, stacked cards su mobile.
- Tutti i CTA dialog-trigger: `aria-haspopup="dialog"`.
- FAQ accordion: pattern WAI-ARIA conforme.
- Focus visibile sui CTA neon-glow (no `outline:none` senza fallback).
- Contrasto su `text-muted-foreground` su sfondi scuri ≥ 4.5:1.

---

## 8. Mobile

- Hero: ridurre altezza minima a `70svh`, code card sotto il testo (no overlap).
- Differentiators table → stacked cards (un mini-card per riga competitor).
- Archetypes: image sopra, text sotto, no `lg:grid-cols-2` forzato.
- Industries grid: 2 colonne su mobile, 4 su desktop.
- CTA dialog trigger: bottoni full-width sotto i 640px.

---

## 9. Implementation order (proposta)

1. ✅ Plan (this file).
2. Estendere `QuoteDialog` con prop `prefill`.
3. Aggiungere chiavi i18n (it + en) — almeno per le prime 3 sezioni.
4. Costruire la pagina top-down, sezione per sezione, ognuna come componente isolato in `src/components/site/sviluppo-web/`.
5. Sostituire `page.tsx` con la nuova composizione, mantenendo Hero + final CTA esistenti come fallback finché le nuove sezioni non sono complete.
6. Aggiungere FAQ JSON-LD e Service schema in `layout.tsx`.
7. QA su mobile/tablet/desktop + Lighthouse.
8. Replicare struttura sulle altre pagine `servizi/*` come fase successiva.

---

## 10. Open questions per l'utente (decisioni prima di codare)

1. **Mockup per Archetypes**: vuoi che generi placeholder SVG/illustrazioni o usiamo screenshot di progetti reali (Pirola, Dimensione, Naviglio se disponibili)?
2. **KPI numbers**: i 4 numeri (`95+`, `<1.5s`, `100%`, `24h`) vanno bene o vuoi numeri diversi/più specifici (es. progetti completati, anni di esperienza, clienti attivi)?
3. **Tier pricing visibile?** Mostrare fasce di prezzo indicative per i 3 archetypes (es. vetrina da €X, dashboard da €Y) o tenere tutto "su preventivo"?
4. **Settori**: la lista 12 settori va bene così o vuoi aggiungerne/rimuoverne?
5. **Live code card in hero**: sì o troppo "sviluppatore-centrico" per un cliente non-tech?
6. **FAQ**: ti va bene la lista proposta o vuoi che la riscriva con domande specifiche del tuo target?

Una volta confermati questi punti, procedo con l'implementazione step 2 → 7.
