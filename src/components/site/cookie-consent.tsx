
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, Shield, BarChart3, Target, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCookiePreferences } from '@/contexts/cookie-context';
import { useParams } from 'next/navigation';
import { defaultLocale, type Locale } from '@/i18n/config';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true, // Always enabled
  analytics: false,
  marketing: false,
  functional: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { showPreferences, setShowPreferences } = useCookiePreferences();
  const params = useParams();
  const locale = (params?.locale as Locale) ?? defaultLocale;
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    const savedPreferences = localStorage.getItem('cookie_preferences');
    
    if (!consent) {
      setShowBanner(true);
    }
    
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...defaultPreferences, ...parsed, essential: true });
      } catch (e) {
        // Invalid preferences, use defaults
      }
    }
  }, []);

  const handleConsent = (consentValue: 'accepted' | 'refused') => {
    if (consentValue === 'accepted') {
      // Accept all cookies
      const allAccepted: CookiePreferences = {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      };
      localStorage.setItem('cookie_preferences', JSON.stringify(allAccepted));
      localStorage.setItem('cookie_consent', 'accepted');
    } else {
      // Refuse all except essential
      localStorage.setItem('cookie_preferences', JSON.stringify(defaultPreferences));
      localStorage.setItem('cookie_consent', 'refused');
    }
    setShowBanner(false);
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [category]: value }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
    localStorage.setItem('cookie_consent', 'custom');
    setShowBanner(false);
    setShowPreferences(false);
  };

  const cookieCategories = [
    {
      id: 'essential' as const,
      name: 'Cookie Essenziali',
      description: 'Necessari per il funzionamento del sito. Non possono essere disabilitati.',
      icon: Shield,
      required: true,
    },
    {
      id: 'analytics' as const,
      name: 'Cookie Analitici',
      description: 'Ci aiutano a capire come i visitatori interagiscono con il sito raccogliendo informazioni in forma anonima.',
      icon: BarChart3,
      required: false,
    },
    {
      id: 'marketing' as const,
      name: 'Cookie di Marketing',
      description: 'Utilizzati per tracciare i visitatori attraverso i siti web per mostrare pubblicità rilevante.',
      icon: Target,
      required: false,
    },
    {
      id: 'functional' as const,
      name: 'Cookie Funzionali',
      description: 'Permettono al sito di ricordare le tue scelte per fornire funzionalità migliorate e personalizzate.',
      icon: Zap,
      required: false,
    },
  ];

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in-up">
        <div className="container mx-auto max-w-6xl">
            <div className="rounded-2xl md:rounded-3xl shadow-2xl shadow-primary/25 bg-gradient-to-r from-primary/5 via-card/95 to-primary/5 backdrop-blur-xl border border-primary/20 p-5 md:p-7 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 transition-all duration-500 hover:shadow-primary/30 hover:border-primary/30">
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                        <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Cookie className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                        Utilizziamo i cookie per migliorare la tua esperienza di navigazione.
                        <Link href={getLocalizedPath('/legal', locale as any)} className="underline ml-1 font-medium text-primary hover:text-primary/80 transition-colors">
                            Leggi la nostra Cookie Policy
                        </Link>.
                    </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 w-full md:w-auto">
                    <Button
                        onClick={() => handleConsent('accepted')}
                        size="sm"
                        className="flex-1 md:flex-none rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 font-medium"
                    >
                        Accetta
                    </Button>
                    <Button
                        onClick={() => handleConsent('refused')}
                        size="sm"
                        variant="outline"
                        className="flex-1 md:flex-none rounded-xl border-primary/40 hover:border-primary hover:bg-primary/10 text-foreground transition-all duration-300 font-medium"
                    >
                        Rifiuta
                    </Button>
                    <Button
                        onClick={() => setShowPreferences(true)}
                        size="sm"
                        variant="ghost"
                        className="flex-1 md:flex-none rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium"
                    >
                        Personalizza
                    </Button>
                </div>
            </div>
        </div>

        {/* Cookie Preferences Dialog */}
        <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
          <DialogContent className="!rounded-3xl bg-gradient-to-b from-card via-card to-primary/5 backdrop-blur-xl border-primary/20 w-[95vw] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] [&]:!fixed [&]:!left-1/2 [&]:!top-1/2 [&]:!-translate-x-1/2 [&]:!-translate-y-1/2 p-0 flex flex-col shadow-2xl shadow-primary/20 overflow-hidden">
            <DialogHeader className="sticky top-0 bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-md z-10 pb-4 sm:pb-5 px-5 sm:px-7 pt-5 sm:pt-7 border-b border-primary/10">
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  Personalizza i Cookie
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Scegli quali tipi di cookie vuoi accettare. I cookie essenziali sono sempre attivi per garantire il corretto funzionamento del sito.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 custom-scrollbar">
              <div className="space-y-3 sm:space-y-4">
              {cookieCategories.map((category) => {
                const Icon = category.icon;
                const isEnabled = preferences[category.id];

                return (
                  <div
                    key={category.id}
                    className={`rounded-2xl p-4 sm:p-5 backdrop-blur-sm border transition-all duration-300 ${
                      isEnabled || category.required
                        ? 'bg-primary/5 border-primary/25 hover:border-primary/40 shadow-sm shadow-primary/10'
                        : 'bg-muted/30 border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          category.id === 'essential' || isEnabled
                            ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                            <Label
                              htmlFor={`cookie-${category.id}`}
                              className="text-sm sm:text-base font-semibold text-foreground cursor-pointer"
                            >
                              {category.name}
                            </Label>
                            {category.required && (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium whitespace-nowrap border border-primary/20">
                                Sempre attivo
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id={`cookie-${category.id}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handlePreferenceChange(category.id, checked)}
                        disabled={category.required}
                        className="flex-shrink-0 mt-1"
                      />
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-gradient-to-t from-card via-card to-card/95 backdrop-blur-md z-10 px-5 sm:px-7 py-4 sm:py-5 border-t border-primary/10 flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPreferences(defaultPreferences);
                  handleSavePreferences();
                }}
                className="w-full sm:w-auto rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 text-sm sm:text-base h-11 sm:h-12 transition-all duration-300"
              >
                Rifiuta Tutto
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const allAccepted: CookiePreferences = {
                    essential: true,
                    analytics: true,
                    marketing: true,
                    functional: true,
                  };
                  setPreferences(allAccepted);
                }}
                className="w-full sm:w-auto rounded-xl border-primary/40 hover:border-primary hover:bg-primary/10 text-sm sm:text-base h-11 sm:h-12 transition-all duration-300"
              >
                Accetta Tutto
              </Button>
              <Button
                onClick={handleSavePreferences}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 font-medium text-sm sm:text-base h-11 sm:h-12"
              >
                Salva Preferenze
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
