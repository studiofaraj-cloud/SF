'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

type ProcessStep = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
};

type ProcessTimelineProps = {
  steps: ProcessStep[];
};

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const { top, height } = timelineRef.current.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        
        const startPoint = screenHeight * 0.66;
        const scrollAmount = startPoint - top;
        const currentProgress = scrollAmount / (height);
        
        setProgress(Math.max(0, Math.min(1, currentProgress)));
      }
    };
    
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                window.addEventListener('scroll', handleScroll);
                handleScroll();
            } else {
                window.removeEventListener('scroll', handleScroll);
            }
        },
        { threshold: 0.1 }
    );

    const currentRef = timelineRef.current;
    if (currentRef) {
        observer.observe(currentRef);
    }

    return () => {
        window.removeEventListener('scroll', handleScroll);
        if (currentRef) {
            observer.unobserve(currentRef);
        }
    };
  }, []);

  const numSteps = steps.length;

  // Mobile layout: clean vertical cards
  if (isMobile) {
    return (
      <div ref={timelineRef} className="relative max-w-full mx-auto pt-6 pb-4 px-4">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const stepProgress = (index + 0.5) / numSteps;
            const isVisible = progress >= stepProgress;

            return (
              <div
                key={step.number}
                className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              >
                <Card
                  className={`
                    relative overflow-hidden rounded-2xl p-5 transition-all duration-500
                    ${isVisible
                      ? 'bg-card border-primary/20 shadow-lg shadow-primary/10'
                      : 'bg-card/60 border-border/50'
                    }
                  `}
                >
                  {/* Accent line at top */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-all duration-700 ${
                      isVisible
                        ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/30'
                        : 'bg-border/30'
                    }`}
                  />

                  {/* Step number + icon row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`
                        flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm
                        transition-all duration-500 flex-shrink-0
                        ${isVisible
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {step.number}
                    </div>
                    <div
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                        transition-all duration-500
                        ${isVisible
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                        }
                      `}
                    >
                      {React.cloneElement(step.icon as React.ReactElement, { className: 'w-5 h-5' })}
                    </div>
                    <h3 className={`font-bold text-base transition-colors duration-500 ${isVisible ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed pl-12">
                    {step.description}
                  </p>

                  {/* Connector line to next step */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center mt-4 -mb-5">
                      <div
                        className={`w-0.5 h-5 rounded-full transition-all duration-500 ${
                          isVisible ? 'bg-primary/30' : 'bg-border/30'
                        }`}
                      />
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop layout: alternating sides
  return (
    <div ref={timelineRef} className="relative max-w-xl mx-auto md:max-w-2xl lg:max-w-4xl py-16">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{ 
              left: `${15 + i * 20}%`, 
              top: `${10 + (i % 3) * 35}%`,
              animationDelay: `${i * 1.5}s`
            }} 
          />
        ))}
      </div>
      
      {/* Main timeline line with neon glow */}
      <div className="absolute top-0 left-1/2 w-1 h-full -translate-x-1/2 rounded-full overflow-hidden" style={{ zIndex: 0 }}>
        {/* Background line */}
        <div className="absolute inset-0 bg-gradient-to-b from-border via-border to-border/50" />
        {/* Animated progress line with gradient and glow */}
        <div 
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-primary/80 rounded-full transition-transform duration-100 ease-out origin-top neon-glow" 
          style={{ transform: `scaleY(${progress})`, height: '100%' }} 
        />
        {/* Enhanced glow effect */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-6 bg-primary/40 blur-lg rounded-full transition-transform duration-100 ease-out origin-top" 
          style={{ transform: `scaleY(${progress})`, height: '100%' }} 
        />
      </div>
      
      <div className="space-y-20">
        {steps.map((step, index) => {
          const stepProgress = (index + 0.5) / numSteps;
          const isVisible = progress >= stepProgress;
          const lineToCardProgress = Math.min(1, Math.max(0, (progress - (index / numSteps)) * numSteps * 2));
          const isRightSide = index % 2 !== 0;

          return (
            <div key={step.number} className={`relative flex items-center ${isRightSide ? 'justify-end' : 'justify-start'}`}>
              
              {/* Card Container */}
              <div className={`w-1/2 relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                 <div className={`relative ${isRightSide ? 'pl-10' : 'pr-10'}`}>
                    {/* Horizontal connecting line with neon glow */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        style={{
                            width: '2.5rem',
                            transform: `scaleX(${lineToCardProgress}) translateY(-50%)`,
                            zIndex: 0,
                            ...(isRightSide ? { left: '0', transformOrigin: 'left' } : { right: '0', transformOrigin: 'right' })
                        }}
                    ></div>
                    
                    {/* Card with holographic effect */}
                    <Card 
                      className={`
                        group relative p-6 holographic-card neon-border rounded-2xl 
                        overflow-hidden
                        transition-all duration-500 
                        hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1
                        ${isRightSide ? 'text-left' : 'text-right'}
                      `} 
                      style={{ zIndex: 2 }}
                    >
                      {/* Top accent line */}
                      <div className={`absolute top-0 ${isRightSide ? 'left-0' : 'right-0'} w-1/3 h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full`} />
                      
                      <div className="relative z-10">
                        {/* Icon with hexagonal-style background */}
                        <div className={`mb-4 inline-flex ${isRightSide ? 'mr-auto' : 'ml-auto'}`}>
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                            {React.cloneElement(step.icon as React.ReactElement, { className: 'w-7 h-7' })}
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-xl text-primary mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </Card>
                 </div>
              </div>

              {/* Numbered Circle with neon effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-shrink-0" style={{ zIndex: 1 }}>
                <div 
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full 
                    bg-card font-bold text-lg transition-all duration-500
                    ${isVisible 
                      ? 'border-2 border-primary text-primary shadow-lg shadow-primary/30 neon-glow' 
                      : 'border-2 border-border text-muted-foreground'
                    }
                  `}
                >
                  {/* Enhanced pulse effect when active */}
                  {isVisible && (
                    <>
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                    </>
                  )}
                  <span className="relative z-10">{step.number}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
