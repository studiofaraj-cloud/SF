'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, Phone } from 'lucide-react';
import { BookingDialog } from '@/components/site/booking-dialog';

interface NotFoundContentProps {
  locale: string;
  title: string;
  description: string;
  subtitle: string;
  homeLabel: string;
  bookCallLabel: string;
}

export function NotFoundContent({
  locale,
  title,
  description,
  subtitle,
  homeLabel,
  bookCallLabel,
}: NotFoundContentProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

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
            {title}
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          {subtitle}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/30">
            <Link href={`/${locale}`}>
              <Home className="h-4 w-4 mr-2" />
              {homeLabel}
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-primary/50 hover:border-primary hover:bg-primary/10"
            onClick={() => setIsBookingOpen(true)}
          >
            <Phone className="h-4 w-4 mr-2" />
            {bookCallLabel}
          </Button>
        </div>

        <BookingDialog open={isBookingOpen} onOpenChange={setIsBookingOpen} />
      </div>
    </div>
  );
}
