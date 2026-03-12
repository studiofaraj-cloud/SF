'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Hide loader once page is fully loaded
    const handleLoad = () => {
      // Start fade out animation
      setIsFadingOut(true);
      // Remove from DOM after animation completes
      setTimeout(() => setIsLoading(false), 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center ${isFadingOut ? 'animate-fade-out' : ''}`}>
      <div className="flex flex-col items-center gap-4">
        <Image 
          src="/assets/logo.png" 
          alt="Studio Faraj" 
          width={80} 
          height={80}
          className="animate-pulse"
          priority
        />
        <div className="h-1 w-32 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
