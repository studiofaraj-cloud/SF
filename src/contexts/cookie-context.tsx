'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CookiePreferences } from '@/components/site/cookie-consent';

interface CookieContextType {
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  openPreferences: () => void;
}

export const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: ReactNode }) {
  const [showPreferences, setShowPreferences] = useState(false);

  const openPreferences = () => {
    setShowPreferences(true);
  };

  return (
    <CookieContext.Provider value={{ showPreferences, setShowPreferences, openPreferences }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookiePreferences() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookiePreferences must be used within a CookieProvider');
  }
  return context;
}
