
import { useState } from 'react';
import { Position, Size } from './types';

export function useWindowDimensions(containerRef: React.RefObject<HTMLDivElement>) {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [isMaximized, setIsMaximized] = useState<Record<string, boolean>>({});
  const [preMaximizeState, setPreMaximizeState] = useState<Record<string, { position: Position, size: Size }>>({});

  const updatePositions = (windowId: string, pos: Position) => {
    setPositions(prev => ({ ...prev, [windowId]: pos }));
  };

  const updateSizes = (windowId: string, size: Size) => {
    setSizes(prev => ({ ...prev, [windowId]: size }));
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

  const toggleMaximize = (windowId: string) => {
    const currentlyMaximized = isMaximized[windowId];
    
    if (currentlyMaximized) {
      const prevState = preMaximizeState[windowId];
      if (prevState) {
        updatePositions(windowId, prevState.position);
        updateSizes(windowId, prevState.size);
      }
    } else {
      const currentPosition = positions[windowId] || getInitialPosition(windowId);
      const currentSize = sizes[windowId] || getWindowSize(windowId);
      
      setPreMaximizeState(prev => ({
        ...prev,
        [windowId]: { position: currentPosition, size: currentSize }
      }));
      
      const container = containerRef.current;
      const containerWidth = container?.clientWidth || window.innerWidth;
      const containerHeight = container?.clientHeight || window.innerHeight - 40;
      
      updatePositions(windowId, { x: 0, y: 0 });
      updateSizes(windowId, { width: containerWidth, height: containerHeight });
    }
    
    setIsMaximized(prev => ({ ...prev, [windowId]: !currentlyMaximized }));
  };

  return {
    positions,
    sizes,
    isMaximized,
    updatePositions,
    updateSizes,
    getInitialPosition,
    getWindowSize,
    toggleMaximize
  };
}
