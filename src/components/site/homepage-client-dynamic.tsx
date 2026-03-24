'use client';

import dynamic from 'next/dynamic';
import type { HeroSlide } from '@/lib/definitions';

const HomepageClient = dynamic(
  () => import('@/components/site/homepage-client'),
  { ssr: false, loading: () => <div className="min-h-screen" /> }
);

export default function HomepageClientDynamic({ heroSlides }: { heroSlides?: HeroSlide[] }) {
  return <HomepageClient heroSlides={heroSlides} />;
}
