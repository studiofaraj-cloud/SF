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
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {allItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" aria-hidden="true" />
              )}
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center hover:text-primary transition-colors"
                  aria-label="Home"
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : index === allItems.length - 1 ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
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
