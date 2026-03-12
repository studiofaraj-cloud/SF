import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
};

export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/30 transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <div className="text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold text-primary metric-glow">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
