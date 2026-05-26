import 'server-only';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Quote, QuotePayment, UserProfile } from '@/lib/firestore-data';
import { EMAIL_SITE_URL } from '@/lib/email/hub-notify';

const BRAND = {
  primary: '#1e3a8a',
  accent: '#38bdf8',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  light: '#f8fafc',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
    color: BRAND.text,
    fontFamily: 'Helvetica',
  },
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  headerLeft: { flexDirection: 'column' },
  logo: { width: 96, height: 'auto', marginBottom: 8 },
  companyBlock: { fontSize: 9, color: BRAND.muted, lineHeight: 1.45 },
  headerRight: { textAlign: 'right' },
  docTitle: { fontSize: 22, color: BRAND.primary, fontFamily: 'Helvetica-Bold' },
  docMeta: { fontSize: 9, color: BRAND.muted, marginTop: 4 },
  paidStamp: {
    marginTop: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  cancelStamp: {
    marginTop: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  // Section
  section: { marginBottom: 18 },
  sectionLabel: {
    fontSize: 9,
    color: BRAND.muted,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  clientName: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  clientLine: { color: BRAND.muted, marginTop: 2 },

  // Line items table
  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    paddingVertical: 6,
    backgroundColor: BRAND.light,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    paddingVertical: 8,
  },
  cellDesc: { flex: 4, paddingHorizontal: 6 },
  cellQty: { flex: 1, textAlign: 'right', paddingHorizontal: 6 },
  cellUnit: { flex: 1.4, textAlign: 'right', paddingHorizontal: 6 },
  cellTotal: { flex: 1.4, textAlign: 'right', paddingHorizontal: 6 },
  headText: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: BRAND.muted, textTransform: 'uppercase' },

  // Totals
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  totalsBox: { width: 240 },
  totalsLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalsLabel: { color: BRAND.muted },
  totalsValue: {},
  grandLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 6,
    marginTop: 4,
  },
  grandLabel: { fontFamily: 'Helvetica-Bold', fontSize: 12 },
  grandValue: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: BRAND.primary },

  // Payment plan
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  planLabel: { flex: 3 },
  planDate: { flex: 2, color: BRAND.muted },
  planAmount: { flex: 1.5, textAlign: 'right' },
  planStatus: { flex: 1.2, textAlign: 'right', textTransform: 'uppercase', fontSize: 9 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 8,
    fontSize: 8,
    color: BRAND.muted,
    textAlign: 'center',
    lineHeight: 1.4,
  },
});

function fmtMoney(cents: number, currency = 'eur', locale = 'it-IT'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format((cents ?? 0) / 100);
}

function fmtDate(iso?: any, locale = 'it-IT'): string {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso instanceof Date ? iso : null;
  if (!d || isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale);
}

function statusText(s: QuotePayment['status'], locale: string): string {
  const en = locale === 'en';
  if (s === 'paid') return en ? 'Paid' : 'Pagato';
  if (s === 'cancelled') return en ? 'Cancelled' : 'Annullato';
  return en ? 'Pending' : 'In attesa';
}

export interface InvoicePdfProps {
  quote: Quote;
  payments: QuotePayment[];
  client?: UserProfile | null;
  locale?: 'it' | 'en';
}

export function InvoicePdf({ quote, payments, client, locale = 'it' }: InvoicePdfProps) {
  const en = locale === 'en';
  const isPaid = quote.status === 'paid';
  const isCancelled = quote.status === 'cancelled';
  const docTitle = isPaid ? (en ? 'INVOICE' : 'FATTURA') : (en ? 'QUOTE' : 'PREVENTIVO');
  const docNumber = (quote.id ?? '').slice(0, 8).toUpperCase();
  const docDate = fmtDate(quote.createdAt, en ? 'en-GB' : 'it-IT');
  const logoUrl = `${EMAIL_SITE_URL}/assets/logo-mail.png`;
  const fmtLocale = en ? 'en-IE' : 'it-IT';

  const billing = client && (client.company || client.vatNumber || client.addressLine || client.taxCode);

  const planTotal = payments.filter((p) => p.status !== 'cancelled').reduce((s, p) => s + p.amount, 0);
  const paidSum = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(0, quote.total - paidSum);

  return (
    <Document title={`${docTitle} ${docNumber}`} author="Studio Faraj">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logoUrl} style={styles.logo} />
            <Text style={styles.companyBlock}>
              Studio Faraj{'\n'}
              Padova, Italia{'\n'}
              P.IVA IT05783550287{'\n'}
              info@studiofaraj.it · +39 320 222 3322
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>{docTitle}</Text>
            <Text style={styles.docMeta}>
              {(en ? 'No. ' : 'N. ')}{docNumber}
            </Text>
            <Text style={styles.docMeta}>
              {(en ? 'Date: ' : 'Data: ')}{docDate}
            </Text>
            {isPaid && <Text style={styles.paidStamp}>{en ? 'PAID' : 'PAGATA'}</Text>}
            {isCancelled && <Text style={styles.cancelStamp}>{en ? 'CANCELLED' : 'ANNULLATA'}</Text>}
          </View>
        </View>

        {/* Bill to */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{en ? 'Bill to' : 'Intestato a'}</Text>
          <Text style={styles.clientName}>
            {billing ? client?.company : (client?.displayName || quote.clientName || quote.clientEmail || '—')}
          </Text>
          {billing && (client?.displayName || quote.clientName) && (
            <Text style={styles.clientLine}>{client?.displayName || quote.clientName}</Text>
          )}
          {client?.vatNumber && <Text style={styles.clientLine}>P.IVA: {client.vatNumber}</Text>}
          {client?.taxCode && <Text style={styles.clientLine}>C.F.: {client.taxCode}</Text>}
          {(client?.addressLine || client?.city || client?.zip) && (
            <Text style={styles.clientLine}>
              {[client?.addressLine, [client?.zip, client?.city].filter(Boolean).join(' '), client?.province, client?.country]
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
          {client?.sdiPec && <Text style={styles.clientLine}>SDI/PEC: {client.sdiPec}</Text>}
          {(quote.clientEmail || client?.email) && (
            <Text style={styles.clientLine}>{quote.clientEmail || client?.email}</Text>
          )}
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{en ? 'Subject' : 'Oggetto'}</Text>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>{quote.title}</Text>
        </View>

        {/* Line items */}
        <View style={styles.section}>
          <View style={styles.tableHead}>
            <Text style={[styles.cellDesc, styles.headText]}>{en ? 'Description' : 'Descrizione'}</Text>
            <Text style={[styles.cellQty, styles.headText]}>{en ? 'Qty' : 'Q.tà'}</Text>
            <Text style={[styles.cellUnit, styles.headText]}>{en ? 'Unit' : 'Prezzo'}</Text>
            <Text style={[styles.cellTotal, styles.headText]}>{en ? 'Total' : 'Totale'}</Text>
          </View>
          {quote.lineItems.map((li, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cellDesc}>{li.description}</Text>
              <Text style={styles.cellQty}>{li.quantity}</Text>
              <Text style={styles.cellUnit}>{fmtMoney(li.unitAmount, quote.currency, fmtLocale)}</Text>
              <Text style={styles.cellTotal}>
                {fmtMoney(li.quantity * li.unitAmount, quote.currency, fmtLocale)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsRow}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsLine}>
              <Text style={styles.totalsLabel}>{en ? 'Subtotal' : 'Imponibile'}</Text>
              <Text style={styles.totalsValue}>{fmtMoney(quote.subtotal, quote.currency, fmtLocale)}</Text>
            </View>
            <View style={styles.totalsLine}>
              <Text style={styles.totalsLabel}>
                {en ? 'VAT' : 'IVA'} ({quote.taxRate}%)
              </Text>
              <Text style={styles.totalsValue}>{fmtMoney(quote.taxAmount, quote.currency, fmtLocale)}</Text>
            </View>
            <View style={styles.grandLine}>
              <Text style={styles.grandLabel}>{en ? 'Total' : 'Totale'}</Text>
              <Text style={styles.grandValue}>{fmtMoney(quote.total, quote.currency, fmtLocale)}</Text>
            </View>
            {payments.length > 0 && (
              <>
                <View style={[styles.totalsLine, { marginTop: 6 }]}>
                  <Text style={styles.totalsLabel}>{en ? 'Paid so far' : 'Pagato finora'}</Text>
                  <Text style={styles.totalsValue}>{fmtMoney(paidSum, quote.currency, fmtLocale)}</Text>
                </View>
                <View style={styles.totalsLine}>
                  <Text style={styles.totalsLabel}>{en ? 'Outstanding' : 'Da pagare'}</Text>
                  <Text style={styles.totalsValue}>{fmtMoney(outstanding, quote.currency, fmtLocale)}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Payment plan */}
        {payments.length > 0 && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionLabel}>{en ? 'Payment plan' : 'Piano di pagamento'}</Text>
            {payments.map((p) => (
              <View key={p.id} style={styles.planRow}>
                <Text style={styles.planLabel}>{p.label}</Text>
                <Text style={styles.planDate}>{p.dueDate ? fmtDate(p.dueDate, fmtLocale) : ''}</Text>
                <Text style={styles.planAmount}>{fmtMoney(p.amount, quote.currency, fmtLocale)}</Text>
                <Text style={styles.planStatus}>{statusText(p.status, locale)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Studio Faraj — Padova, Italia · P.IVA IT05783550287{'\n'}
          info@studiofaraj.it · +39 320 222 3322 · studiofaraj.it
        </Text>
      </Page>
    </Document>
  );
}
