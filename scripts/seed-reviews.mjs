/**
 * One-shot script: fetch Google Places reviews → write to Firestore.
 * Run once from the project root:
 *   node scripts/seed-reviews.mjs
 *
 * Requires Node 18+ (native fetch).
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Load .env manually (no dotenv dependency needed) ──────────────────────────
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
  } catch {
    console.warn('Could not read .env file');
  }
}
loadEnv();

// ── Firebase config (copied from src/firebase/config.ts) ─────────────────────
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

// ── Fetch from Google Places API ─────────────────────────────────────────────
async function fetchGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID ?? 'ChIJV_YxeITzBAERefznEKaDrkc';

  if (!apiKey) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in .env');
    process.exit(1);
  }

  console.log(`📡 Fetching reviews for place ${placeId}...`);

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=it`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'displayName',
        'rating',
        'userRatingCount',
        'reviews.rating',
        'reviews.text',
        'reviews.authorAttribution',
        'reviews.relativePublishTimeDescription',
        'reviews.publishTime',
      ].join(','),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`❌ Places API error ${res.status}:`, body);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`✅ Place: ${data.displayName?.text} | Rating: ${data.rating} (${data.userRatingCount} reviews)`);
  return data;
}

// ── Upsert to Firestore ───────────────────────────────────────────────────────
async function upsertReview(review) {
  const ref = collection(db, 'reviews');
  const existing = await getDocs(
    query(
      ref,
      where('authorDisplayName', '==', review.authorDisplayName),
      where('publishTime', '==', review.publishTime),
    )
  );

  if (!existing.empty) {
    await updateDoc(existing.docs[0].ref, review);
    return 'updated';
  }

  await addDoc(ref, { ...review, createdAt: Timestamp.now() });
  return 'created';
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const data = await fetchGoogleReviews();
  const reviews = (data.reviews ?? []).filter(r => r.rating >= 4 && r.text?.text);

  if (reviews.length === 0) {
    console.warn('⚠️  No reviews returned from API');
    process.exit(0);
  }

  // Sort newest first
  reviews.sort((a, b) =>
    new Date(b.publishTime ?? 0).getTime() - new Date(a.publishTime ?? 0).getTime()
  );

  console.log(`\n💾 Writing ${reviews.length} reviews to Firestore...\n`);

  for (const r of reviews) {
    const doc = {
      authorDisplayName: r.authorAttribution.displayName,
      authorPhotoUri: r.authorAttribution.photoUri ?? '',
      authorUri: r.authorAttribution.uri ?? '',
      rating: r.rating,
      text: r.text.text,
      relativeTime: r.relativePublishTimeDescription ?? '',
      publishTime: r.publishTime ?? new Date().toISOString(),
      source: 'google',
      visible: true,
    };

    const action = await upsertReview(doc);
    const stars = '★'.repeat(doc.rating);
    console.log(`  ${action === 'created' ? '✅' : '🔄'} [${stars}] ${doc.authorDisplayName} — ${doc.text.slice(0, 60)}...`);
  }

  console.log(`\n🎉 Done! ${reviews.length} reviews saved to Firestore.`);
  console.log('👉 Restart your dev server and refresh the homepage to see them live.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
