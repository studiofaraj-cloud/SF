'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const CONFETTI_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

interface Piece {
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
}

export default function CheckoutSuccessPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const [pieces, setPieces] = useState<Piece[]>([]);

  // Generate confetti on the client to avoid SSR hydration mismatches (Math.random).
  useEffect(() => {
    const arr: Piece[] = Array.from({ length: 70 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotate: Math.random() * 360,
    }));
    setPieces(arr);
  }, []);

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* Confetti */}
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/15 border-2 border-green-500/30 shadow-lg shadow-green-500/20">
          <CheckCircle2 className="h-12 w-12 text-green-600 animate-success-pop" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {en ? 'Payment complete!' : 'Pagamento completato!'}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {en
            ? "Thanks — we have received your payment. You'll get a confirmation email shortly."
            : 'Grazie — abbiamo ricevuto il tuo pagamento. Riceverai una email di conferma a breve.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href={`/${locale}/hub/quotes`}>
              {en ? 'View payments' : 'Vedi pagamenti'}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}/hub`}>Dashboard</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          {en
            ? 'The status updates automatically once the payment is confirmed.'
            : 'Lo stato si aggiorna automaticamente alla conferma del pagamento.'}
        </p>
      </div>
    </div>
  );
}
