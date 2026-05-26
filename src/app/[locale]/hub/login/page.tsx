'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth, useUser } from '@/firebase/provider';
import { establishSession } from '@/lib/auth-actions';

function mapAuthError(err: any): string {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups and try again.';
    default:
      return err?.message || 'Something went wrong. Please try again.';
  }
}

export default function HubLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <HubLoginInner />
    </Suspense>
  );
}

function HubLoginInner() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || `/${locale}/hub`;

  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const [mode, setMode] = useState<'signin' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'signin'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finishLogin = async (fbUser: User) => {
    const idToken = await fbUser.getIdToken(true);
    const result = await establishSession(idToken);
    if (!result.ok) throw new Error(result.error || 'Failed to establish a session.');
    router.replace(result.role === 'admin' ? '/admin' : next);
  };

  useEffect(() => {
    if (!isUserLoading && user) {
      finishLogin(user).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
        await finishLogin(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await finishLogin(cred.user);
      }
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await finishLogin(cred.user);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/assets/logo.png" alt="Studio Faraj" width={40} height={40} className="mb-3" />
          <h1 className="text-xl font-bold">
            {mode === 'register' ? 'Create your account' : 'Client Hub'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'register'
              ? 'Sign up to request and manage your projects.'
              : 'Sign in to manage your projects and requests.'}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'register' ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-11 gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
          </svg>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === 'register' ? 'signin' : 'register');
            }}
            className="font-medium text-primary hover:underline"
          >
            {mode === 'register' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
