/**
 * Backfill blog docs that are missing `published`, `createdAt`, or `updatedAt`.
 * Run from project root:
 *   node scripts/backfill-blogs.mjs           # dry run
 *   node scripts/backfill-blogs.mjs --apply   # write changes
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
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

const APPLY = process.argv.includes('--apply');

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes will be made)' : 'DRY RUN (no writes)'}`);

  const snap = await getDocs(collection(db, 'blogs'));
  console.log(`Found ${snap.size} blog docs.\n`);

  let touched = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const patch = {};

    if (typeof data.published !== 'boolean') patch.published = false;
    if (!data.createdAt) patch.createdAt = Timestamp.now();
    if (!data.updatedAt) patch.updatedAt = data.createdAt || Timestamp.now();

    if (Object.keys(patch).length === 0) continue;

    touched++;
    console.log(`- ${d.id} (${data.slug ?? data.title ?? 'no slug'})`);
    for (const k of Object.keys(patch)) {
      console.log(`    ${k}: ${data[k] === undefined ? '(missing)' : JSON.stringify(data[k])} -> ${k === 'createdAt' || k === 'updatedAt' ? 'Timestamp.now()' : JSON.stringify(patch[k])}`);
    }

    if (APPLY) {
      await updateDoc(doc(db, 'blogs', d.id), patch);
    }
  }

  console.log(`\n${touched} docs need backfill. ${APPLY ? 'Applied.' : 'Re-run with --apply to write.'}`);
  console.log('\nNote: published defaults to false. Flip to true from /admin/blogs for posts that should appear in the sitemap.');
}

main().catch(err => { console.error(err); process.exit(1); });
