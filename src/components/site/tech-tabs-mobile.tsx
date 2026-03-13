'use client';

import { useState } from 'react';
import { Monitor, Server, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TechCategory = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badges: string[];
};

export function TechTabsMobile({ categories }: { categories: TechCategory[] }) {
  const [active, setActive] = useState(0);

  if (!categories?.length) return null;

  return (
    <div className="md:hidden">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-border/30 mb-4">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setActive(i)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all duration-300',
              i === active
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {cat.icon}
            <span className="truncate">{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Active panel */}
      <Card className="holographic-card neon-border overflow-hidden">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {categories[active].description}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories[active].badges.map((badge, i) => (
              <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
