'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { AlertCircle, Loader2, Lock, Mail, Shield, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useAuth, useUser } from '@/firebase/provider';
import { establishSession } from '@/lib/auth-actions';
import GradientText from '@/components/GradientText';

function mapAuthError(err: any): string {
  if (err?.code) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email o password non validi.';
      case 'auth/email-already-in-use':
        return 'Esiste già un account con questa email. Prova ad accedere.';
      case 'auth/weak-password':
        return 'La password deve avere almeno 6 caratteri.';
      case 'auth/invalid-email':
        return 'Indirizzo email non valido.';
      case 'auth/user-disabled':
        return 'Questo account è stato disabilitato.';
      case 'auth/too-many-requests':
        return 'Troppi tentativi falliti. Riprova più tardi.';
      case 'auth/popup-blocked':
        return 'Popup bloccato. Consenti i popup e riprova.';
      default:
        return err.message || 'Si è verificato un errore.';
    }
  }
  return err?.message || 'Operazione non riuscita. Riprova.';
}

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const isRegister = mode === 'register';

  // Exchange the Firebase identity for a role-bearing session cookie, then
  // route the user to the correct dashboard for their role.
  const finishLogin = async (fbUser: User) => {
    // Force-refresh so a freshly-set displayName is included in the token claims.
    const idToken = await fbUser.getIdToken(true);
    const result = await establishSession(idToken);
    if (!result.ok) {
      throw new Error(result.error || 'Failed to establish a session.');
    }
    if (result.role === 'admin') {
      router.replace(nextParam && nextParam.startsWith('/admin') ? nextParam : '/admin');
    } else {
      router.replace(nextParam && nextParam.startsWith('/') && !nextParam.startsWith('/admin') ? nextParam : '/hub');
    }
  };

  // If a Firebase user is already present (e.g. session cookie expired but
  // Firebase persisted the login), re-establish the cookie and redirect.
  useEffect(() => {
    if (!isUserLoading && user) {
      finishLogin(user).catch(() => {
        /* surface nothing here; the form remains usable */
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await finishLogin(cred.user);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(mapAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/6 blur-[80px]" />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="floating-shape absolute left-[8%] top-[15%] h-20 w-20 rotate-45 border-2 border-primary/20" />
        <div className="floating-shape absolute bottom-[20%] right-[8%] h-16 w-16 rounded-full border-2 border-primary/15" style={{ animationDelay: '2s' }} />
        <div className="floating-shape absolute bottom-[35%] left-[12%] h-12 w-12 rotate-12 bg-primary/5" style={{ animationDelay: '4s' }} />
        <div className="floating-shape absolute right-[20%] top-[40%] h-14 w-14 border border-primary/15 rounded-lg" style={{ animationDelay: '3s' }} />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="holographic-card neon-border rounded-2xl p-8 bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/10">

          {/* Logo + title */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 shadow-lg shadow-primary/20">
              <Image src="/assets/logo.png" alt="Studio Faraj" width={36} height={36} />
            </div>
            <GradientText
              colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
              animationSpeed={4}
              className="text-3xl font-bold"
            >
              Studio Faraj
            </GradientText>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isRegister
                ? 'Crea il tuo account per accedere alla tua area clienti'
                : 'Accedi per continuare'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
                <div className="holographic-card rounded-lg border border-primary/20 px-3 py-2 bg-card/40 backdrop-blur-sm focus-within:border-primary/50 transition-all duration-300 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Il tuo nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-foreground/40 h-9 p-0 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="holographic-card rounded-lg border border-primary/20 px-3 py-2 bg-card/40 backdrop-blur-sm focus-within:border-primary/50 transition-all duration-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@studiofaraj.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-foreground/40 h-9 p-0 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="holographic-card rounded-lg border border-primary/20 px-3 py-2 bg-card/40 backdrop-blur-sm focus-within:border-primary/50 transition-all duration-300 flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-foreground/40 h-9 p-0 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 neon-glow mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegister ? 'Creazione account…' : 'Accesso…'}
                </>
              ) : isRegister ? (
                'Crea account'
              ) : (
                'Accedi'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Google sign-in */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-11 gap-2 border-primary/20 bg-card/40 backdrop-blur-sm hover:bg-card/70"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
            {isRegister ? 'Registrati con Google' : 'Continua con Google'}
          </Button>

          {/* Sign in / Register toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? 'Hai già un account?' : 'Non hai un account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(isRegister ? 'signin' : 'register');
              }}
              className="font-medium text-primary hover:underline"
            >
              {isRegister ? 'Accedi' : 'Registrati'}
            </button>
          </p>

          {/* Footer badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Accesso sicuro · Studio Faraj
          </div>
        </div>
      </div>
    </div>
  );
}
