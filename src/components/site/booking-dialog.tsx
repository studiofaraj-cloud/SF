'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CONTACT, whatsappUrl } from '@/lib/contact-info';
import { BookingForm } from './booking-form';
import { DialogAside, SplitDialog } from './split-dialog';
import { WhatsAppIcon } from './whatsapp-icon';

const STEPS = ['pick', 'confirm', 'talk'] as const;

/** Booking a call: the quote dialog's shell, with the booking form beside the navy side. */
export function BookingDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const t = useTranslations('bookingDialog.v2');

  return (
    <SplitDialog
      open={open}
      onOpenChange={onOpenChange}
      onCloseAutoFocus={onCloseAutoFocus}
      closeLabel={t('close')}
      aside={
        <DialogAside
          eyebrow={t('eyebrow')}
          title={t('dialogTitle')}
          description={t('lead')}
          stepsTitle={t('stepsTitle')}
          steps={STEPS.map((s) => ({ title: t(`steps.${s}.title`), text: t(`steps.${s}.text`) }))}
          footer={
            <>
              <a
                href={whatsappUrl(t('whatsappGreeting'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                {t('whatsapp')}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                <Mail className="h-4 w-4 text-sky-300" />
                {CONTACT.email}
              </a>
            </>
          }
        />
      }
    >
      <BookingForm
        source="booking-dialog"
        successAction={
          <DialogPrimitive.Close asChild>
            <Button autoFocus className="h-12 rounded-xl px-7 text-base font-semibold">
              {t('close')}
            </Button>
          </DialogPrimitive.Close>
        }
      />
    </SplitDialog>
  );
}
