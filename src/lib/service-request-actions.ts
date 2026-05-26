'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase/firestore';
import { requireUser, requireRole } from '@/lib/auth';
import {
  createServiceRequest,
  getServiceRequestById,
  getServiceRequestsByClient,
  listServiceRequests,
  updateServiceRequest,
  getUserProfile,
  type ServiceRequest,
  type ServiceRequestStatus,
} from '@/lib/firestore-data';
import { sendTransactionalEmails } from '@/lib/email/send';
import { sendHubNotification, EMAIL_SITE_URL } from '@/lib/email/hub-notify';
import { statusLabel } from '@/lib/service-request-status';
import { contactServices } from '@/lib/definitions';

function serviceLabel(value: string): string {
  return contactServices.find((s) => s.value === value)?.label ?? value;
}

const STATUSES: ServiceRequestStatus[] = [
  'new',
  'quoted',
  'accepted',
  'in_progress',
  'delivered',
  'closed',
  'cancelled',
];

/** Convert Firestore Timestamps to ISO strings so data is client-serializable. */
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

const CreateRequestSchema = z.object({
  type: z.string().min(1, 'Please choose a service type.'),
  title: z.string().min(3, 'Please add a short title.'),
  brief: z.string().min(10, 'Please describe what you need (at least 10 characters).'),
  budget: z.string().optional(),
});

export interface CreateRequestResult {
  success: boolean;
  id?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

// ── Client actions ──────────────────────────────────────────────────────────

export async function createServiceRequestAction(input: {
  type: string;
  title: string;
  brief: string;
  budget?: string;
}): Promise<CreateRequestResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, message: 'You must be signed in to submit a request.' };
  }

  const parsed = CreateRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const id = await createServiceRequest({
      clientId: user.id,
      clientName: user.name,
      clientEmail: user.email,
      type: parsed.data.type,
      title: parsed.data.title,
      brief: parsed.data.brief,
      budget: parsed.data.budget || undefined,
    });

    // Notify admins + thank the client (fire-and-forget).
    sendTransactionalEmails({
      scenario: 'service-request',
      locale: 'it',
      client: { name: user.name, email: user.email },
      adminFields: [
        { label: 'Servizio', value: serviceLabel(parsed.data.type) },
        { label: 'Titolo', value: parsed.data.title },
        { label: 'Budget', value: parsed.data.budget || 'Non specificato' },
        { label: 'Descrizione', value: parsed.data.brief },
      ],
    }).catch(() => {});

    revalidatePath('/admin/requests');
    return { success: true, id };
  } catch (error) {
    console.error('[service-request-actions] create failed:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

export async function getMyRequestsAction(): Promise<ServiceRequest[]> {
  const user = await requireUser();
  const requests = await getServiceRequestsByClient(user.id);
  return requests.map(serialize);
}

export async function getMyRequestAction(id: string): Promise<ServiceRequest | null> {
  const user = await requireUser();
  const request = await getServiceRequestById(id);
  // Ownership check — clients can only read their own requests.
  if (!request || request.clientId !== user.id) return null;
  return serialize(request);
}

// ── Admin actions ───────────────────────────────────────────────────────────

export async function listServiceRequestsAction(filters?: {
  status?: ServiceRequestStatus;
}): Promise<ServiceRequest[]> {
  await requireRole('admin');
  const requests = await listServiceRequests(filters);
  return requests.map(serialize);
}

export async function getServiceRequestAction(id: string): Promise<ServiceRequest | null> {
  await requireRole('admin');
  const request = await getServiceRequestById(id);
  return request ? serialize(request) : null;
}

export async function updateServiceRequestStatusAction(
  id: string,
  status: ServiceRequestStatus
): Promise<{ success: boolean; message: string }> {
  await requireRole('admin');
  if (!STATUSES.includes(status)) {
    return { success: false, message: 'Invalid status.' };
  }
  try {
    await updateServiceRequest(id, { status });

    // Notify the client of the new status (fire-and-forget, in their language).
    const request = await getServiceRequestById(id);
    if (request?.clientEmail) {
      const profile = await getUserProfile(request.clientId);
      const locale = profile?.locale === 'en' ? 'en' : 'it';
      const label = statusLabel(status, locale);
      sendHubNotification({
        to: [{ email: request.clientEmail, name: request.clientName }],
        locale,
        greetingName: request.clientName || profile?.displayName,
        subject:
          locale === 'en'
            ? `Update on "${request.title}" — Studio Faraj`
            : `Aggiornamento su "${request.title}" — Studio Faraj`,
        heading: locale === 'en' ? 'Your request was updated' : 'La tua richiesta è stata aggiornata',
        intro:
          locale === 'en'
            ? `The status of "${request.title}" is now: ${label}.`
            : `Lo stato di "${request.title}" è ora: ${label}.`,
        ctaLabel: locale === 'en' ? 'View request' : 'Vedi richiesta',
        ctaUrl: `${EMAIL_SITE_URL}/${locale}/hub/requests/${id}`,
      }).catch(() => {});
    }

    revalidatePath('/admin/requests');
    return { success: true, message: 'Status updated.' };
  } catch (error) {
    console.error('[service-request-actions] status update failed:', error);
    return { success: false, message: 'Failed to update status.' };
  }
}

export async function updateServiceRequestNotesAction(
  id: string,
  adminNotes: string
): Promise<{ success: boolean; message: string }> {
  await requireRole('admin');
  try {
    await updateServiceRequest(id, { adminNotes });
    revalidatePath('/admin/requests');
    return { success: true, message: 'Notes saved.' };
  } catch (error) {
    console.error('[service-request-actions] notes update failed:', error);
    return { success: false, message: 'Failed to save notes.' };
  }
}
