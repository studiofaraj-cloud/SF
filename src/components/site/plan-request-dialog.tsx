'use client';

import { useState } from 'react';
import { submitPlanRequest } from '@/lib/message-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CreditCard, Sparkles, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PlanRequestDialogProps {
  planName: string;
  planPrice: string;
  serviceName: string;
  btnClassName?: string;
  btnVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  btnLabel?: string;
  btnStyle?: React.CSSProperties;
}

export function PlanRequestDialog({
  planName,
  planPrice,
  serviceName,
  btnClassName = '',
  btnVariant = 'default',
  btnLabel,
  btnStyle = {}
}: PlanRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('dialogs.planRequest');
  const tServer = useTranslations('serverActions');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('planName', planName);
    formData.append('planPrice', planPrice.toString());
    formData.append('serviceName', serviceName);

    try {
      const result = await submitPlanRequest({ message: null, success: false }, formData);
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setEmail('');
        }, 4000);
      } else {
        toast({
          title: t('errors.title'),
          description: result.message ? tServer(result.message) : t('errors.default'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('errors.connectionTitle'),
        description: t('errors.connectionDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset states strictly when closed manually
        setTimeout(() => {
          setIsSuccess(false);
          setEmail('');
        }, 300);
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          variant={btnVariant as any} 
          className={btnClassName}
          style={btnStyle}
        >
          {btnLabel || `Richiedi ${planName}`}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md !rounded-3xl bg-card backdrop-blur-xl border-primary/20 shadow-2xl flex flex-col p-6 sm:p-8">
        {!isSuccess ? (
          <>
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground mb-4 shadow-lg shadow-primary/20 mx-auto">
                <CreditCard className="w-7 h-7" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">{t('title', { planName })}</DialogTitle>
              <DialogDescription className="text-center text-base mt-2">
                {t.rich('description', {
                  serviceName,
                  serviceNameTag: (chunks) => <span className="font-semibold text-primary">{chunks}</span>
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-primary/5 rounded-2xl p-4 flex items-center justify-between border border-primary/10 mb-6">
              <span className="text-sm font-medium text-muted-foreground">{t('priceLabel')}</span>
              <span className="text-xl font-bold text-foreground">€{planPrice}</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-background/50 border-primary/20 focus-visible:ring-primary/30 rounded-xl"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg mt-2 group transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    {t('submit')}
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">{t('successTitle')}</h3>
            <p className="text-muted-foreground">
              {t.rich('successDesc', {
                planName,
                planNameTag: (chunks) => <span className="font-semibold text-primary">{chunks}</span>
              })}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
