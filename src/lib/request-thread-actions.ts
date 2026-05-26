'use server';

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { requireUser } from '@/lib/auth';
import { deleteFile } from '@/lib/storage';
import {
  getServiceRequestById,
  createRequestMessage,
  getRequestMessages,
  createRequestFile,
  getRequestFiles,
  getRequestFileById,
  deleteRequestFile,
  getUserProfile,
  type RequestMessage,
  type RequestFile,
} from '@/lib/firestore-data';
import { sendHubNotification, ADMIN_RECIPIENTS, EMAIL_SITE_URL } from '@/lib/email/hub-notify';

/** Convert Firestore Timestamps to ISO strings for client serialization. */
function serialize(data: any): any {
  if (data === null || data === undefined) return data;
  if (data instanceof Timestamp) return data.toDate().toISOString();
  if (Array.isArray(data)) return data.map(serialize);
  if (typeof data === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(data)) out[k] = serialize(v);
    return out;
  }
  return data;
}

type SessionUser = { id: string; name: string; email?: string; role: 'admin' | 'client' };

/** Email the party who did NOT send the message. Best-effort. */
async function notifyNewMessage(requestId: string, sender: SessionUser, body: string) {
  const request = await getServiceRequestById(requestId);
  if (!request) return;
  const snippet = body.length > 160 ? `${body.slice(0, 160)}…` : body;

  if (sender.role === 'client') {
    await sendHubNotification({
      to: ADMIN_RECIPIENTS,
      locale: 'it',
      subject: `Nuovo messaggio da ${sender.name} — ${request.title}`,
      heading: 'Nuovo messaggio dal cliente',
      intro: `${sender.name} ha scritto sulla richiesta "${request.title}".`,
      body: snippet,
      ctaLabel: 'Apri richiesta',
      ctaUrl: `${EMAIL_SITE_URL}/admin/requests/${requestId}`,
    });
    return;
  }

  if (request.clientEmail) {
    const profile = await getUserProfile(request.clientId);
    const locale = profile?.locale === 'en' ? 'en' : 'it';
    await sendHubNotification({
      to: [{ email: request.clientEmail, name: request.clientName }],
      locale,
      greetingName: request.clientName || profile?.displayName,
      subject:
        locale === 'en'
          ? `New message from Studio Faraj — ${request.title}`
          : `Nuovo messaggio da Studio Faraj — ${request.title}`,
      heading: locale === 'en' ? 'You have a new message' : 'Hai un nuovo messaggio',
      intro:
        locale === 'en'
          ? 'Studio Faraj replied to your request.'
          : 'Studio Faraj ha risposto alla tua richiesta.',
      body: snippet,
      ctaLabel: locale === 'en' ? 'View conversation' : 'Vedi conversazione',
      ctaUrl: `${EMAIL_SITE_URL}/${locale}/hub/requests/${requestId}`,
    });
  }
}

/**
 * Authorizes access to a request's thread/files: the owning client OR any
 * admin. Throws otherwise. Returns the session user for attribution.
 */
async function assertRequestAccess(requestId: string): Promise<SessionUser> {
  const user = (await requireUser()) as SessionUser;
  if (user.role === 'admin') return user;
  const request = await getServiceRequestById(requestId);
  if (!request || request.clientId !== user.id) {
    throw new Error('Forbidden: you do not have access to this request');
  }
  return user;
}

export interface RequestThread {
  messages: RequestMessage[];
  files: RequestFile[];
}

export async function getRequestThreadAction(requestId: string): Promise<RequestThread> {
  await assertRequestAccess(requestId);
  const [messages, files] = await Promise.all([
    getRequestMessages(requestId),
    getRequestFiles(requestId),
  ]);
  return { messages: messages.map(serialize), files: files.map(serialize) };
}

const MessageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty.').max(5000),
});

export async function postRequestMessageAction(
  requestId: string,
  body: string
): Promise<{ success: boolean; message?: RequestMessage; error?: string }> {
  let user: SessionUser;
  try {
    user = await assertRequestAccess(requestId);
  } catch (e) {
    return { success: false, error: 'You do not have access to this request.' };
  }

  const parsed = MessageSchema.safeParse({ body });
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors[0] ?? 'Invalid message.' };
  }

  try {
    const id = await createRequestMessage({
      requestId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      body: parsed.data.body,
    });
    const message = serialize({
      id,
      requestId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      body: parsed.data.body,
      createdAt: Timestamp.now(),
    });

    // Notify the other party (fire-and-forget).
    notifyNewMessage(requestId, user, parsed.data.body).catch(() => {});

    return { success: true, message };
  } catch (error) {
    console.error('[request-thread-actions] post message failed:', error);
    return { success: false, error: 'Failed to send message.' };
  }
}

const FileMetaSchema = z.object({
  url: z.string().url(),
  storagePath: z.string().min(1),
  filename: z.string().min(1).max(300),
  size: z.number().nonnegative(),
  contentType: z.string().optional(),
});

export async function addRequestFileAction(
  requestId: string,
  meta: { url: string; storagePath: string; filename: string; size: number; contentType?: string }
): Promise<{ success: boolean; file?: RequestFile; error?: string }> {
  let user: SessionUser;
  try {
    user = await assertRequestAccess(requestId);
  } catch {
    return { success: false, error: 'You do not have access to this request.' };
  }

  const parsed = FileMetaSchema.safeParse(meta);
  if (!parsed.success) {
    return { success: false, error: 'Invalid file metadata.' };
  }
  // Guard against recording a file outside this request's storage folder.
  if (!parsed.data.storagePath.startsWith(`requests/${requestId}/`)) {
    return { success: false, error: 'Invalid storage path.' };
  }

  try {
    const id = await createRequestFile({
      requestId,
      uploaderId: user.id,
      uploaderName: user.name,
      uploaderRole: user.role,
      ...parsed.data,
    });
    const file = serialize({
      id,
      requestId,
      uploaderId: user.id,
      uploaderName: user.name,
      uploaderRole: user.role,
      ...parsed.data,
      createdAt: Timestamp.now(),
    });
    return { success: true, file };
  } catch (error) {
    console.error('[request-thread-actions] add file failed:', error);
    return { success: false, error: 'Failed to attach file.' };
  }
}

export async function deleteRequestFileAction(
  fileId: string
): Promise<{ success: boolean; error?: string }> {
  let user: SessionUser;
  try {
    user = (await requireUser()) as SessionUser;
  } catch {
    return { success: false, error: 'Not authenticated.' };
  }

  const file = await getRequestFileById(fileId);
  if (!file) return { success: false, error: 'File not found.' };

  // Owner-uploader or admin may delete.
  if (user.role !== 'admin' && file.uploaderId !== user.id) {
    // Still allow the request owner to delete files on their own request.
    const request = await getServiceRequestById(file.requestId);
    if (!request || request.clientId !== user.id) {
      return { success: false, error: 'You cannot delete this file.' };
    }
  }

  try {
    await deleteRequestFile(fileId);
    // Best-effort storage cleanup.
    deleteFile(file.storagePath).catch(() => {});
    return { success: true };
  } catch (error) {
    console.error('[request-thread-actions] delete file failed:', error);
    return { success: false, error: 'Failed to delete file.' };
  }
}
