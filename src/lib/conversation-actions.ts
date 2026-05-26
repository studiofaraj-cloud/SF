'use server';

import { z } from 'zod';
import { requireUser, requireRole } from '@/lib/auth';
import {
  createConversationMessage,
  touchConversation,
  markConversationRead,
  getConversation,
} from '@/lib/firestore-data';
import { sendHubNotification, ADMIN_RECIPIENTS, EMAIL_SITE_URL } from '@/lib/email/hub-notify';

type SessionUser = { id: string; name: string; email?: string; role: 'admin' | 'client' };

const MessageSchema = z.object({ body: z.string().trim().min(1, 'Empty message.').max(5000) });

/** Client (or any signed-in user) sends a message to the Studio Faraj team. */
export async function sendClientMessageAction(
  body: string
): Promise<{ success: boolean; error?: string }> {
  let user: SessionUser;
  try {
    user = (await requireUser()) as SessionUser;
  } catch {
    return { success: false, error: 'You must be signed in.' };
  }

  const parsed = MessageSchema.safeParse({ body });
  if (!parsed.success) return { success: false, error: parsed.error.flatten().formErrors[0] };

  try {
    await createConversationMessage({
      conversationId: user.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: 'client',
      body: parsed.data.body,
    });
    await touchConversation(user.id, {
      clientName: user.name,
      clientEmail: user.email,
      lastMessage: parsed.data.body,
      lastSenderRole: 'client',
      recipient: 'admin',
    });

    // Notify admins by email (fire-and-forget).
    sendHubNotification({
      to: ADMIN_RECIPIENTS,
      locale: 'it',
      subject: `Nuovo messaggio in chat da ${user.name}`,
      heading: 'Nuovo messaggio dal cliente',
      intro: `${user.name} ti ha scritto nella chat dell'area clienti.`,
      body: parsed.data.body.length > 160 ? `${parsed.data.body.slice(0, 160)}…` : parsed.data.body,
      ctaLabel: 'Apri la chat',
      ctaUrl: `${EMAIL_SITE_URL}/admin/chat`,
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error('[conversation-actions] client send failed:', error);
    return { success: false, error: 'Failed to send message.' };
  }
}

/** Admin replies to a specific client's conversation. */
export async function sendAdminMessageAction(
  clientId: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin');
  const user = (await requireUser()) as SessionUser;

  const parsed = MessageSchema.safeParse({ body });
  if (!parsed.success) return { success: false, error: parsed.error.flatten().formErrors[0] };
  if (!clientId) return { success: false, error: 'Missing conversation.' };

  try {
    await createConversationMessage({
      conversationId: clientId,
      senderId: user.id,
      senderName: user.name,
      senderRole: 'admin',
      body: parsed.data.body,
    });
    await touchConversation(clientId, {
      lastMessage: parsed.data.body,
      lastSenderRole: 'admin',
      recipient: 'client',
    });

    // Notify the client by email if we know their address.
    const convo = await getConversation(clientId);
    if (convo?.clientEmail) {
      sendHubNotification({
        to: [{ email: convo.clientEmail, name: convo.clientName }],
        locale: 'it',
        greetingName: convo.clientName,
        subject: 'Nuovo messaggio da Studio Faraj',
        heading: 'Hai un nuovo messaggio',
        intro: 'Studio Faraj ti ha scritto nella tua area clienti.',
        body: parsed.data.body.length > 160 ? `${parsed.data.body.slice(0, 160)}…` : parsed.data.body,
        ctaLabel: 'Apri la chat',
        ctaUrl: `${EMAIL_SITE_URL}/it/hub/messages`,
      }).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error('[conversation-actions] admin send failed:', error);
    return { success: false, error: 'Failed to send message.' };
  }
}

/** Reset the unread counter for the caller's side of a conversation. */
export async function markConversationReadAction(clientId?: string): Promise<void> {
  let user: SessionUser;
  try {
    user = (await requireUser()) as SessionUser;
  } catch {
    return;
  }
  if (user.role === 'admin') {
    if (clientId) await markConversationRead(clientId, 'admin');
  } else {
    await markConversationRead(user.id, 'client');
  }
}
