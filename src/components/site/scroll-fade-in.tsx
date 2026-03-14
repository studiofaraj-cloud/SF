'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade';

type ScrollFadeInProps = {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  performanceMode?: boolean;
};

export default function ScrollFadeIn({ 
  children, 
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.1,
  once = true,
  performanceMode = false
}: ScrollFadeInProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const willChangeTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  
  // Track mount state to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
    mountedRef.current = true;
  }, []);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Use desktop defaults during SSR to match initial client render
  // This prevents hydration mismatches
  const effectiveIsMobile = mounted ? (isMobile ?? false) : false;
  
  // Optimize for mobile: shorter duration and reduced delay
  const effectiveDuration = effectiveIsMobile ? Math.min(400, duration * 0.6) : duration;
  const effectiveDelay = effectiveIsMobile ? Math.max(0, delay * 0.5) : delay;
  
  // Mobile-specific threshold and rootMargin for earlier trigger
  const effectiveThreshold = effectiveIsMobile ? Math.min(0.05, threshold) : threshold;
  const effectiveRootMargin = effectiveIsMobile ? '0px 0px -30px 0px' : '0px 0px -50px 0px';

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !mountedRef.current) return; // Wait for component to be mounted before setting up observer

    const updateVisibility = (visible: boolean) => {
      // Only update visibility after component has mounted to prevent hydration mismatches
      if (!mountedRef.current) return;
      
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        // Double-check mounted state before updating
        if (!mountedRef.current) return;
        
        if (visible && !isVisible) {
          element.style.willChange = 'opacity, transform';
          
          setIsVisible(visible);

          if (willChangeTimeoutRef.current !== null) {
            clearTimeout(willChangeTimeoutRef.current);
          }
          willChangeTimeoutRef.current = window.setTimeout(() => {
            element.style.willChange = 'auto';
          }, 500);
        } else if (!visible) {
          setIsVisible(visible);
        }
      });
    };

    // Add a small delay to ensure hydration is complete before observing
    const setupObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              updateVisibility(true);
              if (once) {
                observer.unobserve(entry.target);
              }
            } else if (!once) {
              updateVisibility(false);
            }
          });
        },
        {
          threshold: effectiveThreshold,
          rootMargin: effectiveRootMargin,
        }
      );

      observer.observe(element);
      
      return observer;
    };

    // Use requestAnimationFrame to ensure hydration completes before setting up observer
    const observerTimeout = requestAnimationFrame(() => {
      const observer = setupObserver();
      
      const handleScroll = () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
          if (observer && element && mountedRef.current) {
            observer.unobserve(element);
            observer.observe(element);
          }
        });
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
        
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        
        if (willChangeTimeoutRef.current !== null) {
          clearTimeout(willChangeTimeoutRef.current);
        }
      };
    });

    return () => {
      cancelAnimationFrame(observerTimeout);
    };
  }, [effectiveThreshold, effectiveRootMargin, once, isVisible, mounted]);

  const getAnimationClasses = () => {
    // Use optimized easing for mobile, standard for desktop
    const baseTransition = 'transition-all ease-out';
    
    // If reduced motion is preferred, only use fade animation
    if (prefersReducedMotion) {
      return `${baseTransition} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    }
    
    // Reduce transform distances on mobile for better performance
    // Use effectiveIsMobile to ensure consistent SSR/client rendering
    const animations: Record<AnimationType, { initial: string; visible: string }> = {
      'fade-up': {
        initial: effectiveIsMobile ? 'opacity-0 translate-y-5' : 'opacity-0 translate-y-8',
        visible: 'opacity-100 translate-y-0',
      },
      'fade-down': {
        initial: effectiveIsMobile ? 'opacity-0 -translate-y-5' : 'opacity-0 -translate-y-8',
        visible: 'opacity-100 translate-y-0',
      },
      'fade-left': {
        initial: effectiveIsMobile ? 'opacity-0 translate-x-5' : 'opacity-0 translate-x-8',
        visible: 'opacity-100 translate-x-0',
      },
      'fade-right': {
        initial: effectiveIsMobile ? 'opacity-0 -translate-x-5' : 'opacity-0 -translate-x-8',
        visible: 'opacity-100 translate-x-0',
      },
      'scale': {
        initial: 'opacity-0 scale-95',
        visible: 'opacity-100 scale-100',
      },
      'fade': {
        initial: 'opacity-0',
        visible: 'opacity-100',
      },
    };

    const { initial, visible } = animations[animation];
    return `${baseTransition} ${isVisible ? visible : initial}`;
  };

  // Get inline styles with GPU acceleration hints for mobile
  const getInlineStyles = () => {
    const baseStyles: React.CSSProperties = {
      transitionDuration: `${effectiveDuration}ms`,
      transitionDelay: `${effectiveDelay}ms`,
    };

    return baseStyles;
  };

  return (
    <div
      ref={elementRef}
      className={`${className} ${getAnimationClasses()}`}
      style={getInlineStyles()}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

// Utility hook for scroll animations
export function useScrollAnimation(threshold = 0.1) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Mobile-specific threshold and rootMargin for earlier trigger
  const effectiveThreshold = isMobile ? Math.min(0.05, threshold) : threshold;
  const effectiveRootMargin = isMobile ? '0px 0px -30px 0px' : '0px 0px -50px 0px';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: effectiveThreshold,
        rootMargin: effectiveRootMargin,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [effectiveThreshold, effectiveRootMargin]);

  return { ref: elementRef, isVisible };
}
