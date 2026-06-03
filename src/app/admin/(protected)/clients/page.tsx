'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { listUsersAction, setUserRoleAction } from '@/lib/auth-actions';
import type { UserProfile, UserRole } from '@/lib/firestore-data';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Mail, Loader2, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminClientsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listUsersAction();
      setUsers(data);
    } catch {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile caricare gli utenti.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async (uid: string, role: UserRole) => {
    const prev = users;
    setUsers((us) => us.map((u) => (u.uid === uid ? { ...u, role } : u)));
    try {
      await setUserRoleAction(uid, role);
      toast({ title: 'Aggiornato', description: 'Ruolo aggiornato.' });
    } catch {
      setUsers(prev);
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile aggiornare il ruolo.' });
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.displayName ?? '').toLowerCase().includes(q) ||
        (u.company ?? '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Clienti
        </h1>
        <p className="text-muted-foreground mt-1">Gestisci gli account e i ruoli degli utenti</p>
      </div>

      <Card className="holographic-card neon-border">
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome, email o azienda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="holographic-card neon-border">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Nessun utente trovato.' : 'Nessun utente registrato ancora.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <Card key={u.uid} className="holographic-card neon-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.displayName || u.email}</p>
                    <a
                      href={`mailto:${u.email}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary truncate"
                    >
                      <Mail className="h-3 w-3 shrink-0" />
                      {u.email}
                    </a>
                  </div>
                  {u.role === 'admin' && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>

                {u.company && <p className="text-xs text-muted-foreground">{u.company}</p>}

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Ruolo:</span>
                  <Select value={u.role} onValueChange={(v) => handleRoleChange(u.uid, v as UserRole)}>
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Link
                  href={`/admin/clients/${u.uid}`}
                  className="mt-2 -mx-4 -mb-4 flex items-center justify-between border-t border-border/40 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  Vedi dettagli completi
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
