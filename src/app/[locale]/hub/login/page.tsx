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
import { LanguageSwitcher } from '@/components/site/language-switcher';

type Lang = 'it' | 'en';

// Translation strings — Italian first (default), English second.
const t = {
  title: { it: 'Area Clienti', en: 'Client Hub' },
  titleRegister: { it: 'Crea il tuo account', en: 'Create your account' },
  subtitle: {
    it: 'Accedi per gestire i tuoi progetti e le richieste.',
    en: 'Sign in to manage your projects and requests.',
  },
  subtitleRegister: {
    it: 'Registrati per richiedere e gestire i tuoi progetti.',
    en: 'Sign up to request and manage your projects.',
  },
  name: { it: 'Nome', en: 'Name' },
  namePlaceholder: { it: 'Il tuo nome', en: 'Your name' },
  email: { it: 'Email', en: 'Email' },
  emailPlaceholder: { it: 'tu@azienda.com', en: 'you@company.com' },
  password: { it: 'Password', en: 'Password' },
  signIn: { it: 'Accedi', en: 'Sign in' },
  createAccount: { it: 'Crea account', en: 'Create account' },
  or: { it: 'oppure', en: 'or' },
  continueGoogle: { it: 'Continua con Google', en: 'Continue with Google' },
  noAccount: { it: 'Non hai un account?', en: "Don't have an account?" },
  hasAccount: { it: 'Hai già un account?', en: 'Already have an account?' },
  signUp: { it: 'Registrati', en: 'Sign up' },
  // Error messages
  errInvalidCredentials: { it: 'Email o password non validi.', en: 'Invalid email or password.' },
  errEmailInUse: {
    it: 'Esiste già un account con questa email. Prova ad accedere.',
    en: 'An account with this email already exists. Try signing in.',
  },
  errWeakPassword: {
    it: 'La password deve avere almeno 6 caratteri.',
    en: 'Password should be at least 6 characters.',
  },
  errInvalidEmail: { it: 'Email non valida.', en: 'Invalid email address.' },
  errTooMany: {
    it: 'Troppi tentativi. Riprova più tardi.',
    en: 'Too many attempts. Please try again later.',
  },
  errPopupBlocked: {
    it: 'Popup bloccato. Abilita i popup e riprova.',
    en: 'Popup was blocked. Please allow popups and try again.',
  },
  errGeneric: { it: 'Qualcosa è andato storto. Riprova.', en: 'Something went wrong. Please try again.' },
  errSession: {
    it: 'Impossibile aprire la sessione.',
    en: 'Failed to establish a session.',
  },
};

function pick<K extends keyof typeof t>(key: K, lang: Lang): string {
  return t[key][lang];
}

function mapAuthError(err: any, lang: Lang): string {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return pick('errInvalidCredentials', lang);
    case 'auth/email-already-in-use':
      return pick('errEmailInUse', lang);
    case 'auth/weak-password':
      return pick('errWeakPassword', lang);
    case 'auth/invalid-email':
      return pick('errInvalidEmail', lang);
    case 'auth/too-many-requests':
      return pick('errTooMany', lang);
    case 'auth/popup-blocked':
      return pick('errPopupBlocked', lang);
    default:
      return err?.message || pick('errGeneric', lang);
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
  const lang: Lang = locale === 'en' ? 'en' : 'it';
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
    if (!result.ok) throw new Error(result.error || pick('errSession', lang));
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
      setError(mapAuthError(err, lang));
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
      if (err?.code !== 'auth/popup-closed-by-user') setError(mapAuthError(err, lang));
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
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12">
      {/* Language switcher in the top-right corner */}
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/assets/logo.png" alt="Studio Faraj" width={40} height={40} className="mb-3" />
          <h1 className="text-xl font-bold">
            {mode === 'register' ? pick('titleRegister', lang) : pick('title', lang)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'register' ? pick('subtitleRegister', lang) : pick('subtitle', lang)}
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
              <Label htmlFor="name">{pick('name', lang)}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={pick('namePlaceholder', lang)}
                disabled={loading}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">{pick('email', lang)}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={pick('emailPlaceholder', lang)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{pick('password', lang)}</Label>
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
              pick('createAccount', lang)
            ) : (
              pick('signIn', lang)
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {pick('or', lang)}
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
          {pick('continueGoogle', lang)}
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'register' ? pick('hasAccount', lang) : pick('noAccount', lang)}{' '}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === 'register' ? 'signin' : 'register');
            }}
            className="font-medium text-primary hover:underline"
          >
            {mode === 'register' ? pick('signIn', lang) : pick('signUp', lang)}
          </button>
        </p>
      </div>
    </div>
  );
}
