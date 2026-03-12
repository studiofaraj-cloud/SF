import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SignJWT,
  jwtVerify,
  type JWTPayload,
} from 'jose';

type SessionPayload = JWTPayload & {
  user: {
    id: string;
    name: string;
  },
  expires: string;
}

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-key-for-development';

// Validate SESSION_SECRET
// Only warn during build, actual validation happens at runtime when auth functions are called
if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    // Warn but don't throw during build - actual runtime will handle missing secret
    console.warn('[Auth] SESSION_SECRET not set - authentication will fail at runtime. Set SESSION_SECRET env var.');
  } else {
    console.warn('[Auth] Using fallback SESSION_SECRET - set SESSION_SECRET env var for production');
  }
} else if (process.env.SESSION_SECRET.length < 32) {
  console.warn('[Auth] SESSION_SECRET should be at least 32 characters for security');
}

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Session expires in 1 day
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  if (!input || input.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Auth] decrypt called with empty input');
    }
    return null;
  }

  try {
    // Check if SESSION_SECRET is set
    if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
      console.error('[Auth] Cannot decrypt session - SESSION_SECRET not set in production');
      return null;
    }

    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    
    // Verify custom expires field matches JWT exp
    const session = payload as SessionPayload;
    if (session.expires) {
      const expiresDate = new Date(session.expires);
      const now = new Date();
      if (expiresDate < now) {
        console.warn('[Auth] Session expired (custom expires field):', expiresDate, 'now:', now);
        return null;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Session decrypted successfully for user:', session.user?.id);
    }
    
    return session;
  } catch (error: any) {
    // Enhanced error logging
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.error('[Auth] JWT expired:', error.expiredAt);
    } else if (error.code === 'ERR_JWT_INVALID') {
      console.error('[Auth] Invalid JWT signature - possible SESSION_SECRET mismatch');
      console.error('[Auth] This usually means SESSION_SECRET changed or is different between requests');
      console.error('[Auth] Current SESSION_SECRET length:', process.env.SESSION_SECRET?.length || 0);
    } else if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
      console.error('[Auth] JWT claim validation failed:', error.claim, error.reason);
    } else {
      console.error('[Auth] JWT verification failed:', error.message || error);
      if (error.code) {
        console.error('[Auth] Error code:', error.code);
      }
    }
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] getSession: No session cookie found');
    }
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth] getSession: Session cookie found, length:', sessionCookie.length);
  }

  const session = await decrypt(sessionCookie);

  if (!session) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Auth] getSession: Session decryption failed');
    }
    return null;
  }

  // Double-check expiration
  if (new Date(session.expires) < new Date()) {
    console.warn('[Auth] getSession: Session expired');
    return null;
  }

  return session;
}

// Middleware-specific function to get session from cookie value
export async function getSessionFromCookie(cookieValue: string | undefined) {
  if (!cookieValue) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] getSessionFromCookie: No cookie value provided');
    }
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth] getSessionFromCookie: Cookie value received, length:', cookieValue.length);
  }

  // Check SESSION_SECRET before attempting decryption
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
    console.error('[Auth] getSessionFromCookie: SESSION_SECRET not set in production');
    return null;
  }
  
  const session = await decrypt(cookieValue);
  if (!session) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Auth] getSessionFromCookie: Session decryption failed');
    }
    return null;
  }
  
  if (new Date(session.expires) < new Date()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Auth] getSessionFromCookie: Session expired (expires field):', session.expires);
    }
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth] getSessionFromCookie: Session validated successfully for user:', session.user?.id);
  }
  
  return session;
}

export async function createSession(userId: string, username: string) {
  // Validate SESSION_SECRET at runtime when actually creating a session
  if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Auth] SESSION_SECRET is required in production but is not set');
      throw new Error('SESSION_SECRET environment variable is required in production');
    } else {
      console.warn('[Auth] SESSION_SECRET not set - using fallback secret. Sessions may not persist across restarts.');
    }
  } else if (process.env.SESSION_SECRET.length < 32) {
    console.warn('[Auth] SESSION_SECRET is less than 32 characters - this is insecure');
  }
  
  try {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const expiresISO = expires.toISOString();
    
    const payload: SessionPayload = { 
      user: { id: userId, name: username }, 
      expires: expiresISO 
    };
    
    console.log('[Auth] Creating session for user:', userId, 'expires:', expiresISO);
    
    // Create JWT with matching expiration
    const session = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(expires.getTime() / 1000)) // Unix timestamp
      .sign(key);

    console.log('[Auth] JWT token created, length:', session.length);

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
      expires,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    // Verify cookie was set
    const verifyCookie = cookieStore.get('session');
    if (!verifyCookie) {
      console.error('[Auth] CRITICAL: Cookie was not set after cookieStore.set()');
      throw new Error('Failed to set session cookie');
    }
    
    console.log('[Auth] Session cookie set successfully, value length:', verifyCookie.value.length);
    console.log('[Auth] Session created successfully for user:', userId);
  } catch (error) {
    console.error('[Auth] Failed to create session:', error);
    if (error instanceof Error) {
      console.error('[Auth] Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    throw new Error('Failed to create session');
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    expires: new Date(0),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function verifyAdminSession() {
    // This function is kept for backwards compatibility but no longer enforces authentication
    // Authentication has been removed from the application
    return null;
}
