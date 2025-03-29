
import React, { useEffect } from 'react';
import { useDrag } from './useDrag';
import { useResize } from './useResize';
import { useWindowDimensions } from './useWindowDimensions';
import { useZIndex } from './useZIndex';
import { ResizeDirection } from './types';

export function useWindowManagement(containerRef: React.RefObject<HTMLDivElement>) {
  const {
    positions,
    sizes,
    isMaximized,
    updatePositions,
    updateSizes,
    getInitialPosition,
    getWindowSize,
    toggleMaximize
  } = useWindowDimensions(containerRef);

  const {
    zIndexes,
    getZIndex: getZIndexBase,
    bringToFront
  } = useZIndex();

  const {
    dragging,
    startDrag: startDragBase,
    onDrag: onDragBase,
    stopDrag
  } = useDrag();

  const {
    resizing,
    startResize: startResizeBase,
    onResize: onResizeBase,
    stopResize
  } = useResize();

  // Wrapper functions to connect the hooks together
  const startDrag = (windowId: string, e: React.MouseEvent) => {
    startDragBase(windowId, e, isMaximized[windowId] || false);
    bringToFront(windowId);
  };

  const onDrag = (e: React.MouseEvent) => {
    onDragBase(e, updatePositions);
  };

  const startResize = (windowId: string, direction: ResizeDirection, e: React.MouseEvent) => {
    startResizeBase(windowId, direction, e, isMaximized[windowId] || false, getWindowSize);
    bringToFront(windowId);
  };

  const onResize = (e: React.MouseEvent) => {
    onResizeBase(e, getInitialPosition, updatePositions, updateSizes, positions);
  };

  const getZIndex = (windowId: string): number => {
    return getZIndexBase(windowId, dragging, resizing);
  };

  // Handle window resize events for maximized windows
  useEffect(() => {
    const handleResize = () => {
      Object.entries(isMaximized).forEach(([windowId, maximized]) => {
        if (maximized) {
          const container = containerRef.current;
          const containerWidth = container?.clientWidth || window.innerWidth;
          const containerHeight = container?.clientHeight || window.innerHeight - 40;
          
          updateSizes(windowId, { 
            width: containerWidth, 
            height: containerHeight 
          });
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized, containerRef, updateSizes]);

  return {
    positions,
    sizes,
    zIndexes,
    dragging,
    resizing,
    isMaximized,
    getInitialPosition,
    getWindowSize,
    getZIndex,
    bringToFront,
    startDrag,
    onDrag,
    stopDrag,
    startResize,
    onResize,
    stopResize,
    toggleMaximize
  };
}

// Re-export types for convenience
export * from './types';
