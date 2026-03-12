'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

export function isIOsSafari(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  
  return isIOS && isSafari;
}

export function calculateSafeViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  
  return window.innerHeight;
}

export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(calculateSafeViewportHeight());
    };

    updateHeight();
    
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return viewportHeight;
}

interface MobileContextType {
  isMobile: boolean;
  isIOS: boolean;
  viewportHeight: number;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function MobileProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const viewportHeight = useViewportHeight();

  useEffect(() => {
    setIsMobile(isMobileBrowser());
    setIsIOS(isIOsSafari());
  }, []);

  return (
    <MobileContext.Provider value={{ isMobile, isIOS, viewportHeight }}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile() {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
}
