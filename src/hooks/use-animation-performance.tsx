import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

export type AnimationQuality = 'high' | 'medium' | 'low';

interface DeviceCapabilities {
  cores: number;
  memory: number | undefined;
  isLowEnd: boolean;
}

interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  droppedFrames: number;
}

interface AnimationPerformanceContextValue {
  quality: AnimationQuality;
  disableHeavyAnimations: boolean;
  metrics: PerformanceMetrics;
  deviceCapabilities: DeviceCapabilities;
  setQuality: (quality: AnimationQuality) => void;
}

const AnimationPerformanceContext = createContext<AnimationPerformanceContextValue | undefined>(undefined);

const FPS_THRESHOLD_LOW = 30;
const FPS_THRESHOLD_MEDIUM = 50;
const FPS_SAMPLE_SIZE = 60;
const PERFORMANCE_CHECK_INTERVAL = 1000;

const LOW_END_CORE_THRESHOLD = 4;
const LOW_END_MEMORY_THRESHOLD = 4;

function detectDeviceCapabilities(): DeviceCapabilities {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory;
  
  const isLowEnd = cores <= LOW_END_CORE_THRESHOLD || 
    (memory !== undefined && memory <= LOW_END_MEMORY_THRESHOLD);
  
  return { cores, memory, isLowEnd };
}

function calculateQualityFromFps(fps: number): AnimationQuality {
  if (fps >= FPS_THRESHOLD_MEDIUM) {
    return 'high';
  } else if (fps >= FPS_THRESHOLD_LOW) {
    return 'medium';
  } else {
    return 'low';
  }
}

interface AnimationPerformanceProviderProps {
  children: ReactNode;
  autoAdjustQuality?: boolean;
  initialQuality?: AnimationQuality;
  fpsThresholdLow?: number;
  fpsThresholdMedium?: number;
}

export function AnimationPerformanceProvider({
  children,
  autoAdjustQuality = true,
  initialQuality,
  fpsThresholdLow = FPS_THRESHOLD_LOW,
  fpsThresholdMedium = FPS_THRESHOLD_MEDIUM,
}: AnimationPerformanceProviderProps) {
  const [deviceCapabilities] = useState<DeviceCapabilities>(() => detectDeviceCapabilities());
  
  const defaultQuality = initialQuality || (deviceCapabilities.isLowEnd ? 'medium' : 'high');
  const [quality, setQualityState] = useState<AnimationQuality>(defaultQuality);
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    averageFps: 60,
    droppedFrames: 0,
  });
  
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number>();
  const droppedFramesRef = useRef<number>(0);
  
  const setQuality = useCallback((newQuality: AnimationQuality) => {
    setQualityState(newQuality);
  }, []);
  
  const measureFrame = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    if (delta > 0) {
      const currentFps = 1000 / delta;
      frameTimesRef.current.push(currentFps);
      
      if (currentFps < fpsThresholdLow) {
        droppedFramesRef.current += 1;
      }
      
      if (frameTimesRef.current.length > FPS_SAMPLE_SIZE) {
        frameTimesRef.current.shift();
      }
      
      if (frameTimesRef.current.length > 0) {
        const averageFps = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        
        setMetrics({
          fps: currentFps,
          averageFps,
          droppedFrames: droppedFramesRef.current,
        });
        
        if (autoAdjustQuality && frameTimesRef.current.length >= FPS_SAMPLE_SIZE) {
          const newQuality = calculateQualityFromFps(averageFps);
          if (newQuality !== quality) {
            setQualityState(newQuality);
          }
        }
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, [quality, autoAdjustQuality, fpsThresholdLow]);
  
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(measureFrame);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [measureFrame]);
  
  useEffect(() => {
    const resetInterval = setInterval(() => {
      droppedFramesRef.current = 0;
    }, PERFORMANCE_CHECK_INTERVAL * 10);
    
    return () => clearInterval(resetInterval);
  }, []);
  
  const disableHeavyAnimations = quality === 'low' || metrics.averageFps < fpsThresholdLow;
  
  const value: AnimationPerformanceContextValue = {
    quality,
    disableHeavyAnimations,
    metrics,
    deviceCapabilities,
    setQuality,
  };
  
  return (
    <AnimationPerformanceContext.Provider value={value}>
      {children}
    </AnimationPerformanceContext.Provider>
  );
}

export function useAnimationPerformance(): AnimationPerformanceContextValue {
  const context = useContext(AnimationPerformanceContext);
  
  if (context === undefined) {
    throw new Error('useAnimationPerformance must be used within AnimationPerformanceProvider');
  }
  
  return context;
}

export function useAnimationQuality(): AnimationQuality {
  const { quality } = useAnimationPerformance();
  return quality;
}

export function useDisableHeavyAnimations(): boolean {
  const { disableHeavyAnimations } = useAnimationPerformance();
  return disableHeavyAnimations;
}

export function usePerformanceMetrics(): PerformanceMetrics {
  const { metrics } = useAnimationPerformance();
  return metrics;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const { deviceCapabilities } = useAnimationPerformance();
  return deviceCapabilities;
}
