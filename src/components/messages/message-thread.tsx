'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThreadMessage {
  id?: string;
  senderId: string;
  senderName?: string;
  senderRole: 'admin' | 'client';
  body: string;
  createdAt?: { toDate?: () => Date } | null;
}

function formatTime(ts: ThreadMessage['createdAt'], locale: string): string {
  const d = ts?.toDate ? ts.toDate() : null;
  return d ? d.toLocaleString(locale === 'en' ? 'en-GB' : 'it-IT') : '';
}

export function MessageThread({
  messages,
  currentUserId,
  onSend,
  locale = 'it',
  emptyText,
  heightClass = 'h-[460px]',
}: {
  messages: ThreadMessage[];
  currentUserId?: string;
  onSend: (body: string) => Promise<{ success: boolean; error?: string }>;
  locale?: string;
  emptyText?: string;
  heightClass?: string;
}) {
  const en = locale === 'en';
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    const res = await onSend(text);
    if (res.success) {
      setBody('');
    } else {
      setError(res.error ?? (en ? 'Failed to send.' : 'Invio non riuscito.'));
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col">
      <div className={cn('space-y-3 overflow-y-auto pr-1', heightClass)}>
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {emptyText ?? (en ? 'No messages yet.' : 'Ancora nessun messaggio.')}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    mine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-xs font-medium opacity-90">
                      {m.senderName || (m.senderRole === 'admin' ? 'Studio Faraj' : 'Cliente')}
                    </span>
                    {m.senderRole === 'admin' && (
                      <Badge className="h-4 border-0 bg-background/20 px-1 text-[10px] text-current">
                        Studio Faraj
                      </Badge>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">{formatTime(m.createdAt, locale)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-3 flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={en ? 'Write a message…' : 'Scrivi un messaggio…'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
          }}
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !body.trim()} className="h-10 gap-1">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
