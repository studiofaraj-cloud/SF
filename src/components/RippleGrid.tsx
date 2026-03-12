
'use client';

import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import { useIsMobile } from '@/hooks/use-mobile';

type Props = {
  enableRainbow?: boolean;
  gridColor?: string;
  rippleIntensity?: number;
  gridSize?: number;
  gridThickness?: number;
  fadeDistance?: number;
  vignetteStrength?: number;
  glowIntensity?: number;
  opacity?: number;
  gridRotation?: number;
  mouseInteraction?: boolean;
  mouseInteractionRadius?: number;
  animationSpeed?: number;
  triggerOnScroll?: boolean;
  animationDuration?: number;
};

const RippleGrid: React.FC<Props> = ({
  enableRainbow = false,
  gridColor = '#ffffff',
  rippleIntensity = 0.05,
  gridSize = 10.0,
  gridThickness = 15.0,
  fadeDistance = 1.5,
  vignetteStrength = 2.0,
  glowIntensity = 0.1,
  opacity = 1.0,
  gridRotation = 0,
  mouseInteraction = true,
  mouseInteractionRadius = 1,
  animationSpeed = 1.0,
  triggerOnScroll = true,
  animationDuration = 2.5
}) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseInfluenceRef = useRef(0);
  const uniformsRef = useRef<any>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);
  const frameSkipCounterRef = useRef<number>(0);
  const isTouchDeviceRef = useRef(false);
  const fallbackTriggeredRef = useRef(false);
  const [hasTriggered, setHasTriggered] = useState(!triggerOnScroll);
  const animationStartTimeRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);

  // Scroll detection with IntersectionObserver
  useEffect(() => {
    if (!triggerOnScroll || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered) {
            isVisibleRef.current = true;
            setHasTriggered(true);
            animationStartTimeRef.current = performance.now();
            // Unobserve after triggering to ensure it only happens once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [triggerOnScroll, hasTriggered]);

  // Desktop WebGL effect - first useEffect (MUST be called before early return)
  useEffect(() => {
    if (isMobile || !containerRef.current) return;

    // Detect touch device
    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
        : [1, 1, 1];
    };

    // Adaptive DPR: 1 on mobile, capped at 2 on desktop
    const adaptiveDpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

    const renderer = new Renderer({
      dpr: adaptiveDpr,
      alpha: true,
      antialias: !isMobile,
      powerPreference: isMobile ? 'low-power' : 'high-performance'
    });
    const gl = renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    containerRef.current.appendChild(gl.canvas);

    // GPU memory monitoring
    const checkGPUMemory = (): boolean => {
      if ('performance' in window && 'memory' in (performance as any)) {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.jsHeapSizeLimit;
        const memoryUsageRatio = usedMemory / totalMemory;
        
        if (memoryUsageRatio > 0.9) {
          console.warn('High memory pressure detected (>90%), triggering fallback');
          return false;
        }
      }

      // Check for software renderer
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (rendererName && rendererName.toLowerCase().includes('swiftshader')) {
          console.warn('Software renderer (SwiftShader) detected, triggering fallback');
          return false;
        }
      }

      return true;
    };

    const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

    const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(t, alpha);
}`;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      enableRainbow: { value: enableRainbow },
      gridColor: { value: hexToRgb(gridColor) },
      rippleIntensity: { value: rippleIntensity },
      gridSize: { value: gridSize },
      gridThickness: { value: gridThickness },
      fadeDistance: { value: fadeDistance },
      vignetteStrength: { value: vignetteStrength },
      glowIntensity: { value: glowIntensity },
      opacity: { value: opacity },
      gridRotation: { value: gridRotation },
      mouseInteraction: { value: mouseInteraction },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: mouseInteractionRadius }
    };

    uniformsRef.current = uniforms;

    const geometry = new Triangle(gl);
    const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      renderer.setSize(w, h);
      uniforms.iResolution.value = [w, h];
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Disable mouse move interaction on touch devices
      if (isTouchDeviceRef.current || !mouseInteraction || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouseRef.current = { x, y };
    };

    const handleMouseEnter = () => {
      if (isTouchDeviceRef.current || !mouseInteraction) return;
      mouseInfluenceRef.current = 1.0;
    };

    const handleMouseLeave = () => {
      if (isTouchDeviceRef.current || !mouseInteraction) return;
      mouseInfluenceRef.current = 0.0;
    };

    window.addEventListener('resize', resize);
    // Only add mouse interaction listeners if not a touch device
    if (mouseInteraction && containerRef.current && !isTouchDeviceRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('mouseenter', handleMouseEnter);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }
    resize();

    // Initial GPU memory check
    if (!checkGPUMemory()) {
      fallbackTriggeredRef.current = true;
    }

    // Periodic GPU memory monitoring (every 5 seconds)
    const memoryCheckInterval = setInterval(() => {
      if (!checkGPUMemory() && !fallbackTriggeredRef.current) {
        fallbackTriggeredRef.current = true;
        console.warn('Fallback to CSS gradients triggered during runtime');
        // In a real scenario, you'd want to trigger a re-render with CSS fallback
      }
    }, 5000);

    let animationFrameId: number;
    const render = (t: number) => {
      // FPS monitoring and frame skipping
      const deltaTime = t - lastFrameTimeRef.current;
      lastFrameTimeRef.current = t;

      frameTimesRef.current.push(deltaTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      const averageFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const fps = 1000 / averageFrameTime;

      // Frame skipping: skip every other frame when FPS drops below 30
      if (fps < 30 && frameSkipCounterRef.current % 2 === 0) {
        frameSkipCounterRef.current++;
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      frameSkipCounterRef.current++;

      // Fallback to CSS if persistent low FPS (below 20 for extended period)
      if (fps < 20 && frameTimesRef.current.length >= 60 && !fallbackTriggeredRef.current) {
        console.warn('Persistent low FPS detected (<20), consider fallback to CSS');
        fallbackTriggeredRef.current = true;
      }

      // Control animation timing based on scroll trigger
      if (triggerOnScroll) {
        if (hasTriggered && animationStartTimeRef.current !== null) {
          const elapsed = (t - animationStartTimeRef.current) * 0.001;
          // Play animation for the duration, then freeze at the end
          if (elapsed < animationDuration) {
            uniforms.iTime.value = elapsed * animationSpeed;
          } else {
            // Freeze at the end of animation (one complete wave cycle)
            uniforms.iTime.value = animationDuration * animationSpeed;
          }
        } else {
          // Not triggered yet, keep at 0
          uniforms.iTime.value = 0;
        }
      } else {
        // Original continuous animation
        uniforms.iTime.value = t * 0.001 * animationSpeed;
      }

      const lerpFactor = 0.1;
      mousePositionRef.current.x += (targetMouseRef.current.x - mousePositionRef.current.x) * lerpFactor;
      mousePositionRef.current.y += (targetMouseRef.current.y - mousePositionRef.current.y) * lerpFactor;

      const currentInfluence = uniforms.mouseInfluence.value;
      const targetInfluence = mouseInfluenceRef.current;
      uniforms.mouseInfluence.value += (targetInfluence - currentInfluence) * 0.05;

      uniforms.mousePosition.value = [mousePositionRef.current.x, mousePositionRef.current.y];

      renderer.render({ scene: mesh });
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryCheckInterval);
      window.removeEventListener('resize', resize);
      if (mouseInteraction && containerRef.current && !isTouchDeviceRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      try {
        renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
        if (containerRef.current && gl.canvas.parentNode === containerRef.current) {
            containerRef.current.removeChild(gl.canvas);
        }
      } catch (e) {
          console.error("Error during cleanup:", e);
      }
    };
  }, [isMobile, animationSpeed, triggerOnScroll, hasTriggered, animationDuration]);

  // Update uniforms effect - runs in second useEffect
  useEffect(() => {
    if (isMobile || !uniformsRef.current) return;

    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
        : [1, 1, 1];
    };

    uniformsRef.current.enableRainbow.value = enableRainbow;
    uniformsRef.current.gridColor.value = hexToRgb(gridColor);
    uniformsRef.current.rippleIntensity.value = rippleIntensity;
    uniformsRef.current.gridSize.value = gridSize;
    uniformsRef.current.gridThickness.value = gridThickness;
    uniformsRef.current.fadeDistance.value = fadeDistance;
    uniformsRef.current.vignetteStrength.value = vignetteStrength;
    uniformsRef.current.glowIntensity.value = glowIntensity;
    uniformsRef.current.opacity.value = opacity;
    uniformsRef.current.gridRotation.value = gridRotation;
    uniformsRef.current.mouseInteraction.value = mouseInteraction;
    uniformsRef.current.mouseInteractionRadius.value = mouseInteractionRadius;
  }, [
    isMobile,
    enableRainbow,
    gridColor,
    rippleIntensity,
    gridSize,
    gridThickness,
    fadeDistance,
    vignetteStrength,
    glowIntensity,
    opacity,
    gridRotation,
    mouseInteraction,
    mouseInteractionRadius
  ]);

  // On mobile, return lightweight CSS gradient fallback (AFTER all hooks)
  if (isMobile) {
    const hexToRgb = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `${r}, ${g}, ${b}`;
      }
      return '255, 255, 255';
    };

    const rgbColor = hexToRgb(gridColor);
    const opacityValue = opacity * 0.3; // Reduced opacity for mobile
    
    // Determine animation style based on scroll trigger state
    let animationStyle: string | undefined;
    let transformStyle: string | undefined;
    
    if (triggerOnScroll) {
      if (hasTriggered) {
        // Animation triggered, play once
        animationStyle = `mobile-gradient-shift-once ${animationDuration}s ease-out forwards`;
      } else {
        // Not triggered yet, no animation
        animationStyle = undefined;
        transformStyle = 'translateX(-50%)';
      }
    } else {
      // Continuous animation (original behavior)
      animationStyle = `mobile-gradient-shift 8s ease-in-out infinite`;
    }

    return (
      <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${rgbColor}, ${opacityValue * 0.4}) 0%, rgba(${rgbColor}, ${opacityValue * 0.2}) 40%, transparent 70%)`,
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(${rgbColor}, ${opacityValue * 0.1}) 50%, transparent 100%)`,
            ...(animationStyle && { animation: animationStyle }),
            ...(transformStyle && { transform: transformStyle }),
          }}
        />
        <style jsx>{`
          @keyframes mobile-gradient-shift {
            0%, 100% { transform: translateX(-50%); }
            50% { transform: translateX(50%); }
          }
          @keyframes mobile-gradient-shift-once {
            0% { transform: translateX(-50%); }
            50% { transform: translateX(50%); }
            100% { transform: translateX(50%); }
          }
        `}</style>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full relative overflow-hidden [&_canvas]:block" />;
};

export default RippleGrid;
