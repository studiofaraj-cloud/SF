/**
 * session.ts - Edge-compatible session utilities for middleware
 *
 * This file contains NO 'use server' directive so it can be safely imported
 * and used in Next.js Edge middleware. Uses only Web Crypto APIs and jose.
 */

import { jwtVerify, type JWTPayload } from 'jose';

export interface SessionPayload extends JWTPayload {
  user: {
    id: string;
    name: string;
  };
  expires: string;
}

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-key-for-development';
const key = new TextEncoder().encode(secretKey);

/**
 * Decrypt and validate a session token from a cookie value.
 * This function is Edge-compatible and can be used in middleware.
 */
export async function getSessionFromCookie(
  cookieValue: string | undefined
): Promise<SessionPayload | null> {
  if (!cookieValue || cookieValue.length === 0) {
    return null;
  }

  try {
    // Verify and decode the JWT
    const { payload } = await jwtVerify(cookieValue, key, {
      algorithms: ['HS256'],
    });

    const session = payload as SessionPayload;

    // Check expiration from custom expires field
    if (session.expires) {
      const expiresDate = new Date(session.expires);
      const now = new Date();
      if (expiresDate < now) {
        return null;
      }
    }

    return session;
  } catch (error) {
    // Any JWT validation error means session is invalid
    return null;
  }
}
