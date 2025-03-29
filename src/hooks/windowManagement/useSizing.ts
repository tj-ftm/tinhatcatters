
import { useState } from 'react';
import { Size } from './types';

export function useSizing(containerRef: React.RefObject<HTMLDivElement>) {
  const [sizes, setSizes] = useState<Record<string, Size>>({});

  const updateSizes = (windowId: string, size: Size) => {
    setSizes(prev => ({ ...prev, [windowId]: size }));
  };

  const getWindowSize = (windowId: string): Size => {
    if (sizes[windowId]) return sizes[windowId];
    
    const container = containerRef.current;
    const containerWidth = container?.clientWidth || window.innerWidth;
    const containerHeight = container?.clientHeight || window.innerHeight - 40;
    
    if (windowId === 'game' || windowId === 'growroom') {
      return { 
        width: Math.min(containerWidth * 0.8, 1200), 
        height: Math.min(containerHeight * 0.8, 800) 
      };
    } else if (windowId === 'shop') {
      return { 
        width: Math.min(containerWidth * 0.8, 1000), 
        height: Math.min(containerHeight * 0.7, 700) 
      };
    } else {
      return { 
        width: Math.min(containerWidth * 0.6, 800), 
        height: Math.min(containerHeight * 0.5, 600) 
      };
    }
  };

  return {
    sizes,
    updateSizes,
    getWindowSize
  };
}
