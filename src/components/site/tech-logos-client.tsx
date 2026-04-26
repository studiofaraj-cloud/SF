'use client';

import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiVercel, SiFirebase, SiNodedotjs, SiHtml5, SiCss3, SiJavascript, SiPython, SiDocker } from '@/components/site/tech-icons';
import { LogoLoop, type LogoItem } from '@/components/LogoLoop';

export default function TechLogosClient() {
  // Logos render as plain badges (no href) — outbound links to vendor sites
  // would bleed link equity and inflate the external-link count for SEO.
  const techLogos: LogoItem[] = [
    { node: <SiReact size={32} />, title: "React" },
    { node: <SiNextdotjs size={32} />, title: "Next.js" },
    { node: <SiTypescript size={32} />, title: "TypeScript" },
    { node: <SiJavascript size={32} />, title: "JavaScript" },
    { node: <SiTailwindcss size={32} />, title: "Tailwind CSS" },
    { node: <SiHtml5 size={32} />, title: "HTML5" },
    { node: <SiCss3 size={32} />, title: "CSS3" },
    { node: <SiNodedotjs size={32} />, title: "Node.js" },
    { node: <SiPython size={32} />, title: "Python" },
    { node: <SiDocker size={32} />, title: "Docker" },
    { node: <SiVercel size={32} />, title: "Vercel" },
    { node: <SiFirebase size={32} />, title: "Firebase" },
  ];

  return (
    <LogoLoop
      logos={techLogos}
      speed={120}
      direction="left"
      logoHeight={56}
      gap={60}
      hoverSpeed={0}
      scaleOnHover
      fadeOut
      fadeOutColor="var(--background)"
      ariaLabel="Technology stack"
    />
  );
}
