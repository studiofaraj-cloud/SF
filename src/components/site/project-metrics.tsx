'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string;
}

interface ProjectMetricsProps {
  metrics: Metric[];
  className?: string;
}

const METRIC_ICONS = {
  'traffic': TrendingUp,
  'users': Users,
  'performance': Zap,
  'conversion': Target,
};

const getMetricIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('traffic') || lowerLabel.includes('visite')) {
    return TrendingUp;
  }
  if (lowerLabel.includes('user') || lowerLabel.includes('utente')) {
    return Users;
  }
  if (lowerLabel.includes('performance') || lowerLabel.includes('velocità') || lowerLabel.includes('speed')) {
    return Zap;
  }
  if (lowerLabel.includes('conversion') || lowerLabel.includes('conversione')) {
    return Target;
  }
  return TrendingUp;
};

export function ProjectMetrics({ metrics, className }: ProjectMetricsProps) {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {metrics.map((metric, index) => {
        const Icon = getMetricIcon(metric.label);
        return (
          <Card
            key={index}
            className="holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/20"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-2">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
