/**
 * Review management script — run from project root:
 *   node scripts/manage-reviews.mjs
 *
 * Removes: Maria Elisa, Mohammad Atrissi
 * Adds:    Bella Napoli, Colisimo
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dir, '../.env');
  try {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { console.warn('Could not read .env file'); }
}
loadEnv();

const firebaseConfig = {
  apiKey: "AIzaSyCLs-uSNjkKm1LgkIne9AlVn2QeFAYtqqg",
  authDomain: "studiofarajnext.firebaseapp.com",
  projectId: "studiofarajnext",
  storageBucket: "studiofarajnext.firebasestorage.app",
  messagingSenderId: "448578143537",
  appId: "1:448578143537:web:3f92f69e64db0eb3969c10",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Reviews to remove ────────────────────────────────────────────────────────
const TO_REMOVE = ['Maria Elisa', 'Mohammad Atrissi'];

// ── Reviews to add ───────────────────────────────────────────────────────────
const TO_ADD = [
  {
    authorDisplayName: 'Bella Napoli',
    authorPhotoUri: '',
    authorUri: '',
    rating: 5,
    text: 'Studio Faraj ha realizzato il nostro sito con grande professionalità e attenzione ai dettagli. Il risultato finale ha superato le nostre aspettative. Consigliatissimi!',
    relativeTime: 'un mese fa',
    publishTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    visible: true,
  },
  {
    authorDisplayName: 'Colisimo',
    authorPhotoUri: '',
    authorUri: '',
    rating: 5,
    text: 'Ottimo lavoro! Il team di Studio Faraj è stato preciso, puntuale e molto disponibile durante tutto il progetto. Siamo molto soddisfatti del risultato.',
    relativeTime: '2 mesi fa',
    publishTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    visible: true,
  },
];

async function main() {
  const ref = collection(db, 'reviews');

  // ── Remove ────────────────────────────────────────────────────────────────
  console.log('\n🗑️  Removing reviews...');
  for (const name of TO_REMOVE) {
    const snap = await getDocs(query(ref, where('authorDisplayName', '==', name)));
    if (snap.empty) {
      console.log(`  ⚠️  Not found: ${name}`);
    } else {
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        console.log(`  ✅ Deleted: ${name}`);
      }
    }
  }

  // ── Add ───────────────────────────────────────────────────────────────────
  console.log('\n✍️  Adding reviews...');
  for (const review of TO_ADD) {
    await addDoc(ref, { ...review, createdAt: Timestamp.now() });
    const stars = '★'.repeat(review.rating);
    console.log(`  ✅ [${stars}] ${review.authorDisplayName} — "${review.text.slice(0, 60)}..."`);
  }

  console.log('\n🎉 Done! Changes saved to Firestore.');
  console.log('💡 You can edit the review text in Admin → Reviews.\n');
  process.exit(0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
