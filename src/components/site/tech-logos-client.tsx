'use client';

import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiVercel, SiFirebase, SiNodedotjs, SiHtml5, SiCss3, SiJavascript, SiPython, SiDocker } from 'react-icons/si';
import { LogoLoop, type LogoItem } from '@/components/LogoLoop';

export default function TechLogosClient() {
  const techLogos: LogoItem[] = [
    { node: <SiReact size={32} />, title: "React", href: "https://react.dev" },
    { node: <SiNextdotjs size={32} />, title: "Next.js", href: "https://nextjs.org" },
    { node: <SiTypescript size={32} />, title: "TypeScript", href: "https://www.typescriptlang.org" },
    { node: <SiJavascript size={32} />, title: "JavaScript", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { node: <SiTailwindcss size={32} />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
    { node: <SiHtml5 size={32} />, title: "HTML5", href: "https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5" },
    { node: <SiCss3 size={32} />, title: "CSS3", href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS3" },
    { node: <SiNodedotjs size={32} />, title: "Node.js", href: "https://nodejs.org" },
    { node: <SiPython size={32} />, title: "Python", href: "https://python.org" },
    { node: <SiDocker size={32} />, title: "Docker", href: "https://www.docker.com" },
    { node: <SiVercel size={32} />, title: "Vercel", href: "https://vercel.com" },
    { node: <SiFirebase size={32} />, title: "Firebase", href: "https://firebase.google.com" },
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
