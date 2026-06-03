'use client';

import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiVercel,
  SiFirebase,
  SiNodedotjs,
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiPython,
  SiDocker,
} from '@/components/site/tech-icons';

/**
 * Pure-CSS infinite marquee of tech logos. Replaces the previous LogoLoop
 * component (~450 lines of JS + ResizeObserver + rAF loop) with a CSS
 * keyframe animation reusing the existing `.marquee-track` utility from
 * globals.css. Same visual behavior (scroll left, pause on hover, scale on
 * hover, faded edges), zero JS on this section.
 */
const TECH_LOGOS = [
  { node: <SiReact size={32} />,        title: 'React' },
  { node: <SiNextdotjs size={32} />,    title: 'Next.js' },
  { node: <SiTypescript size={32} />,   title: 'TypeScript' },
  { node: <SiJavascript size={32} />,   title: 'JavaScript' },
  { node: <SiTailwindcss size={32} />,  title: 'Tailwind CSS' },
  { node: <SiHtml5 size={32} />,        title: 'HTML5' },
  { node: <SiCss3 size={32} />,         title: 'CSS3' },
  { node: <SiNodedotjs size={32} />,    title: 'Node.js' },
  { node: <SiPython size={32} />,       title: 'Python' },
  { node: <SiDocker size={32} />,       title: 'Docker' },
  { node: <SiVercel size={32} />,       title: 'Vercel' },
  { node: <SiFirebase size={32} />,     title: 'Firebase' },
];

export default function TechLogosClient() {
  return (
    <div className="relative w-full overflow-hidden" aria-label="Technology stack">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-32 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-32 z-10 bg-gradient-to-l from-background to-transparent" />

      {/* Marquee track — content duplicated so the -50% translate loops seamlessly.
          Duration tuned so logos pass at roughly the same speed as the old JS impl. */}
      <div
        className="marquee-track flex w-max items-center py-4"
        style={
          {
            '--marquee-duration': '40s',
            gap: '60px',
          } as React.CSSProperties
        }
      >
        {TECH_LOGOS.map((logo, i) => (
          <LogoBadge key={`a-${i}`} title={logo.title}>
            {logo.node}
          </LogoBadge>
        ))}
        {/* Duplicate set — hidden from a11y / SEO since it's purely visual */}
        <div aria-hidden="true" className="contents">
          {TECH_LOGOS.map((logo, i) => (
            <LogoBadge key={`b-${i}`} title={logo.title}>
              {logo.node}
            </LogoBadge>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoBadge({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div
      className="flex h-14 items-center justify-center text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-foreground"
      title={title}
    >
      {children}
    </div>
  );
}
