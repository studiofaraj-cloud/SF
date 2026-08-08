import React, { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  /**
   * Wrapper element. Defaults to 'div'; pass 'span' when nesting inside a
   * heading — <h1> only accepts phrasing content, so a div child is invalid
   * markup. Used by the service pages, whose headline is one <h1> split across
   * a gradient line and a plain line.
   */
  as?: 'div' | 'span';
}

export default function GradientText({
  children,
  className = '',
  colors = ['#ffaa40', '#9c40ff', '#ffaa40'],
  animationSpeed = 8,
  as: Wrapper = 'div',
}: GradientTextProps) {
  const Inner = Wrapper === 'span' ? 'span' : 'div';
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`
  };

  return (
    <Wrapper
      className={`relative mx-auto flex max-w-fit flex-row items-center justify-center font-medium overflow-hidden ${className}`}
      suppressHydrationWarning
    >
      <Inner
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
      </Inner>
    </Wrapper>
  );
}
