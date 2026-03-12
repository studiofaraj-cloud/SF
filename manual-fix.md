# Manual Fixes Applied

## Fix 1: Blog & Project CRUD Operations (Create, Edit, Delete)

**Issue**: It was not possible to add, edit, or delete blogs and projects. This was caused by a schema mismatch between the Firestore data layer (firestore-data.ts) and what the application forms were trying to save.

**Root Cause**: The Blog and Project interfaces in firestore-data.ts were outdated and didn't match the actual data structure in use. Specifically:
- Missing `slug` and `excerpt` fields for blogs
- Wrong field names (featuredImageMetadata instead of featuredImage as simple URL string)
- Missing `gallery`, `technologies`, `metrics`, `highlights` fields for projects
- Outdated `author` and `featured` filters that didn't exist

**Fixed**:
- Updated Blog and Project interfaces in firestore-data.ts to match the actual schema
- Removed obsolete author/featured field filters from database queries
- Simplified delete operations to work with the new schema (images are stored as URLs, not metadata objects)
- Fixed useActionState initialState types in create and edit components

**What Works Now**:
✅ Create new blogs and projects
✅ Edit existing blogs and projects
✅ Delete blogs and projects
✅ Upload and manage images with projects

---

# Firebase Storage Images Manual Fix

## Problem

Images uploaded through the dashboard are stored in Firebase Storage successfully, but they
don't load on the public website in production. On localhost everything works fine.

## Root Cause

Two issues combine to break images in production:

1. **Next.js Image Optimization Proxy** — Next.js fetches remote images server-side through
   `/_next/image` to optimize them. On many hosting platforms the serverless function that
   handles this proxy can time out, fail DNS resolution, or hit response-size limits when
   fetching from Firebase Storage. Localhost doesn't have these constraints.

2. **Firebase Storage CORS** — If CORS is not configured on the storage bucket, browsers
   and server-side proxies may be blocked from fetching the images cross-origin.

## What Was Already Fixed in Code

- Created `FirebaseImage` component (`src/components/ui/firebase-image.tsx`) that
  automatically sets `unoptimized` for Firebase Storage URLs, bypassing the Next.js proxy
  and loading directly from Firebase's CDN.
- Updated all public-facing components to use `FirebaseImage` for dynamic images.
- Added all Firebase Storage hostname patterns to `next.config.ts` `remotePatterns`.

## Manual Step Required: Configure CORS on Firebase Storage

You need to run ONE command to allow browsers to load images from your storage bucket.

### Prerequisites

Install the Google Cloud CLI if you don't have it:

- **Windows**: Download from https://cloud.google.com/sdk/docs/install
- **macOS**: `brew install google-cloud-sdk`
- **Linux**: `curl https://sdk.cloud.google.com | bash`

Then authenticate:

```bash
gcloud auth login
```

### Apply CORS Configuration

A `cors.json` file has been created in the project root. Run this command from the
project directory:

```bash
gcloud storage buckets update gs://studio-9657887514-d2729.firebasestorage.app --cors-file=cors.json
```

If the above command doesn't work (older gcloud version), try:

```bash
gsutil cors set cors.json gs://studio-9657887514-d2729.firebasestorage.app
```

### Verify CORS Was Applied

```bash
gcloud storage buckets describe gs://studio-9657887514-d2729.firebasestorage.app --format="json(cors)"
```

You should see the CORS config with `"origin": ["*"]` and `"method": ["GET", "HEAD"]`.

## After Deploying

1. Deploy the updated code to production.
2. Run the CORS command above (only needed once, it persists on the bucket).
3. Clear your browser cache or open an incognito window to test.
4. Images should now load directly from Firebase Storage CDN without going through
   the Next.js proxy.

## Troubleshooting

**Images still not loading after deploy?**
- Open browser DevTools > Network tab and check the image request URL.
- If the URL starts with `/_next/image`, the `FirebaseImage` component isn't being used
  in that location — check that the component imports are correct.
- If the URL goes directly to `firebasestorage.googleapis.com` but returns a CORS error,
  the CORS command hasn't been applied yet.

**Images load but are slow?**
- Firebase Storage serves images through Google's CDN which is fast globally.
- Consider using WebP format for uploads (already supported in the upload component).

**Token in URL expired?**
- Firebase Storage download URLs include a `token` parameter. These tokens do NOT expire
  unless you regenerate them in the Firebase Console or change storage rules. If an image
  stops working, re-upload it through the dashboard.

