
import { useState, useEffect } from 'react';
import { Size } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

export function useSizing(containerRef: React.RefObject<HTMLDivElement>) {
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const isMobile = useIsMobile();
  
  // Update sizes when window resizes
  useEffect(() => {
    const handleResize = () => {
      // Update any active windows to adapt to new screen size
      setSizes(prev => {
        const updatedSizes: Record<string, Size> = {};
        
        for (const windowId in prev) {
          updatedSizes[windowId] = getWindowSize(windowId);
        }
        
        return { ...prev, ...updatedSizes };
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSizes = (windowId: string, size: Size) => {
    setSizes(prev => ({ ...prev, [windowId]: size }));
  };

  const getWindowSize = (windowId: string): Size => {
    if (sizes[windowId]) return sizes[windowId];
    
    const container = containerRef.current;
    const containerWidth = container?.clientWidth || window.innerWidth;
    const containerHeight = container?.clientHeight || window.innerHeight - 40;
    
    if (isMobile) {
      // For mobile devices, use almost full screen width and appropriate height
      if (windowId === 'game' || windowId === 'growroom') {
        return { 
          width: Math.min(containerWidth * 0.95, 1200), 
          height: Math.min(containerHeight * 0.85, 800) 
        };
      } else if (windowId === 'shop') {
        return { 
          width: Math.min(containerWidth * 0.95, 1000), 
          height: Math.min(containerHeight * 0.8, 700) 
        };
      } else {
        return { 
          width: Math.min(containerWidth * 0.95, 800), 
          height: Math.min(containerHeight * 0.7, 600) 
        };
      }
    } else {
      // For desktop, use percentage-based sizing
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
    }
  };

  return {
    sizes,
    updateSizes,
    getWindowSize
  };
}
