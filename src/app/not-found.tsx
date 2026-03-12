import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

// Root not-found: rendered outside the locale layout, so no intl provider.
// Uses a simple static page with a link to the home page.
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/assets/logo.png"
            alt="Studio Faraj"
            width={180}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </div>

        {/* 404 badge */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-semibold text-primary tracking-wider">
              404
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Pagina Non Trovata
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
        </div>

        {/* Action */}
        <Button asChild size="lg" className="shadow-lg shadow-primary/30">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Torna alla Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
