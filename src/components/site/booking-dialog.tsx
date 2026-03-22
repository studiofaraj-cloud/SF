'use client';

import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { BookingForm } from './booking-form';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const t = useTranslations('bookingDialog');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Mobile: fullscreen sheet
          "!fixed !inset-0 !translate-x-0 !translate-y-0 !left-0 !top-0",
          "p-0 border-0 gap-0 w-full h-[100vh] h-[100dvh] max-w-full max-h-[100vh] max-h-[100dvh] rounded-none",
          // Desktop: centered modal
          "sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!-translate-x-1/2 sm:!-translate-y-1/2",
          "sm:w-full sm:max-w-[600px] sm:h-auto sm:max-h-[90vh] sm:max-h-[90dvh] sm:rounded-3xl",
          // Shared
          "bg-card backdrop-blur-xl sm:border-2 sm:border-primary/20",
          "shadow-none sm:shadow-2xl sm:shadow-primary/10",
          "overflow-hidden flex flex-col",
          // Hide the default Radix close button (we render our own)
          "[&>button.absolute]:hidden"
        )}
      >
        {/* Decorative gradient border effect */}
        <div className="absolute inset-0 sm:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-50 pointer-events-none" />

        {/* Sticky header with close button */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-primary/10 px-5 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-4">
          {/* Close button — large touch target */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground/70" />
          </button>

          <DialogHeader className="pr-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {t('title')}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-5 sm:p-6 md:p-8 pb-8 sm:pb-8">
            <BookingForm 
              source="booking-dialog" 
              onSuccess={() => {
                setTimeout(() => {
                  onOpenChange(false);
                }, 2000);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
