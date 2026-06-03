# Pre-Launch Checklist — Studio Faraj Hub + Pagine Aziendali

Lista degli step da completare PRIMA di accendere il sistema in live mode con
clienti veri. Spunta ogni voce.

---

## 1. Stripe (Live mode) — setup parallelo all'account test

> Lo Stripe Dashboard ha modalità test e live completamente separate. Tutto
> quello che hai configurato in test va ricreato in live.

### 1.1 Prodotti + prezzi (in live mode)

- [ ] Switch Dashboard a **"Live mode"** (toggle in alto a sinistra, sfondo
      passa da arancione a viola/blu)
- [ ] Catalogo prodotti → **+ Aggiungi prodotto**
  - Nome: `Pagina Aziendale`
  - Modello: Ricorrente
  - Tariffa 1: `€4,99` / mensile → annota `price_live_xxx_monthly`
  - Tariffa 2: `€49,99` / annuale → annota `price_live_xxx_annual`

### 1.2 Webhook endpoint

- [ ] Developers → Webhooks → **+ Add endpoint**
- [ ] URL: `https://studiofaraj.it/api/stripe/webhook`
- [ ] Eventi da sottoscrivere:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `invoice.upcoming`
  - `charge.dispute.created`
  - `charge.dispute.closed`
  - `checkout.session.completed` (per i quote esistenti)
- [ ] Salva → click sull'endpoint → reveal **signing secret** → annota
      `whsec_live_xxx`

### 1.3 Smart retries (5 giorni grace)

- [ ] Settings → Billing → Subscriptions and emails → **Manage failed
      payments** (Gestisci pagamenti non riusciti)
- [ ] Retry strategy: max 3-4 tentativi distribuiti su **5 giorni**
- [ ] After final failure: **Cancel subscription**
- [ ] Salva

### 1.4 Customer Portal

- [ ] Settings → Billing → Customer Portal → **Activate test link**
- [ ] Abilita:
  - Cancel subscription
  - Update payment method
  - View invoice history
  - Update billing details
- [ ] Cancellation reasons: aggiungi 4-5 motivi (per analytics: troppo caro,
      non mi serve più, problemi tecnici, ho trovato alternativa, altro)

### 1.5 API keys (live)

- [ ] Developers → API keys → reveal **Secret key live** → annota `sk_live_xxx`
- [ ] (Publishable key non serve nel nostro stack — la usiamo solo lato
      server)

---

## 2. Environment variables in produzione

Setta queste su Google Cloud Secret Manager / Firebase App Hosting config
(NON nel .env del repo). Tutti i valori `LIVE` vanno presi dallo step 1.

```
# Stripe (live)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxx
STRIPE_COMPANY_PROFILE_PRICE_ID=price_live_monthly_xxx
STRIPE_COMPANY_PROFILE_PRICE_ID_ANNUAL=price_live_annual_xxx

# Site
NEXT_PUBLIC_SITE_URL=https://studiofaraj.it
EMAIL_SITE_URL=https://studiofaraj.it
SESSION_SECRET=<32+ random chars, openssl rand -base64 32>

# Brevo (production sender)
BREVO_API_KEY=xkeysib-xxx
EMAIL_FROM=Studio Faraj <info@studiofaraj.it>

# Firebase (production project)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

- [ ] Tutte le env var sopra sono in produzione
- [ ] Restart del servizio per leggerle

---

## 3. Brevo (transactional email)

### 3.1 Domain verification

- [ ] Brevo Dashboard → Settings → **Senders & IPs** → Domains
- [ ] Aggiungi `studiofaraj.it` se non c'è
- [ ] Genera SPF + DKIM TXT records → copia
- [ ] Vai sul DNS panel di register.it → aggiungi i record:
  - SPF: `v=spf1 include:spf.sendinblue.com mx ~all`
  - DKIM: 3 record CNAME forniti da Brevo
  - DMARC (opzionale ma consigliato): `v=DMARC1; p=quarantine; rua=mailto:info@studiofaraj.it`
- [ ] Attendi propagazione (~1-24h) → torna su Brevo → click "Verify"
- [ ] Verifica che il dominio appaia con tick verde

### 3.2 Win-back automation workflow

Segui [docs/brevo-winback-workflow.md](brevo-winback-workflow.md):

- [ ] Lista contatti `cancelled-company-profile` creata
- [ ] Workflow "Win-back +7gg / +30gg" configurato in Brevo Automation
- [ ] Coupon `WINBACK30` (-30%) creato in Stripe Dashboard

### 3.3 Test deliverability

- [ ] Manda email di prova a Gmail, Outlook, ProtonMail, iCloud
- [ ] Verifica che non vada in spam
- [ ] Tutti i mittenti mostrano nome `Studio Faraj` (non `info@studiofaraj.it`)

---

## 4. Smoke test end-to-end (prima di andare live)

Da fare su PRODUZIONE con account reale e carta vera (poi cancelli subito).

- [ ] Registra un nuovo account via `/it/hub/login?mode=register`
- [ ] Ricevi **email di benvenuto** in inbox (non spam)
- [ ] Admin riceve l'**alert "Nuovo cliente registrato"**
- [ ] Compila profilo aziendale (`/it/hub/company-profile/edit`)
- [ ] Salva → redirect a `subscription/start`
- [ ] Spunta T&C → click "Continua al checkout"
- [ ] Apri Stripe Checkout → paga con carta vera (€0 perché 30gg trial)
- [ ] Redirect a `subscription?status=success`
- [ ] **NON** ricevi email di payment receipt (perché €0, corretto)
- [ ] Vai su `studiofaraj.it/<tuo-slug>` → vedi la pagina pubblicata ✅
- [ ] Vai su Stripe Customer Portal → cancella subscription
- [ ] Ricevi **email "Abbonamento cancellato"**
- [ ] La pagina pubblica ora mostra "Pagina non disponibile" ✅
- [ ] Verifica che lo slug sia rimosso dal sitemap entro ~10 minuti

---

## 5. Operatività post-launch

### 5.1 Monitoring

- [ ] Iscriviti agli alert email/Slack di Stripe per:
  - Dispute aperti
  - Pagamenti falliti consecutivi
  - Churn anomalo
- [ ] Setup Sentry o equivalente per errori runtime in produzione
- [ ] Dashboard Firebase: configura alert per query Firestore lente / errori
      di scrittura

### 5.2 Customer support

- [ ] Apri `info@studiofaraj.it` su un client mobile per risposte rapide
- [ ] Crea un template di risposta per richieste comuni:
  - "Come cambio il metodo di pagamento?" → link al Customer Portal
  - "Come ottengo la fattura elettronica via SDI?" → spiega procedura
    (servizio gestito manualmente, vedi step 6)
  - "Come cancello l'abbonamento?" → link al Customer Portal
- [ ] Pagina `/contatti` raggiungibile, FormSubmit funzionante

### 5.3 Backups + safety net

- [ ] Firestore: abilita backup automatici giornalieri (Firebase Console →
      Firestore → Backups → Schedule)
- [ ] Firebase Storage: stessa cosa
- [ ] Procedura di recovery testata almeno una volta

---

## 6. Fatturazione elettronica (manuale per ora)

Il piano dice "fattura manuale per ora" — ricorda:

- [ ] Ogni mese (es. il 5 del mese), apri Stripe Dashboard → Payments
- [ ] Esporta tutti i pagamenti del mese precedente
- [ ] Per ogni cliente italiano con P.IVA, emetti fattura elettronica via
      Fatture in Cloud / Aruba / commercialista
- [ ] Recipient del SDI: usa il `invoicing.sdiCode` del cliente dal pannello
      admin (oppure `0000000` se vuoto)
- [ ] Per i clienti EU non italiani: usa il regime di reverse charge se hai
      P.IVA loro
- [ ] Conserva XML SDI ricevuto (legge: 10 anni)

Quando supererai i ~30 clienti, valuta l'integrazione automatica con
Fatture in Cloud API (deferred nel piano).

---

## 7. Comunicazione lancio

- [ ] Post su LinkedIn / Instagram con link a `/it/pagine-aziendali`
- [ ] Email ai contatti esistenti che hanno richiesto info
- [ ] Aggiorna `/it` (homepage) per linkare la nuova landing
- [ ] Google Search Console: invia di nuovo il sitemap.xml per indicizzazione
      rapida delle nuove URL

---

## Quando tutto è spuntato

Sei pronto per i primi 5-10 clienti pilota. Monitora attentamente per la
prima settimana: webhook health, email deliverability, prima fattura emessa.

In bocca al lupo! 🚀
