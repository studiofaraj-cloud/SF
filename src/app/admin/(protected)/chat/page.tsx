'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useUser } from '@/firebase/provider';
import {
  sendAdminMessageAction,
  markConversationReadAction,
} from '@/lib/conversation-actions';
import { MessageThread, type ThreadMessage } from '@/components/messages/message-thread';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessagesSquare, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationRow {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  lastMessage?: string;
  lastMessageAt?: { toMillis?: () => number; toDate?: () => Date } | null;
  unreadForAdmin?: number;
}

export default function AdminChatPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Live list of all client conversations.
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'conversations'),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ConversationRow));
        rows.sort((a, b) => (b.lastMessageAt?.toMillis?.() ?? 0) - (a.lastMessageAt?.toMillis?.() ?? 0));
        setConversations(rows);
        setLoadingList(false);
        setSelected((cur) => cur ?? rows[0]?.clientId ?? null);
      },
      () => setLoadingList(false)
    );
    return () => unsub();
  }, []);

  // Live messages for the selected conversation.
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    const q = query(collection(db, 'conversationMessages'), where('conversationId', '==', selected));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ThreadMessage & { createdAt: any }));
      docs.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
      setMessages(docs);
      markConversationReadAction(selected).catch(() => {});
    });
    return () => unsub();
  }, [selected]);

  const handleSend = useMemo(
    () => async (text: string) => {
      if (!selected) return { success: false, error: 'No conversation selected.' };
      return sendAdminMessageAction(selected, text);
    },
    [selected]
  );

  const activeConvo = conversations.find((c) => c.clientId === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MessagesSquare className="h-8 w-8 text-primary" />
          Chat Clienti
        </h1>
        <p className="text-muted-foreground mt-1">Conversazioni dirette con i clienti</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Conversation list */}
        <Card className="holographic-card neon-border lg:col-span-1">
          <CardContent className="p-2">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Nessuna conversazione.</p>
            ) : (
              <ul className="max-h-[520px] space-y-1 overflow-y-auto">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelected(c.clientId)}
                      className={cn(
                        'w-full rounded-lg p-3 text-left transition-colors',
                        selected === c.clientId ? 'bg-primary/10' : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-sm">
                          {c.clientName || c.clientEmail || 'Cliente'}
                        </span>
                        {!!c.unreadForAdmin && c.unreadForAdmin > 0 && (
                          <Badge className="h-5 min-w-5 justify-center bg-primary px-1 text-[10px] text-primary-foreground">
                            {c.unreadForAdmin}
                          </Badge>
                        )}
                      </div>
                      {c.lastMessage && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Selected thread */}
        <Card className="holographic-card neon-border lg:col-span-2">
          <CardContent className="p-4">
            {!selected ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Seleziona una conversazione.
              </p>
            ) : (
              <>
                <div className="mb-3 border-b border-border/50 pb-3">
                  <p className="font-semibold">{activeConvo?.clientName || 'Cliente'}</p>
                  {activeConvo?.clientEmail && (
                    <a
                      href={`mailto:${activeConvo.clientEmail}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-3 w-3" />
                      {activeConvo.clientEmail}
                    </a>
                  )}
                </div>
                <MessageThread
                  messages={messages}
                  currentUserId={user?.uid}
                  onSend={handleSend}
                  locale="it"
                  heightClass="h-[420px]"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
