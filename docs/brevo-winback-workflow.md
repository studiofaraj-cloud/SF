# Brevo Win-back Automation (Phase 2)

Non c'è codice da scrivere — la win-back email a 7 e 30 giorni dopo la cancellazione
si configura interamente nel pannello Brevo. Questo doc spiega come.

## Quando si attiva

Quando un cliente cancella l'abbonamento Pagina Aziendale:

1. Stripe invia `customer.subscription.deleted` al nostro webhook
2. Il nostro handler aggiorna Firestore (`isPublished = false`)
3. Il nostro handler invia immediatamente l'email "subscription canceled"
   (vedi `emailSubscriptionCanceled` in `src/app/api/stripe/webhook/route.ts`)

A questo punto entra in gioco Brevo:

4. (Da fare manualmente in Brevo) Quando l'email "subscription canceled" parte,
   il contatto viene automaticamente aggiunto alla lista `cancelled-company-profile`
5. Brevo manda automaticamente:
   - **+7 giorni**: email "Ti è mancata la tua pagina?" con codice sconto -30% primo mese
   - **+30 giorni**: email finale "Ultimo invito" + offerta personalizzata

## Setup nel pannello Brevo

### 1. Creare la lista contatti

- Brevo Dashboard → **Contacts** → **Lists** → **Create a new list**
- Nome: `cancelled-company-profile`
- Descrizione: "Clienti che hanno cancellato l'abbonamento Pagine Aziendali"
- Salva

### 2. Creare il workflow di automazione

- Brevo Dashboard → **Automation** → **Create a new automation** → **Start from scratch**

**Trigger (avvio del workflow):**
- Condition: **A contact joins a list**
- List: `cancelled-company-profile`

**Step 1 — Wait 7 days:**
- Action: **Wait**
- Duration: `7 days`

**Step 2 — Send email "We miss you":**
- Action: **Send an email**
- Crea un template tipo:
  - Soggetto: "Ti manca la tua pagina aziendale su studiofaraj.it? Torna con -30%"
  - Body: descrivi i benefit di riattivare + codice promo (creato in Stripe Dashboard → Coupons)
  - CTA: link a `https://studiofaraj.it/it/hub/company-profile/subscription/start`

**Step 3 — Wait 23 more days (total +30):**
- Action: **Wait**
- Duration: `23 days`

**Step 4 — Send email "Last chance":**
- Action: **Send an email**
- Template tipo:
  - Soggetto: "Ultimo promemoria: la tua pagina aziendale ti aspetta"
  - Body: messaggio empatico + offerta finale (es. primo mese gratis tramite nuovo coupon)
  - CTA: link al subscription start

**Step 5 (opzionale) — Remove from list:**
- Action: **Update contact attributes** o **Remove from list**
- Pulisce il contatto così non riceve di nuovo il flow se cancella in futuro

### 3. Codice promo (Stripe Dashboard)

Per offrire lo sconto -30%:
- Stripe Dashboard → **Products** → **Coupons** → **Create coupon**
  - Type: `Percentage discount` (30%)
  - Duration: `Once` (solo primo addebito)
  - Code: `WINBACK30` (oppure auto-generated)
- Il customer inserisce questo codice durante il checkout (`allow_promotion_codes: true` è
  già abilitato nella nostra checkout session)

## Da implementare lato codice — aggiungere alla lista Brevo

Adesso il codice manda solo l'email canceled. Per aggiungere automaticamente il
contatto alla lista Brevo, va integrato l'endpoint Brevo
`POST /v3/contacts/lists/{listId}/contacts/add`. Vedi `src/lib/email/brevo-client.ts`
per il pattern di chiamata HTTP esistente.

**TODO** (fuori da Phase 2): in `emailSubscriptionCanceled` (`src/app/api/stripe/webhook/route.ts`),
dopo l'invio email aggiungere:

```ts
// Add to Brevo win-back list
await brevoSend({
  endpoint: '/contacts/lists/{LIST_ID}/contacts/add',
  body: { emails: [recipient.email] },
});
```

Sostituire `{LIST_ID}` con l'ID numerico della lista (visibile nell'URL della lista in Brevo).

## Test

1. Cancella un abbonamento di test (via Stripe Customer Portal o `stripe trigger`)
2. Verifica che il contatto appaia nella lista `cancelled-company-profile`
3. (Difficile testare i wait di giorni; usa l'opzione "Test workflow" di Brevo per simulare)
