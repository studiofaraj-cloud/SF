# Firebase Configuration & System Check

This document describes the Firebase configuration validation and system check features implemented for the Studio Faraj admin dashboard.

## Overview

The application now includes:

1. **Environment Validation Middleware** - Validates Firebase configuration before processing admin routes
2. **System Check Route** - Comprehensive Firebase connectivity and permissions testing at `/admin/system-check`
3. **Graceful Error Handling** - User-friendly error pages when configuration is missing

## Configuration

### Environment Variables

Firebase configuration can be provided via environment variables (recommended for production) or fallback to hardcoded values in `src/firebase/config.ts`.

Required environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Setting Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase project credentials from the [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → Your apps

3. Restart your development server

## Middleware Validation

The middleware (`src/middleware.ts`) automatically validates Firebase configuration before allowing access to admin routes.

### How It Works

1. **Route Matching**: Intercepts all `/admin/*` routes except `/admin/system-check`
2. **Configuration Check**: Validates that all required Firebase config values are present and non-empty
3. **Error Response**: If validation fails, displays a helpful error page with:
   - List of missing configuration values
   - Step-by-step instructions to fix the issue
   - Link to the system check page

### Bypassed Routes

- `/admin/system-check` - Always accessible to allow troubleshooting
- `/api/*` - API routes bypass validation
- Localized routes (handled by next-intl middleware)

## System Check Route

Access the system check at: **`/admin/system-check`**

### What It Tests

The system check runs 8 comprehensive tests:

1. **Firebase Configuration** - Validates all config values are present
2. **Firebase Initialization** - Tests Firebase SDK initialization
3. **Firestore Connection** - Verifies Firestore database connectivity
4. **Firestore Write Access** - Tests write permissions by creating a test document
5. **Firestore Read Access** - Tests read permissions and cleans up test data
6. **Storage Connection** - Verifies Firebase Storage connectivity
7. **Storage Upload Access** - Tests upload permissions with a test file
8. **Storage Download Access** - Tests download permissions and cleans up test file

### Test Results

Each test displays:
- ✅ **Success** - Test passed (green)
- ⚠️ **Running** - Test in progress (blue)
- ❌ **Error** - Test failed with details (red)

### Using System Check

1. Navigate to `/admin/system-check` in your browser
2. Tests run automatically on page load
3. Click "Re-run" button to run tests again
4. Review any failed tests and their error messages
5. Fix configuration or security rules as needed
6. Re-run to verify fixes

### Common Issues

**Firestore Write/Read Failures:**
- Check Firestore security rules in `firestore.rules`
- Ensure authenticated users have appropriate permissions
- Verify the collection `system-check-test` is allowed in rules

**Storage Upload/Download Failures:**
- Check Storage security rules in `storage.rules`
- Ensure the `system-checks/` path has appropriate permissions
- Verify Storage bucket is correctly configured

**Configuration Failures:**
- Ensure all environment variables are set in `.env.local`
- Verify no values are empty strings
- Check for typos in configuration values

## Architecture

### Files Modified/Created

1. **`src/middleware.ts`** - Updated with Firebase config validation
2. **`src/firebase/config.ts`** - Updated to support environment variables with fallbacks
3. **`src/firebase/server-init.ts`** - Updated to use same config pattern
4. **`src/app/admin/system-check/page.tsx`** - New system check route (created)
5. **`FIREBASE_CONFIG.md`** - This documentation file (created)

### Validation Flow

```
User Request → Middleware
              ↓
         Check Route
         /admin/* ?
              ↓ Yes
         system-check?
         ↙ No      ↘ Yes
   Validate Config  Allow
         ↓
    Valid? ← No → Error Page
      ↓ Yes
   Allow Request
```

### Security Considerations

- Environment variables use `NEXT_PUBLIC_` prefix (client-accessible)
- Fallback values are from the public Firebase config (safe to expose)
- System check creates temporary test data that is automatically cleaned up
- Test files use unique timestamps to prevent conflicts
- No sensitive data is logged or displayed in error messages

## Troubleshooting

### Error: "Firebase Configuration Missing"

**Solution:** 
1. Create `.env.local` with required environment variables
2. Or ensure fallback values in `src/firebase/config.ts` are correct
3. Restart development server

### Error: "Failed to initialize Firebase"

**Solution:**
1. Verify Firebase config values are correct
2. Check Firebase Console for project status
3. Ensure project ID matches your Firebase project

### Error: "Failed to write to Firestore"

**Solution:**
1. Check Firestore security rules allow writes
2. Ensure user is authenticated (if rules require auth)
3. Verify collection access is not restricted

### Error: "Failed to upload to Storage"

**Solution:**
1. Check Storage security rules allow uploads to `system-checks/`
2. Ensure Storage bucket exists and is active
3. Verify user has appropriate permissions

## Development vs Production

### Development
- Uses `.env.local` for configuration
- Fallback to hardcoded values if env vars missing
- Error pages show detailed troubleshooting info

### Production
- Should use environment variables in hosting platform
- Fallback values provide safety net
- Consider customizing error page for production use

## Next Steps

After successful system check:

1. ✅ All tests pass → Your Firebase configuration is ready
2. ❌ Some tests fail → Review error messages and fix issues
3. Update security rules if needed
4. Configure appropriate permissions for admin users
5. Test actual admin functionality

## Support

If you encounter issues:

1. Run `/admin/system-check` to diagnose
2. Check Firebase Console for service status
3. Review security rules in `firestore.rules` and `storage.rules`
4. Verify environment variables are set correctly
5. Check browser console for additional error details
