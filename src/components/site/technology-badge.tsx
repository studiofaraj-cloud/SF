'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TechnologyBadgeProps {
  technology: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TECHNOLOGY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Frontend
  'React': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Next.js': { bg: 'bg-black/20 dark:bg-white/20', text: 'text-foreground', border: 'border-border' },
  'Vue.js': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  'Angular': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  'Svelte': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  // Languages
  'TypeScript': { bg: 'bg-blue-600/20', text: 'text-blue-500', border: 'border-blue-600/30' },
  'JavaScript': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  // Backend
  'Node.js': { bg: 'bg-green-600/20', text: 'text-green-500', border: 'border-green-600/30' },
  'Python': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'PHP': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  'Java': { bg: 'bg-orange-600/20', text: 'text-orange-500', border: 'border-orange-600/30' },
  '.NET': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  // Databases
  'PostgreSQL': { bg: 'bg-blue-700/20', text: 'text-blue-600', border: 'border-blue-700/30' },
  'MongoDB': { bg: 'bg-green-600/20', text: 'text-green-500', border: 'border-green-600/30' },
  'MySQL': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Firebase': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  // Cloud
  'AWS': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'Vercel': { bg: 'bg-black/20 dark:bg-white/20', text: 'text-foreground', border: 'border-border' },
  'Netlify': { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
  'Azure': { bg: 'bg-blue-600/20', text: 'text-blue-500', border: 'border-blue-600/30' },
  'GCP': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  // Tools
  'Tailwind CSS': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Docker': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'GraphQL': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  'REST API': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function TechnologyBadge({ technology, className, size = 'md' }: TechnologyBadgeProps) {
  const colors = TECHNOLOGY_COLORS[technology] || {
    bg: 'bg-primary/20',
    text: 'text-primary',
    border: 'border-primary/30',
  };

  return (
    <Badge
      className={cn(
        'badge-futuristic border',
        colors.bg,
        colors.text,
        colors.border,
        SIZE_CLASSES[size],
        className
      )}
    >
      {technology}
    </Badge>
  );
}
