import * as React from "react";

interface UseCountUpOptions {
  start?: number;
  duration?: number;
  easing?: (t: number) => number;
  decimals?: number;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
): { value: number; reset: () => void } {
  const {
    start = 0,
    duration = 1500,
    easing = easeOutCubic,
    decimals = 0,
  } = options;

  const [value, setValue] = React.useState<number>(start);
  const animationRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  const animate = React.useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const currentValue = start + (end - start) * easedProgress;

      const factor = Math.pow(10, decimals);
      const roundedValue = Math.round(currentValue * factor) / factor;
      setValue(roundedValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [start, end, duration, easing, decimals]
  );

  const startAnimation = React.useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    startTimeRef.current = null;
    setValue(start);
    animationRef.current = requestAnimationFrame(animate);
  }, [start, animate]);

  const reset = React.useCallback(() => {
    startAnimation();
  }, [startAnimation]);

  React.useEffect(() => {
    startAnimation();
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startAnimation]);

  return { value, reset };
}
