import 'server-only';

import { jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';
import { firebaseConfig } from '@/firebase/config';

/**
 * Verifies a Firebase Auth ID token without the Admin SDK by checking its
 * signature against Google's public JWKS and validating issuer/audience.
 *
 * This lets the server trust a client's Firebase identity before minting our
 * own role-bearing session cookie (see auth-actions.ts).
 */

const PROJECT_ID = firebaseConfig.projectId;
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;
const JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
);

// createRemoteJWKSet caches keys and refreshes them as needed.
const JWKS = createRemoteJWKSet(JWKS_URL);

export interface FirebaseIdTokenClaims extends JWTPayload {
  user_id?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase?: {
    sign_in_provider?: string;
    identities?: Record<string, unknown>;
  };
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  signInProvider?: string;
}

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<VerifiedFirebaseUser> {
  if (!idToken || idToken.length === 0) {
    throw new Error('Missing ID token');
  }

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ISSUER,
    audience: PROJECT_ID,
    algorithms: ['RS256'],
  });

  const claims = payload as FirebaseIdTokenClaims;
  const uid = (claims.sub as string) || claims.user_id;

  if (!uid) {
    throw new Error('ID token missing subject (uid)');
  }

  return {
    uid,
    email: (claims.email ?? '').toLowerCase(),
    emailVerified: Boolean(claims.email_verified),
    name: claims.name,
    picture: claims.picture,
    signInProvider: claims.firebase?.sign_in_provider,
  };
}
