'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useUser } from '@/firebase/provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, FolderOpen, Receipt } from 'lucide-react';

export default function HubDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const { user } = useUser();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Live unread-message count for this client's direct conversation.
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(
      doc(db, 'conversations', user.uid),
      (snap) => setUnreadMessages(snap.exists() ? (snap.data().unreadForClient ?? 0) : 0),
      () => setUnreadMessages(0)
    );
    return () => unsub();
  }, [user?.uid]);

  const sections = [
    {
      icon: FileText,
      title: en ? 'My Requests' : 'Le mie richieste',
      desc: en ? 'Submit and track your service requests.' : 'Invia e monitora le tue richieste di servizio.',
      href: `/${locale}/hub/requests`,
      badge: 0,
    },
    {
      icon: MessageSquare,
      title: en ? 'Messages' : 'Messaggi',
      desc: en ? 'Chat with the Studio Faraj team.' : 'Chatta con il team di Studio Faraj.',
      href: `/${locale}/hub/messages`,
      badge: unreadMessages,
    },
    {
      icon: FolderOpen,
      title: en ? 'Files' : 'File',
      desc: en ? 'Share briefs and receive deliverables (up to 25 MB).' : 'Condividi brief e ricevi i materiali (fino a 25 MB).',
      href: `/${locale}/hub/files`,
      badge: 0,
    },
    {
      icon: Receipt,
      title: en ? 'Quotes & Invoices' : 'Preventivi e fatture',
      desc: en ? 'Review quotes and pay securely.' : 'Consulta i preventivi e paga in sicurezza.',
      href: `/${locale}/hub/quotes`,
      badge: 0,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {locale === 'en' ? 'Welcome' : 'Benvenuto'}
          {user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const card = (
            <Card
              key={s.title}
              className={s.href ? 'h-full transition-shadow hover:shadow-md' : 'h-full opacity-70'}
            >
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <s.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{s.title}</CardTitle>
                {s.badge > 0 && (
                  <Badge className="ml-auto h-5 min-w-5 justify-center bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {s.badge}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {!s.href && (
                  <p className="mt-2 text-xs font-medium text-primary">
                    {en ? 'Coming soon' : 'Prossimamente'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
          return s.href ? (
            <Link key={s.title} href={s.href} className="block">
              {card}
            </Link>
          ) : (
            card
          );
        })}
      </div>
    </div>
  );
}
