'use client';

import { useState, useEffect } from 'react';
import { FileText, FolderKanban, MessageSquare, Users, ArrowRight, Sparkles, Plus, Eye, Mail, Calendar, Clock } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { getDashboardStatsAction, getMessagesAction, getSubscribersAction, getBookingsAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import GradientText from '@/components/GradientText';
import { formatDistanceToNow, format } from 'date-fns';
import { it } from 'date-fns/locale';

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
  source?: 'contact-form' | 'quote-dialog';
  createdAt: string;
  read: boolean;
};

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalBlogs: 0, totalProjects: 0, totalMessages: 0, totalSubscribers: 0, totalBookings: 0 });
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, messagesData, subscribersData, bookingsData] = await Promise.all([
        getDashboardStatsAction(),
        getMessagesAction({ limitCount: 5 }),
        getSubscribersAction(),
        getBookingsAction({ limitCount: 5 }),
      ]);
      
      setStats(statsData);
      setRecentMessages((messagesData as Message[]).slice(0, 5));
      setRecentSubscribers((subscribersData as Subscriber[]).slice(0, 5));
      setRecentBookings((bookingsData as any[]).slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
    <>
      {/* Hero Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <GradientText
              colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
              animationSpeed={4}
              className="text-2xl md:text-3xl font-bold"
            >
              Benvenuto!
            </GradientText>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Panoramica della tua dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5 mb-6 md:mb-8">
        <StatCard
          title="Blog Totali"
          value={stats.totalBlogs}
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Progetti Totali"
          value={stats.totalProjects}
          icon={<FolderKanban className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Messaggi Totali"
          value={stats.totalMessages}
          icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Iscritti"
          value={stats.totalSubscribers}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          title="Prenotazioni"
          value={stats.totalBookings}
          icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Recent Activity - Messages */}
        <Card className="xl:col-span-2 holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Attività Recente - Messaggi
                </CardTitle>
                <CardDescription>
                  Ultimi messaggi ricevuti dai form di contatto
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/messages">
                  Vedi tutti
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessun messaggio recente.
              </p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((message) => {
                  // Handle Firestore Timestamps and validate date
                  let date: Date;
                  
                  if (!message.createdAt) {
                    date = new Date(); // Fallback to current date if no date available
                  } else if (message.createdAt?.toDate && typeof message.createdAt.toDate === 'function') {
                    // Handle Firestore Timestamp
                    date = message.createdAt.toDate();
                  } else if (typeof message.createdAt === 'string' || typeof message.createdAt === 'number') {
                    date = new Date(message.createdAt);
                  } else {
                    date = new Date(); // Fallback to current date
                  }
                  
                  // Validate the date
                  const isValidDate = !isNaN(date.getTime());
                  const timeAgo = isValidDate 
                    ? formatDistanceToNow(date, {
                        addSuffix: true,
                        locale: it,
                      })
                    : 'Data non disponibile';

                  return (
                    <div
                      key={message.id}
                      className={`holographic-card rounded-lg p-3 md:p-4 bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-300 hover:border-primary/50 hover:shadow-lg ${
                        !message.read ? 'ring-2 ring-primary/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!message.read && (
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                            <span className="font-semibold text-sm text-foreground truncate">
                              {message.name}
                            </span>
                            <Badge
                              variant={message.source === 'quote-dialog' ? 'default' : 'secondary'}
                              className={`text-xs ${
                                message.source === 'quote-dialog'
                                  ? 'bg-primary/20 text-primary border-primary/30'
                                  : ''
                              }`}
                            >
                              {message.source === 'quote-dialog' ? 'Preventivo' : 'Contatto'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1 truncate">
                            {message.email}
                          </p>
                          <p className="text-xs text-foreground line-clamp-2 mb-2">
                            {message.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{timeAgo}</span>
                            {message.service && (
                              <>
                                <span>•</span>
                                <span>{message.service}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" asChild>
                          <Link href="/admin/messages">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Azioni Rapide
            </CardTitle>
            <CardDescription>Accesso rapido alle funzioni comuni</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/admin/blogs/create">
                <Plus className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Crea Nuovo Blog</div>
                  <div className="text-xs text-muted-foreground">Aggiungi un nuovo articolo</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/admin/projects/create">
                <Plus className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Aggiungi Progetto</div>
                  <div className="text-xs text-muted-foreground">Crea un nuovo progetto</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/admin/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Visualizza Messaggi</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.totalMessages} messaggi totali
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/admin/subscribers">
                <Users className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Iscritti Newsletter</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.totalSubscribers} iscritti
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/admin/bookings">
                <Calendar className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Prenotazioni</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.totalBookings} prenotazioni
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="xl:col-span-3 holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Prenotazioni Recenti
                </CardTitle>
                <CardDescription>
                  Ultime prenotazioni di chiamate
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/bookings">
                  Vedi tutte
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessuna prenotazione recente.
              </p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking: any) => {
                  const selectedDate = booking.selectedDate?.toDate 
                    ? booking.selectedDate.toDate() 
                    : booking.selectedDate 
                    ? new Date(booking.selectedDate) 
                    : null;
                  const isValidDate = selectedDate && !isNaN(selectedDate.getTime());
                  const formattedDate = isValidDate 
                    ? format(selectedDate, "dd MMM yyyy", { locale: it })
                    : 'Data non disponibile';

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'confirmed':
                        return 'bg-green-500/10 text-green-600 border-green-500/20';
                      case 'cancelled':
                        return 'bg-red-500/10 text-red-600 border-red-500/20';
                      default:
                        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
                    }
                  };

                  return (
                    <div
                      key={booking.id}
                      className="holographic-card rounded-lg p-4 bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-300 hover:border-primary/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">
                              {booking.name}
                            </p>
                            <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                              {booking.status === 'confirmed' ? 'Confermata' : 
                               booking.status === 'cancelled' ? 'Cancellata' : 'In Attesa'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{booking.email}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formattedDate}
                            </span>
                            {booking.selectedTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Array.isArray(booking.selectedTime) 
                                  ? booking.selectedTime.length === 1 && booking.selectedTime[0] === 'anytime'
                                    ? 'Qualsiasi orario'
                                    : booking.selectedTime.join(', ')
                                  : booking.selectedTime === 'anytime'
                                    ? 'Qualsiasi orario'
                                    : booking.selectedTime
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card className="xl:col-span-3 holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Iscritti Recenti
                </CardTitle>
                <CardDescription>
                  Ultimi iscritti alla newsletter
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/subscribers">
                  Vedi tutti
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentSubscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessun iscritto recente.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentSubscribers.map((subscriber) => {
                  // Handle both createdAt and subscribedAt fields, and Firestore Timestamps
                  const dateValue = (subscriber as any).subscribedAt || subscriber.createdAt;
                  let date: Date;
                  
                  if (!dateValue) {
                    date = new Date(); // Fallback to current date if no date available
                  } else if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
                    // Handle Firestore Timestamp
                    date = dateValue.toDate();
                  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
                    date = new Date(dateValue);
                  } else {
                    date = new Date(); // Fallback to current date
                  }
                  
                  // Validate the date
                  const isValidDate = !isNaN(date.getTime());
                  const timeAgo = isValidDate 
                    ? formatDistanceToNow(date, {
                        addSuffix: true,
                        locale: it,
                      })
                    : 'Data non disponibile';

                  return (
                    <div
                      key={subscriber.id}
                      className="holographic-card rounded-lg p-3 bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-300 hover:border-primary/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {subscriber.email}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
