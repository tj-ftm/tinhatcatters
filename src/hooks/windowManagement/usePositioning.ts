
import { useState } from 'react';
import { Position } from './types';

export function usePositioning(containerRef: React.RefObject<HTMLDivElement>) {
  const [positions, setPositions] = useState<Record<string, Position>>({});

  const updatePositions = (windowId: string, pos: Position) => {
    setPositions(prev => ({ ...prev, [windowId]: pos }));
  };

  const getInitialPosition = (windowId: string): Position => {
    if (positions[windowId]) return positions[windowId];
    
    const container = containerRef.current;
    const containerWidth = container?.clientWidth || window.innerWidth;
    const containerHeight = container?.clientHeight || window.innerHeight - 40;
    
    const baseOffsetX = Math.min(50, containerWidth * 0.05);
    const baseOffsetY = Math.min(50, containerHeight * 0.05);
    const windowCount = Object.keys(positions).length;
    
    return {
      x: baseOffsetX + (windowCount * 20) % Math.max(100, containerWidth * 0.1),
      y: baseOffsetY + (windowCount * 20) % Math.max(100, containerHeight * 0.1)
    };
  };

  return {
    positions,
    updatePositions,
    getInitialPosition
  };
}
