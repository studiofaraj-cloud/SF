'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const TechTabsMobile = dynamic(
  () => import('./tech-tabs-mobile').then(mod => ({ default: mod.TechTabsMobile })),
  { ssr: false }
);

type Category = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badges: string[];
};

interface TechSectionMobileProps {
  categories: Category[];
}

export function TechSectionMobile({ categories }: TechSectionMobileProps) {
  return <TechTabsMobile categories={categories} />;
}
