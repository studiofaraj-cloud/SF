'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Plus,
  Pencil,
  ExternalLink,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  adminListCompanyProfilesAction,
  adminDeleteCompanyProfileAction,
  adminSetPublishedAction,
} from '@/lib/company-profile-actions';
import type { AdminCompanyProfileSummary } from '@/lib/company-profile-schemas';

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const map: Record<string, { label: string; cls: string }> = {
    trialing: { label: 'Trial', cls: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
    active: { label: 'Attivo', cls: 'bg-green-500/15 text-green-600 border-green-500/30' },
    past_due: { label: 'Past due', cls: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
    canceled: { label: 'Cancellato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    unpaid: { label: 'Non pagato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    incomplete: { label: 'Incompleto', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const v = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

export default function AdminCompanyProfilesPage() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<AdminCompanyProfileSummary[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = async () => {
    setProfiles(await adminListCompanyProfilesAction());
  };

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  const onTogglePublish = async (id: string, next: boolean) => {
    setBusyId(id);
    const r = await adminSetPublishedAction(id, next);
    setBusyId(null);
    if (!r.success) toast({ variant: 'destructive', title: 'Errore', description: r.error });
    else await reload();
  };

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminare definitivamente "${name}"?`)) return;
    setBusyId(id);
    const r = await adminDeleteCompanyProfileAction(id);
    setBusyId(null);
    if (!r.success) toast({ variant: 'destructive', title: 'Errore', description: r.error });
    else await reload();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            Pagine aziendali
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea e gestisci illimitate pagine pubbliche /&lt;slug&gt;. Le pagine
            create da admin sono pubblicate immediatamente senza abbonamento.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/company-profiles/new">
            <Plus className="mr-1 h-4 w-4" />
            Nuova pagina
          </Link>
        </Button>
      </div>

      {profiles === null ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Nessuna pagina ancora. Clicca "Nuova pagina" per crearne una.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center gap-4 py-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{p.companyName}</h3>
                    {p.adminManaged ? (
                      <Badge
                        variant="outline"
                        className="border-purple-500/30 bg-purple-500/15 text-purple-600"
                      >
                        Admin-managed
                      </Badge>
                    ) : (
                      <Badge variant="outline">Cliente</Badge>
                    )}
                    {p.isPublished ? (
                      <Badge
                        variant="outline"
                        className="border-green-500/30 bg-green-500/15 text-green-600"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Pubblicata
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <XCircle className="mr-1 h-3 w-3" />
                        Bozza
                      </Badge>
                    )}
                    {!p.adminManaged && <StatusBadge status={p.subscriptionStatus} />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.slug ? (
                      <span>
                        studiofaraj.it/<strong className="text-foreground">{p.slug}</strong>
                      </span>
                    ) : (
                      <span className="italic">nessuno slug</span>
                    )}
                    {p.ownerEmail && <span> — proprietario: {p.ownerEmail}</span>}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {p.slug && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/${p.slug}?preview=1`} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        Anteprima
                      </Link>
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/company-profiles/${p.id}/edit`}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Modifica
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === p.id}
                    onClick={() => onTogglePublish(p.id, !p.isPublished)}
                  >
                    {p.isPublished ? 'Nascondi' : 'Pubblica'}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Elimina"
                    disabled={busyId === p.id}
                    onClick={() => onDelete(p.id, p.companyName)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
