'use server';

import {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  upsertReview,
  type ReviewDocument,
} from '@/lib/firestore-data';
import { fetchReviewsFromPlacesAPI } from '@/lib/google-reviews';
import { revalidateTag } from 'next/cache';

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getReviewsAction(): Promise<ReviewDocument[]> {
  return getReviews(false); // all, including hidden
}

// ── Sync from Google Places API → Firestore ───────────────────────────────────

export async function syncGoogleReviewsAction(): Promise<{ synced: number; error?: string }> {
  try {
    const { reviews } = await fetchReviewsFromPlacesAPI('it');
    if (reviews.length === 0) return { synced: 0, error: 'No reviews returned from Google Places API' };

    let synced = 0;
    for (const r of reviews) {
      await upsertReview({
        authorDisplayName: r.authorDisplayName,
        authorPhotoUri: r.authorPhotoUri,
        authorUri: r.authorUri,
        rating: r.rating,
        text: r.text,
        relativeTime: r.relativeTime,
        publishTime: r.publishTime,
        source: 'google',
        visible: true,
      });
      synced++;
    }

    revalidateTag('google-reviews');
    return { synced };
  } catch (err) {
    console.error('[syncGoogleReviews]', err);
    return { synced: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Add manual review ─────────────────────────────────────────────────────────

export async function addReviewAction(data: {
  authorDisplayName: string;
  rating: number;
  text: string;
  publishTime: string;
}): Promise<{ id?: string; error?: string }> {
  try {
    const id = await addReview({
      authorDisplayName: data.authorDisplayName,
      authorPhotoUri: '',
      authorUri: '',
      rating: data.rating,
      text: data.text,
      relativeTime: '',
      publishTime: data.publishTime,
      source: 'manual',
      visible: true,
    });
    revalidateTag('google-reviews');
    return { id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Toggle visibility ─────────────────────────────────────────────────────────

export async function toggleReviewVisibilityAction(id: string, visible: boolean): Promise<{ error?: string }> {
  try {
    await updateReview(id, { visible });
    revalidateTag('google-reviews');
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteReviewAction(id: string): Promise<{ error?: string }> {
  try {
    await deleteReview(id);
    revalidateTag('google-reviews');
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
