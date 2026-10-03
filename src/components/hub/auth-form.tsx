'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from 'firebase/auth';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import { useAuth, useUser } from '@/firebase/provider';
import { establishSession } from '@/lib/auth-actions';
import { whatsappUrl } from '@/lib/contact-info';
import { ServiceQuoteButton } from '@/components/site/service-quote-button';
import { cn } from '@/lib/utils';

export type AuthMode = 'signin' | 'register';
type Lang = 'it' | 'en';

const MIN_PASSWORD = 8;

const T = {
  it: {
    signinTitle: 'Bentornato',
    signinLead: 'Accedi alla tua area clienti.',
    registerTitle: 'Crea il tuo account',
    registerLead: 'Un minuto, poi racconti il progetto.',
    tabs: { signin: 'Accedi', register: 'Crea account' },
    modes: 'Accedi o crea un account',
    google: 'Continua con Google',
    or: 'oppure con l’email',
    name: 'Nome e cognome',
    namePh: 'Mario Rossi',
    email: 'Email',
    emailPh: 'nome@azienda.it',
    password: 'Password',
    passwordNew: `Almeno ${MIN_PASSWORD} caratteri`,
    show: 'Mostra la password',
    hide: 'Nascondi la password',
    forgot: 'Password dimenticata?',
    submitSignin: 'Accedi',
    submitRegister: 'Crea l’account',
    fine: ['Creando l’account accetti i ', 'Termini', ' e confermi di aver letto l’', 'Informativa privacy', '. L’account è gratuito.'],
    alt: 'Preferisci senza account?',
    altQuote: 'Richiedi un preventivo',
    altOr: 'o',
    altWa: 'scrivici su WhatsApp',
    waText: 'Ciao Studio Faraj! Vi scrivo dal sito: vorrei informazioni per un progetto.',
    resetTitle: 'Reimposta la password',
    resetLead: 'Scrivi l’email dell’account: ti mandiamo un link per sceglierne una nuova.',
    resetSubmit: 'Invia il link',
    resetBack: 'Torna all’accesso',
    sentTitle: 'Controlla la posta',
    sentLead: (email: string) => `Se esiste un account per ${email}, troverai un’email con il link per scegliere una nuova password. Guarda anche nello spam.`,
    signingIn: 'Accesso in corso…',
    errors: {
      credentials: 'Email o password non corretti.',
      inUse: 'Esiste già un account con questa email. Prova ad accedere.',
      weak: `La password deve avere almeno ${MIN_PASSWORD} caratteri.`,
      email: 'Questa email non sembra valida.',
      name: 'Scrivi il tuo nome.',
      tooMany: 'Troppi tentativi. Riprova tra qualche minuto.',
      popup: 'Il browser ha bloccato la finestra di Google. Consenti i popup e riprova.',
      otherProvider: 'Questa email è collegata a un altro metodo di accesso. Prova con Google.',
      network: 'Connessione assente. Controlla la rete e riprova.',
      session: 'Non siamo riusciti ad aprire la sessione. Riprova.',
      generic: 'Qualcosa è andato storto. Riprova.',
    },
  },
  en: {
    signinTitle: 'Welcome back',
    signinLead: 'Sign in to your client area.',
    registerTitle: 'Create your account',
    registerLead: 'One minute, then tell us about the project.',
    tabs: { signin: 'Sign in', register: 'Create account' },
    modes: 'Sign in or create an account',
    google: 'Continue with Google',
    or: 'or with your email',
    name: 'Full name',
    namePh: 'Jane Smith',
    email: 'Email',
    emailPh: 'name@company.com',
    password: 'Password',
    passwordNew: `At least ${MIN_PASSWORD} characters`,
    show: 'Show password',
    hide: 'Hide password',
    forgot: 'Forgot your password?',
    submitSignin: 'Sign in',
    submitRegister: 'Create account',
    fine: ['By creating an account you accept the ', 'Terms', ' and confirm you have read the ', 'Privacy notice', '. The account is free.'],
    alt: 'Rather not create an account?',
    altQuote: 'Ask for a quote',
    altOr: 'or',
    altWa: 'message us on WhatsApp',
    waText: "Hi Studio Faraj! I'm writing from your website: I'd like some information about a project.",
    resetTitle: 'Reset your password',
    resetLead: 'Enter your account email and we’ll send you a link to choose a new one.',
    resetSubmit: 'Send the link',
    resetBack: 'Back to sign in',
    sentTitle: 'Check your inbox',
    sentLead: (email: string) => `If there is an account for ${email}, you’ll get an email with a link to choose a new password. Check your spam folder too.`,
    signingIn: 'Signing you in…',
    errors: {
      credentials: 'Wrong email or password.',
      inUse: 'An account with this email already exists. Try signing in.',
      weak: `The password needs at least ${MIN_PASSWORD} characters.`,
      email: 'This email doesn’t look valid.',
      name: 'Please enter your name.',
      tooMany: 'Too many attempts. Try again in a few minutes.',
      popup: 'Your browser blocked the Google window. Allow pop-ups and try again.',
      otherProvider: 'This email uses a different sign-in method. Try Google.',
      network: 'You seem to be offline. Check your connection and try again.',
      session: 'We couldn’t open your session. Please try again.',
      generic: 'Something went wrong. Please try again.',
    },
  },
} as const;

type ErrorKey = keyof (typeof T)['it']['errors'];

function errorKey(err: unknown): ErrorKey | null {
  const code = (err as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
    case 'auth/missing-password':
      return 'credentials';
    case 'auth/email-already-in-use':
      return 'inUse';
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return 'weak';
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'email';
    case 'auth/too-many-requests':
      return 'tooMany';
    case 'auth/popup-blocked':
      return 'popup';
    case 'auth/account-exists-with-different-credential':
      return 'otherProvider';
    case 'auth/network-request-failed':
      return 'network';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null; // the visitor closed the Google window: not an error
    default:
      return 'generic';
  }
}

const FIELD =
  'h-[50px] w-full rounded-xl border border-input bg-background px-3.5 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-primary focus:ring-[3px] focus:ring-primary/15 disabled:opacity-60';
const LABEL = 'mb-1.5 flex items-baseline justify-between text-[13px] font-medium';

function GoogleMark() {
  return (
    <svg aria-hidden className="h-[18px] w-[18px]" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

/**
 * Sign in, create an account, or reset the password — one form, three views.
 *
 * The mode lives in the URL (?mode=register) so a refresh, the back button
 * or a shared link keeps it. `next` has already been checked on the server
 * (same-site path only). A visitor who arrives already signed in is taken
 * straight on; during an explicit sign-in the form finishes the session
 * itself, so the account's name is in the token before the session opens.
 */
export function HubAuthForm({ locale, initialMode, next }: { locale: Lang; initialMode: AuthMode; next: string }) {
  const t = T[locale];
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [view, setView] = useState<'form' | 'reset' | 'sent'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [busy, setBusy] = useState<'email' | 'google' | 'reset' | null>(null);
  const [finishing, setFinishing] = useState(false);
  const explicit = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Firebase's own emails and the Google window follow the page language.
  useEffect(() => {
    auth.languageCode = locale;
  }, [auth, locale]);

  // A new account lands on its first request with a word of welcome.
  const finish = async (fbUser: User, isNew = false) => {
    setFinishing(true);
    try {
      const idToken = await fbUser.getIdToken(true);
      const result = await establishSession(idToken, locale);
      if (!result.ok) throw Object.assign(new Error('session'), { code: 'app/session' });
      if (result.role === 'admin') return router.replace('/admin');
      const target = new URL(next, window.location.origin);
      if (isNew) target.searchParams.set('welcome', '1');
      router.replace(`${target.pathname}${target.search}${target.hash}`);
    } catch (err) {
      setFinishing(false);
      throw err;
    }
  };

  // Already signed in (another tab, an earlier visit): go straight in. If
  // that fails, show the form so the visitor can sign in again.
  useEffect(() => {
    if (isUserLoading || !user || explicit.current) return;
    finish(user).catch(() => {
      explicit.current = true;
      setError('session');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError(null);
    setView('form');
    const url = new URL(window.location.href);
    if (m === 'register') url.searchParams.set('mode', 'register');
    else url.searchParams.delete('mode');
    window.history.replaceState(window.history.state, '', url);
  };

  // `explicit` stays set after a failed attempt: Firebase may already hold
  // the user (account created, session not opened), and the form must stay
  // on screen with the error rather than turn into a spinner.
  const fail = (err: unknown) => {
    setError((err as { code?: string })?.code === 'app/session' ? 'session' : errorKey(err));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (mode === 'register') {
      if (!name.trim()) return setError('name');
      if (password.length < MIN_PASSWORD) return setError('weak');
    }
    explicit.current = true;
    setBusy('email');
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await finish(cred.user, true);
      } else {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        await finish(cred.user);
      }
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const onGoogle = async () => {
    setError(null);
    explicit.current = true;
    setBusy('google');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await finish(cred.user, getAdditionalUserInfo(cred)?.isNewUser ?? false);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy('reset');
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/${locale}/hub/login`,
      });
      setView('sent');
    } catch (err) {
      // An unknown address gets the same answer as a known one: the form
      // must not tell strangers which emails have an account.
      const key = errorKey(err);
      if (key === 'credentials') setView('sent');
      else setError(key);
    } finally {
      setBusy(null);
    }
  };

  // Signed in already (or just now): show where we're going, not the form.
  // While Firebase is still restoring a session the form is shown but held,
  // so it never vanishes under a click.
  if (finishing || (!explicit.current && !isUserLoading && user)) {
    return (
      <div role="status" className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm">{t.signingIn}</p>
      </div>
    );
  }

  const disabled = busy !== null || (isUserLoading && !explicit.current);
  const errorBox = error && (
    <div
      ref={errorRef}
      tabIndex={-1}
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive outline-none"
    >
      <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      {t.errors[error]}
    </div>
  );

  if (view !== 'form') {
    return (
      <div>
        <button
          type="button"
          onClick={() => { setView('form'); setError(null); }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" /> {t.resetBack}
        </button>
        {view === 'sent' ? (
          <div role="status">
            <MailCheck aria-hidden className="h-9 w-9 text-primary" />
            <h1 className="mt-4 font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.03em]">{t.sentTitle}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t.sentLead(email.trim())}</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.03em]">{t.resetTitle}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.resetLead}</p>
            <form onSubmit={onReset} className="mt-6 space-y-4" noValidate>
              {errorBox}
              <div>
                <label htmlFor="reset-email" className={LABEL}>{t.email}</label>
                <input
                  id="reset-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
                  required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPh} disabled={busy !== null} className={FIELD}
                />
              </div>
              <SubmitButton busy={busy === 'reset'} disabled={busy !== null || !email.trim()}>{t.resetSubmit}</SubmitButton>
            </form>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2rem]">
        {mode === 'register' ? t.registerTitle : t.signinTitle}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{mode === 'register' ? t.registerLead : t.signinLead}</p>

      <div role="group" aria-label={t.modes} className="mt-6 grid grid-cols-2 rounded-xl bg-muted/70 p-1 text-sm font-medium">
        {(['signin', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              'rounded-[9px] py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.tabs[m]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {errorBox}

        <button
          type="button"
          onClick={onGoogle}
          disabled={disabled}
          className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-xl border border-input bg-background text-[15px] font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {busy === 'google' ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GoogleMark />}
          {t.google}
        </button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          {t.or}
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className={LABEL}>{t.name}</label>
              <input
                id="auth-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder={t.namePh} disabled={disabled} className={FIELD}
              />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className={LABEL}>{t.email}</label>
            <input
              id="auth-email" type="email" inputMode="email" autoComplete={mode === 'register' ? 'email' : 'username'}
              autoCapitalize="none" spellCheck={false} required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPh} disabled={disabled} className={FIELD}
            />
          </div>
          <div>
            <div className={LABEL}>
              <label htmlFor="auth-password">{t.password}</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setView('reset'); setError(null); }}
                  className="min-h-0 min-w-0 text-[13px] font-medium text-primary hover:underline"
                >
                  {t.forgot}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password" type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={mode === 'register' ? MIN_PASSWORD : undefined}
                required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? t.passwordNew : '••••••••'} disabled={disabled}
                className={cn(FIELD, 'pr-12')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? t.hide : t.show}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:coarse)]:min-h-[44px] [@media(pointer:coarse)]:min-w-[44px]"
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <SubmitButton busy={busy === 'email'} disabled={disabled}>
            {mode === 'register' ? t.submitRegister : t.submitSignin}
          </SubmitButton>

          {mode === 'register' && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t.fine[0]}
              <a href={`/${locale}/terms`} target="_blank" rel="noopener" className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground">{t.fine[1]}</a>
              {t.fine[2]}
              <a href={`/${locale}/privacy`} target="_blank" rel="noopener" className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground">{t.fine[3]}</a>
              {t.fine[4]}
            </p>
          )}
        </form>

        <p className="border-t border-border pt-5 text-[13.5px] leading-relaxed text-muted-foreground">
          {t.alt}{' '}
          <ServiceQuoteButton
            label={t.altQuote}
            variant="plain"
            className="min-h-0 min-w-0 font-medium text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
          />{' '}
          {t.altOr}{' '}
          <a
            href={whatsappUrl(t.waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
          >
            {t.altWa}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function SubmitButton({ busy, disabled, children }: { busy: boolean; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={busy}
      className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-[0_10px_24px_-10px_hsl(var(--primary)/0.7)] transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {children}
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
