import type { ReactNode } from 'react';
import { CircleAlert, MailCheck, MailQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

/** The short pages a newsletter email links to: one message and one action. */
export function NewsletterNotice({
  tone,
  heading,
  body,
  children,
}: {
  tone: 'ask' | 'done' | 'error';
  heading: string;
  body: string;
  children?: ReactNode;
}) {
  const Icon = tone === 'done' ? MailCheck : tone === 'error' ? CircleAlert : MailQuestion;
  return (
    <div className="bg-background text-foreground">
      <section className="container mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 pb-24 pt-36 text-center md:px-8">
        <span
          className={cn(
            'grid h-14 w-14 place-items-center rounded-2xl',
            tone === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
          )}
        >
          <Icon aria-hidden className="h-7 w-7" />
        </span>
        <h1 className="mt-6 font-display text-[2.2rem] font-extrabold leading-[1.02] tracking-[-0.03em] md:text-[2.6rem]">{heading}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
        {children && <div className="mt-8">{children}</div>}
      </section>
    </div>
  );
}
