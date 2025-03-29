
import { useRef } from 'react';
import { Position, Size } from './types';
import { usePositioning } from './usePositioning';
import { useSizing } from './useSizing';
import { useMaximize } from './useMaximize';

export function useWindowDimensions(containerRef: React.RefObject<HTMLDivElement>) {
  const {
    positions,
    updatePositions,
    getInitialPosition
  } = usePositioning(containerRef);

  const {
    sizes,
    updateSizes,
    getWindowSize
  } = useSizing(containerRef);

  const {
    isMaximized,
    preMaximizeState,
    setIsMaximized,
    setPreMaximizeState
  } = useMaximize();

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
