'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, MessageSquare, DollarSign, Tag, Trash2, CheckCircle, Circle, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
  budget?: string;
  source?: 'contact-form' | 'quote-dialog';
  createdAt: string;
  read: boolean;
};

type MessageDetailProps = {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
};

export function MessageDetail({
  message,
  open,
  onOpenChange,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: MessageDetailProps) {
  if (!message) return null;

  const handleToggleRead = () => {
    if (message.read) {
      onMarkAsUnread(message.id);
    } else {
      onMarkAsRead(message.id);
    }
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questo messaggio?')) {
      onDelete(message.id);
      onOpenChange(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: it,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[85vh] sm:max-h-[90vh] p-0 gap-0 [&]:!fixed [&]:!left-1/2 [&]:!top-1/2 [&]:!-translate-x-1/2 [&]:!-translate-y-1/2 [&]:!m-0 [&]:!z-50">
        <div className="holographic-card neon-border bg-card/95 backdrop-blur-md border-primary/30 overflow-hidden flex flex-col h-full">
          {/* Header - Sticky */}
          <DialogHeader className="p-6 pb-4 border-b border-primary/20 bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30 flex-shrink-0">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
                  Dettagli Messaggio
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{timeAgo}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={message.source === 'quote-dialog' ? 'default' : 'secondary'}
                className={`text-xs ${
                  message.source === 'quote-dialog'
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-secondary/50'
                }`}
              >
                {message.source === 'quote-dialog' ? 'Richiesta Preventivo' : 'Contatto'}
              </Badge>
              {!message.read && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  Non letto
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* From Section */}
          <div className="holographic-card rounded-xl p-4 md:p-5 bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-300 hover:border-primary/40">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30 flex-shrink-0">
                <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg text-foreground mb-1">
                  {message.name}
                </h3>
                <a
                  href={`mailto:${message.email}`}
                  className="text-sm md:text-base text-primary hover:underline break-all block mb-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {message.email}
                </a>
                {message.phone && (
                  <a
                    href={`tel:${message.phone}`}
                    className="text-sm md:text-base text-primary hover:underline break-all flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3 w-3 md:h-4 md:w-4" />
                    {message.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Service and Budget */}
          {(message.service || message.budget) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {message.service && (
                <div className="holographic-card rounded-xl p-4 md:p-5 bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-300 hover:border-primary/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Servizio</span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-foreground">{message.service}</p>
                </div>
              )}
              {message.budget && (
                <div className="holographic-card rounded-xl p-4 md:p-5 bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-300 hover:border-primary/40">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-foreground">{message.budget}</p>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div className="holographic-card rounded-xl p-4 md:p-6 bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-300 hover:border-primary/40">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Messaggio</span>
            </div>
            <div className="prose prose-sm md:prose-base max-w-none">
              <p className="text-sm md:text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {message.message}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground pt-2 border-t border-primary/10">
            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
            <span>Ricevuto: {new Date(message.createdAt).toLocaleString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </div>
        </div>

          {/* Footer - Sticky */}
          <div className="p-6 pt-4 border-t border-primary/20 bg-card/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleToggleRead}
                className="flex items-center gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              >
                {message.read ? (
                  <>
                    <Circle className="h-4 w-4" />
                    Segna come non letto
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Segna come letto
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const subject = `Re: ${message.service || 'Richiesta'}`;
                  window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(subject)}`;
                }}
                className="flex items-center gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              >
                <Mail className="h-4 w-4" />
                Rispondi
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
