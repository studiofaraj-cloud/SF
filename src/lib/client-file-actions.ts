'use server';

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { requireUser, requireRole } from '@/lib/auth';
import { deleteFile } from '@/lib/storage';
import {
  createClientFile,
  getClientFileById,
  getClientFiles,
  deleteClientFile,
  type ClientFile,
} from '@/lib/firestore-data';

/** Per-client storage quota (bytes). */
export const CLIENT_FILE_QUOTA = 25 * 1024 * 1024; // 25 MB
const MAX_FILENAME = 300;

type SessionUser = { id: string; name: string; email?: string; role: 'admin' | 'client' };

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

const MetaSchema = z.object({
  url: z.string().url(),
  storagePath: z.string().min(1),
  filename: z.string().min(1).max(MAX_FILENAME),
  size: z.number().int().nonnegative(),
  contentType: z.string().optional(),
});

function targetClientId(user: SessionUser, requestedClientId?: string): string {
  if (user.role === 'admin' && requestedClientId) return requestedClientId;
  return user.id;
}

// ── Reads ──────────────────────────────────────────────────────────────────

export interface FilesUsage {
  used: number;
  limit: number;
  available: number;
}

export async function getMyFilesUsageAction(): Promise<FilesUsage> {
  const user = (await requireUser()) as SessionUser;
  const files = await getClientFiles(user.id);
  const used = files.reduce((s, f) => s + (f.size || 0), 0);
  return { used, limit: CLIENT_FILE_QUOTA, available: Math.max(0, CLIENT_FILE_QUOTA - used) };
}

export async function getMyFilesAction(): Promise<ClientFile[]> {
  const user = (await requireUser()) as SessionUser;
  const files = await getClientFiles(user.id);
  return files.map(serialize);
}

/** Admin: list a specific client's files. */
export async function adminListClientFilesAction(clientId: string): Promise<ClientFile[]> {
  await requireRole('admin');
  const files = await getClientFiles(clientId);
  return files.map(serialize);
}

// ── Add / delete ────────────────────────────────────────────────────────────

export async function addClientFileAction(
  meta: { url: string; storagePath: string; filename: string; size: number; contentType?: string },
  clientId?: string
): Promise<{ success: boolean; file?: ClientFile; error?: string; usage?: FilesUsage }> {
  let user: SessionUser;
  try {
    user = (await requireUser()) as SessionUser;
  } catch {
    return { success: false, error: 'Not authenticated.' };
  }

  const parsed = MetaSchema.safeParse(meta);
  if (!parsed.success) return { success: false, error: 'Invalid file metadata.' };

  const target = targetClientId(user, clientId);
  // Pin storage path to that client's folder.
  if (!parsed.data.storagePath.startsWith(`clients/${target}/`)) {
    return { success: false, error: 'Invalid storage path.' };
  }

  // Quota check (server-side authoritative).
  const existing = await getClientFiles(target);
  const used = existing.reduce((s, f) => s + (f.size || 0), 0);
  if (used + parsed.data.size > CLIENT_FILE_QUOTA) {
    return {
      success: false,
      error: 'Quota exceeded.',
      usage: { used, limit: CLIENT_FILE_QUOTA, available: Math.max(0, CLIENT_FILE_QUOTA - used) },
    };
  }

  try {
    const id = await createClientFile({
      clientId: target,
      uploaderId: user.id,
      uploaderName: user.name,
      uploaderRole: user.role,
      ...parsed.data,
    });
    const file = serialize({
      id,
      clientId: target,
      uploaderId: user.id,
      uploaderName: user.name,
      uploaderRole: user.role,
      ...parsed.data,
      createdAt: Timestamp.now(),
    });
    const newUsed = used + parsed.data.size;
    return {
      success: true,
      file,
      usage: { used: newUsed, limit: CLIENT_FILE_QUOTA, available: Math.max(0, CLIENT_FILE_QUOTA - newUsed) },
    };
  } catch (error) {
    console.error('[client-file-actions] add failed:', error);
    return { success: false, error: 'Failed to record the file.' };
  }
}

export async function deleteClientFileAction(fileId: string): Promise<{ success: boolean; error?: string }> {
  let user: SessionUser;
  try {
    user = (await requireUser()) as SessionUser;
  } catch {
    return { success: false, error: 'Not authenticated.' };
  }
  const file = await getClientFileById(fileId);
  if (!file) return { success: false, error: 'File not found.' };
  // Only the uploader, the file's client, or any admin can delete.
  if (user.role !== 'admin' && user.id !== file.uploaderId && user.id !== file.clientId) {
    return { success: false, error: 'You cannot delete this file.' };
  }
  try {
    await deleteClientFile(fileId);
    deleteFile(file.storagePath).catch(() => {});
    return { success: true };
  } catch (error) {
    console.error('[client-file-actions] delete failed:', error);
    return { success: false, error: 'Failed to delete file.' };
  }
}
