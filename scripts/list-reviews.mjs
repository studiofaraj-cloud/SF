/**
 * List all reviews currently in Firestore — temp helper.
 *   node scripts/list-reviews.mjs
 */
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

const snap = await getDocs(collection(db, 'reviews'));
const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
docs.sort((a, b) =>
  new Date(b.publishTime || 0).getTime() - new Date(a.publishTime || 0).getTime()
);

console.log(`\nTotal reviews in Firestore: ${docs.length}\n`);
for (const r of docs) {
  const stars = '★'.repeat(r.rating);
  const visible = r.visible ? '👁️ ' : '🚫 ';
  const src = r.source === 'google' ? '🔵 G' : '✏️  M';
  const date = r.publishTime ? new Date(r.publishTime).toLocaleDateString('it-IT') : '-';
  console.log(`${visible}${src} [${stars}] ${r.authorDisplayName} (${date})`);
  console.log(`   "${(r.text || '').slice(0, 90)}..."`);
}
process.exit(0);
