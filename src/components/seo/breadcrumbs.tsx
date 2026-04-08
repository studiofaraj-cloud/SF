'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { StructuredData } from './structured-data';
import { generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [
    { label: 'Home', href: '/' },
    ...items,
  ];

  const structuredData = generateStructuredDataBreadcrumbList(
    allItems.map(item => ({
      name: item.label,
      url: `${siteConfig.url}${item.href}`,
    }))
  );

  return (
    <>
      <StructuredData data={structuredData} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-row flex-nowrap items-center text-sm text-muted-foreground overflow-hidden">
          {allItems.map((item, index) => (
            <li key={item.href} className="flex items-center min-w-0 shrink">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1.5 sm:mx-2 text-muted-foreground shrink-0" aria-hidden="true" />
              )}
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center hover:text-primary transition-colors shrink-0"
                  aria-label="Home"
                >
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              ) : index === allItems.length - 1 ? (
                <span className="text-foreground font-medium truncate" aria-current="page" title={item.label}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors truncate"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
