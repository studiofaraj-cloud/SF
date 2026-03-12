'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function HomeProjectSkeleton() {
  return (
    <section className="relative w-full py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container relative z-10 px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16">
          <Skeleton className="h-6 w-24 mx-auto mb-4 md:mb-6" />
          <Skeleton className="h-12 md:h-16 w-full max-w-2xl mx-auto mb-4 md:mb-6" />
          <Skeleton className="h-6 md:h-8 w-full max-w-xl mx-auto" />
        </div>

        {/* Featured Project Skeleton */}
        <div className="space-y-6 md:space-y-8 mb-6 md:mb-8">
          <Card className="relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="relative aspect-video lg:aspect-auto lg:h-[500px]">
                <Skeleton className="w-full h-full" />
              </div>
              
              {/* Content Side */}
              <div className="relative p-5 md:p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 md:h-10 w-3/4 mb-3 md:mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4 md:mb-6" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </Card>

          {/* Remaining Projects Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden h-[300px] md:h-[400px]">
                <Skeleton className="w-full h-full absolute inset-0" />
                <div className="relative z-10 h-full flex flex-col justify-between p-5 md:p-8">
                  <Skeleton className="h-6 w-24" />
                  <div>
                    <Skeleton className="h-6 md:h-7 w-3/4 mb-2 md:mb-3" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Button Skeleton */}
        <div className="text-center mt-10 md:mt-16">
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </div>
    </section>
  );
}
