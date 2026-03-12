'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getBookingsAction, updateBookingStatusAction, deleteBookingAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, Mail, Phone, Clock, Trash2, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';

type Booking = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  selectedDate: string;
  selectedTime?: string | string[];
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  source?: string;
};

type FilterType = 'all' | 'pending' | 'confirmed' | 'cancelled';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();
  const router = useRouter();

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookingsAction();
      setBookings(data as Booking[]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile caricare le prenotazioni.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusUpdate = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await updateBookingStatusAction(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast({
        title: 'Successo',
        description: 'Stato prenotazione aggiornato.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
      return;
    }

    try {
      await deleteBookingAction(id);
      setBookings(prev => prev.filter(b => b.id !== id));
      toast({
        title: 'Successo',
        description: 'Prenotazione eliminata.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile eliminare la prenotazione.',
      });
    }
  };

  const getValidDate = (dateInput: any) => {
    let date;
    if (dateInput instanceof Timestamp) {
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else {
      date = new Date(dateInput);
    }
    return isValid(date) ? date : null;
  };

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.status === filter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        (b.phone && b.phone.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [bookings, filter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefono', 'Data', 'Orario', 'Stato', 'Data Creazione'];
    const rows = filteredBookings.map(b => {
      const selectedDate = getValidDate(b.selectedDate);
      const createdAt = getValidDate(b.createdAt);
      return [
        b.name,
        b.email,
        b.phone || '',
        selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: it }) : 'Data non disponibile',
        b.selectedTime || '',
        b.status,
        createdAt ? format(createdAt, 'dd/MM/yyyy HH:mm', { locale: it }) : 'Data non disponibile',
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prenotazioni_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confermata</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancellata</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">In Attesa</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Prenotazioni
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestisci le prenotazioni delle chiamate
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Esporta CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="holographic-card neon-border">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email o telefono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tutte
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                In Attesa
              </Button>
              <Button
                variant={filter === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('confirmed')}
              >
                Confermate
              </Button>
              <Button
                variant={filter === 'cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('cancelled')}
              >
                Cancellate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="holographic-card neon-border">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all' 
                ? 'Nessuna prenotazione trovata con i filtri selezionati.' 
                : 'Nessuna prenotazione ancora.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredBookings.map((booking) => {
            const selectedDate = getValidDate(booking.selectedDate);
            const createdAt = getValidDate(booking.createdAt);
            const timeAgo = createdAt 
              ? formatDistanceToNow(createdAt, { addSuffix: true, locale: it }) 
              : 'Data non disponibile';

            return (
              <Card key={booking.id} className="holographic-card neon-border hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{booking.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <Mail className="h-3 w-3" />
                        {booking.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {booking.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{booking.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {selectedDate 
                        ? format(selectedDate, "PPP", { locale: it })
                        : 'Data non disponibile'}
                    </span>
                  </div>
                  
                  {booking.selectedTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {Array.isArray(booking.selectedTime) 
                          ? booking.selectedTime.length === 1 && booking.selectedTime[0] === 'anytime'
                            ? 'Qualsiasi orario (9:00 - 18:00)'
                            : booking.selectedTime.join(', ')
                          : booking.selectedTime === 'anytime'
                            ? 'Qualsiasi orario (9:00 - 18:00)'
                            : booking.selectedTime
                        }
                      </span>
                    </div>
                  )}
                  
                  {booking.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {booking.message}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    {timeAgo}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-green-600 border-green-500/20 hover:bg-green-500/10"
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Conferma
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-500/20 hover:bg-red-500/10"
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancella
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/10"
                        onClick={() => handleStatusUpdate(booking.id, 'pending')}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        In Attesa
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      onClick={() => handleDelete(booking.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
