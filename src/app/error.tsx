'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { logError } from '@/lib/error-logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, {
      errorBoundary: 'app-error',
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full holographic-card neon-border">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-2xl">Si è verificato un errore</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ci scusiamo per l&apos;inconveniente. Si è verificato un errore imprevisto durante il caricamento della pagina.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Il problema è stato registrato automaticamente. Ti preghiamo di riprovare o tornare alla home page.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message || 'Errore sconosciuto'}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer text-muted-foreground">
                    Stack trace
                  </summary>
                  <pre className="text-xs mt-2 overflow-auto max-h-40 text-muted-foreground">
                    {error.stack}
                  </pre>
                </details>
              )}
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} variant="default" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Riprova
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Torna alla Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
