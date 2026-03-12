'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getMessagesAction, markMessageAsReadAction, markMessageAsUnreadAction, deleteMessageAction } from '@/lib/actions';
import { MessageDetail } from '@/components/admin/message-detail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, Filter, Mail, DollarSign, Tag, Eye, Trash2, CheckCircle, Circle, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import GradientText from '@/components/GradientText';

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
  budget?: string;
  source?: 'contact-form' | 'quote-dialog';
  createdAt: string;
  read: boolean;
};

type FilterType = 'all' | 'unread' | 'quote-dialog' | 'contact-form';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMessagesAction();
      setMessages(data as Message[]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile caricare i messaggi.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markMessageAsReadAction(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      toast({
        title: 'Successo',
        description: 'Messaggio segnato come letto.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile aggiornare il messaggio.',
      });
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      await markMessageAsUnreadAction(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: false } : m));
      toast({
        title: 'Successo',
        description: 'Messaggio segnato come non letto.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile aggiornare il messaggio.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessageAction(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({
        title: 'Successo',
        description: 'Messaggio eliminato.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Impossibile eliminare il messaggio.',
      });
    }
  };

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(m => !m.read);
    } else if (filter === 'quote-dialog') {
      filtered = filtered.filter(m => m.source === 'quote-dialog');
    } else if (filter === 'contact-form') {
      filtered = filtered.filter(m => m.source === 'contact-form');
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.message.toLowerCase().includes(query) ||
        m.service?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [messages, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter(m => !m.read).length;
    const quoteRequests = messages.filter(m => m.source === 'quote-dialog').length;
    const contactForms = messages.filter(m => m.source === 'contact-form').length;
    return { total, unread, quoteRequests, contactForms };
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
            <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <GradientText
              colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
              animationSpeed={4}
              className="text-2xl md:text-3xl font-bold"
            >
              Messaggi
            </GradientText>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Gestisci tutti i messaggi ricevuti dai form di contatto e richieste preventivo
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
            <CardContent className="p-4">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Totali</div>
              <div className="text-xl md:text-2xl font-bold text-primary">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
            <CardContent className="p-4">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Non letti</div>
              <div className="text-xl md:text-2xl font-bold text-primary">{stats.unread}</div>
            </CardContent>
          </Card>
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
            <CardContent className="p-4">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Preventivi</div>
              <div className="text-xl md:text-2xl font-bold text-primary">{stats.quoteRequests}</div>
            </CardContent>
          </Card>
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
            <CardContent className="p-4">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Contatti</div>
              <div className="text-xl md:text-2xl font-bold text-primary">{stats.contactForms}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome, email, messaggio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/50 border-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-primary' : ''}
            >
              Tutti
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-primary' : ''}
            >
              Non letti
            </Button>
            <Button
              variant={filter === 'quote-dialog' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('quote-dialog')}
              className={filter === 'quote-dialog' ? 'bg-primary' : ''}
            >
              Preventivi
            </Button>
            <Button
              variant={filter === 'contact-form' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('contact-form')}
              className={filter === 'contact-form' ? 'bg-primary' : ''}
            >
              Contatti
            </Button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all'
                ? 'Nessun messaggio corrisponde ai filtri selezionati.'
                : 'Nessun messaggio ricevuto.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {filteredMessages.map((message) => {
            const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: it,
            });

            return (
              <Card
                key={message.id}
                className={`holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 cursor-pointer ${
                  !message.read ? 'ring-2 ring-primary/30' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(message);
                  setDetailOpen(true);
                  if (!message.read) {
                    handleMarkAsRead(message.id);
                  }
                }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-2">
                        {!message.read && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                        <h3 className="font-semibold text-foreground text-sm md:text-base truncate">
                          {message.name}
                        </h3>
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
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a
                          href={`mailto:${message.email}`}
                          className="text-xs md:text-sm text-primary hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {message.email}
                        </a>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                        {message.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {message.service && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            <span>{message.service}</span>
                          </div>
                        )}
                        {message.budget && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>{message.budget}</span>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {timeAgo}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMessage(message);
                          setDetailOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          message.read
                            ? handleMarkAsUnread(message.id)
                            : handleMarkAsRead(message.id)
                        }
                        className="h-8 w-8"
                      >
                        {message.read ? (
                          <Circle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Sei sicuro di voler eliminare questo messaggio?')) {
                            handleDelete(message.id);
                          }
                        }}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Message Detail Dialog */}
      <MessageDetail
        message={selectedMessage}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnread={handleMarkAsUnread}
        onDelete={handleDelete}
      />
    </>
  );
}
