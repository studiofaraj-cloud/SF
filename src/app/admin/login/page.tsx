'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Lock, Mail, Shield } from 'lucide-react';
import Image from 'next/image';
import { useAuth, useUser } from '@/firebase/provider';
import GradientText from '@/components/GradientText';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // If already logged in, redirect away from the login page
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase is now loaded synchronously (no dynamic import), so a soft
      // redirect is enough — the auth state is already in memory.
      router.replace('/admin');
    } catch (err: any) {
      let errorMessage = 'Failed to sign in. Please try again.';
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          default:
            errorMessage = err.message || 'An error occurred during sign in.';
        }
      }
      setError(errorMessage);
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
              Admin Dashboard — sign in to continue
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
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Secure admin access · Studio Faraj
          </div>
        </div>
      </div>
    </div>
  );
}
