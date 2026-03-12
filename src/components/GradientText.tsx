import React, { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#ffaa40', '#9c40ff', '#ffaa40'],
  animationSpeed = 8,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`
  };

  return (
    <div
      className={`relative mx-auto flex max-w-fit flex-row items-center justify-center font-medium overflow-hidden ${className}`}
      suppressHydrationWarning
    >
      <div
        className="inline-block relative text-transparent bg-cover bg-clip-text animate-gradient"
        style={{
          ...gradientStyle,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          backgroundSize: '300% 100%'
        }}
        suppressHydrationWarning
      >
        {children}
      </div>
    </div>
  );
}
