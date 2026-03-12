'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export function MenuParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    // Optimize canvas rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resizeCanvas();
    
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    // Determine particle count based on screen size and performance
    const isMobile = window.innerWidth < 768;
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const particleCount = isMobile 
      ? (isLowEndDevice ? 20 : 30)
      : 50;

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
      vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
      size: Math.random() * (isMobile ? 1.5 : 2) + 1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 60 + 180, // Blue-cyan range
    }));

    // Optimized animation loop with performance checks
    let lastTime = performance.now();
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      // Throttle animation for mobile
      if (deltaTime < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTime = currentTime - (deltaTime % frameInterval);

      // Use transform for better performance
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const maxConnectionDistance = isMobile ? 80 : 100;

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Draw particle with optimized rendering
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
        ctx.fill();
      });

      // Optimized connection drawing - only draw if on screen
      if (!isMobile || particleCount <= 25) {
        particlesRef.current.forEach((particle, i) => {
          particlesRef.current.slice(i + 1).forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distanceSq = dx * dx + dy * dy;

            // Use squared distance to avoid sqrt calculation
            if (distanceSq < maxConnectionDistance * maxConnectionDistance) {
              const distance = Math.sqrt(distanceSq);
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `hsla(200, 70%, 60%, ${0.2 * (1 - distance / maxConnectionDistance)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Fade in animation
    setIsVisible(true);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 transition-opacity duration-400 pointer-events-none"
      style={{ opacity: isVisible ? 0.2 : 0, zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
