import type { ServiceRequestStatus } from '@/lib/firestore-data';

export const SERVICE_REQUEST_STATUS_ORDER: ServiceRequestStatus[] = [
  'new',
  'quoted',
  'accepted',
  'in_progress',
  'delivered',
  'closed',
];

interface StatusMeta {
  it: string;
  en: string;
  badge: string;
}

export const SERVICE_REQUEST_STATUS_META: Record<ServiceRequestStatus, StatusMeta> = {
  new: { it: 'Nuova', en: 'New', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  quoted: { it: 'Preventivo inviato', en: 'Quoted', badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  accepted: { it: 'Accettata', en: 'Accepted', badge: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  in_progress: { it: 'In lavorazione', en: 'In progress', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  delivered: { it: 'Consegnata', en: 'Delivered', badge: 'bg-green-500/10 text-green-600 border-green-500/20' },
  closed: { it: 'Chiusa', en: 'Closed', badge: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  cancelled: { it: 'Annullata', en: 'Cancelled', badge: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export function statusLabel(status: ServiceRequestStatus, locale: string): string {
  const meta = SERVICE_REQUEST_STATUS_META[status];
  if (!meta) return status;
  return locale === 'en' ? meta.en : meta.it;
}

export function statusBadgeClass(status: ServiceRequestStatus): string {
  return SERVICE_REQUEST_STATUS_META[status]?.badge ?? '';
}

export const ALL_STATUSES: ServiceRequestStatus[] = [
  ...SERVICE_REQUEST_STATUS_ORDER,
  'cancelled',
];
