'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/15 border-2 border-amber-500/30">
        <XCircle className="h-12 w-12 text-amber-600" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {en ? 'Payment cancelled' : 'Pagamento annullato'}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {en
          ? 'No charge was made. You can try again from your payments page.'
          : 'Nessun addebito è stato effettuato. Puoi riprovare quando vuoi dalla tua area pagamenti.'}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href={`/${locale}/hub/quotes`}>
            {en ? 'Try again' : 'Riprova'}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${locale}/hub`}>Dashboard</Link>
        </Button>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        {en
          ? 'Need help? Reply to the email you received or contact us from the website.'
          : "Hai bisogno di aiuto? Rispondi all'email ricevuta o contattaci dal sito."}
      </p>
    </div>
  );
}
