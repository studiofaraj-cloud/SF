'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSubscribersAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Search, Mail, Calendar, Sparkles } from 'lucide-react';
import GradientText from '@/components/GradientText';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const data = await getSubscribersAction();
      setSubscribers(data as Subscriber[]);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    if (!searchQuery) return subscribers;
    const query = searchQuery.toLowerCase();
    return subscribers.filter(s => s.email.toLowerCase().includes(query));
  }, [subscribers, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Email', 'Data Iscrizione'];
    const rows = subscribers.map(s => {
      // Handle both createdAt and subscribedAt fields, and Firestore Timestamps
      const dateValue = (s as any).subscribedAt || s.createdAt;
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
      const formattedDate = isValidDate
        ? date.toLocaleDateString('it-IT')
        : 'Data non disponibile';
      
      return [s.email, formattedDate];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <GradientText
                colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                animationSpeed={4}
                className="text-2xl md:text-3xl font-bold"
              >
                Iscritti Newsletter
              </GradientText>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Gestisci la lista degli iscritti alla newsletter
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-primary/50 hover:bg-primary/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta CSV
          </Button>
        </div>

        {/* Stats Card */}
        <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs md:text-sm text-muted-foreground mb-1">Totale Iscritti</div>
                <div className="text-2xl md:text-3xl font-bold text-primary">{subscribers.length}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/50 border-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Subscribers List */}
      {filteredSubscribers.length === 0 ? (
        <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Nessun iscritto corrisponde alla ricerca.'
                : 'Nessun iscritto alla newsletter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredSubscribers.map((subscriber) => {
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

            const formattedDate = isValidDate
              ? date.toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Data non disponibile';

            return (
              <Card
                key={subscriber.id}
                className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30 flex-shrink-0">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                          {subscriber.email}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{timeAgo}</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
