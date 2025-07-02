import { useCallback, useRef, useEffect } from 'react';

export function useGameLoop(callback: (deltaTime: number) => void, running: boolean = true) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
      callback(Math.min(deltaTime, 1/30)); // Cap delta time to prevent large jumps
    }
    previousTimeRef.current = time;
    
    if (running) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [callback, running]);

  useEffect(() => {
    if (running) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, running]);

  return {
    start: () => {
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    stop: () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    }
  };
}