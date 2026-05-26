'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useUser } from '@/firebase/provider';
import { sendClientMessageAction, markConversationReadAction } from '@/lib/conversation-actions';
import { MessageThread, type ThreadMessage } from '@/components/messages/message-thread';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react';

export default function HubMessagesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const { user, isUserLoading } = useUser();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Live conversation feed (this client's own thread).
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'conversationMessages'),
      where('conversationId', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ThreadMessage & { createdAt: any }));
        docs.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
        setMessages(docs);
        setLoading(false);
        // Mark the team's messages as read for this client.
        markConversationReadAction().catch(() => {});
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user?.uid]);

  const handleSend = useMemo(
    () => async (text: string) => sendClientMessageAction(text),
    []
  );

  if (isUserLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href={`/${locale}/hub`}
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-primary" />
            {en ? 'Chat with Studio Faraj' : 'Chat con Studio Faraj'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MessageThread
            messages={messages}
            currentUserId={user?.uid}
            onSend={handleSend}
            locale={locale}
            emptyText={
              en
                ? 'Start the conversation — we usually reply within a few hours.'
                : 'Inizia la conversazione — di solito rispondiamo in poche ore.'
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
