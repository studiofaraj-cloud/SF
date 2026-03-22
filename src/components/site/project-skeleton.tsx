'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ProjectDetailSkeleton() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[70vh] min-h-[70svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
            <div className="flex justify-center gap-4 flex-wrap">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex justify-center gap-2 flex-wrap mt-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image Skeleton */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30" />
        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <Skeleton className="aspect-video max-w-6xl mx-auto rounded-2xl" />
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-64 w-full mt-8" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ProjectListSkeleton() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[80vh] min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-20 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Projects Grid Skeleton */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full holographic-card neon-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
