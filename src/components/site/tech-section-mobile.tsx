'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const TechTabsMobile = dynamic(
  () => import('./tech-tabs-mobile'),
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
  if (!categories?.length) return null;

  return <TechTabsMobile categories={categories} />;
}
