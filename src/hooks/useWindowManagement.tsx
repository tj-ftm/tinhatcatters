
import React, { useState, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export interface WindowState {
  positions: Record<string, Position>;
  sizes: Record<string, Size>;
  zIndexes: Record<string, number>;
  isMaximized: Record<string, boolean>;
  preMaximizeState: Record<string, { position: Position, size: Size }>;
}

export const useWindowManagement = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{ windowId: string, direction: ResizeDirection } | null>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [topZIndex, setTopZIndex] = useState(100);
  const [isMaximized, setIsMaximized] = useState<Record<string, boolean>>({});
  const [preMaximizeState, setPreMaximizeState] = useState<Record<string, { position: Position, size: Size }>>({});
  
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizeStartSize = useRef<Size | null>(null);

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

  const getZIndex = (windowId: string): number => {
    if (windowId === dragging || (resizing && resizing.windowId === windowId)) return topZIndex + 1;
    return zIndexes[windowId] || 100;
  };

  const bringToFront = (windowId: string) => {
    const newZIndex = topZIndex + 1;
    setZIndexes({ ...zIndexes, [windowId]: newZIndex });
    setTopZIndex(newZIndex);
  };

  const startDrag = (windowId: string, e: React.MouseEvent) => {
    if (isMaximized[windowId]) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragging(windowId);
    bringToFront(windowId);

    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const onDrag = (e: React.MouseEvent) => {
    if (dragging && dragRef.current) {
      e.preventDefault();
      const newPos = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      };
      setPositions(prev => ({ ...prev, [dragging]: newPos }));
    }
  };

  const stopDrag = () => {
    setDragging(null);
    dragRef.current = null;
  };

  const startResize = (windowId: string, direction: ResizeDirection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMaximized[windowId]) return;
    
    setResizing({ windowId, direction });
    bringToFront(windowId);
    
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = getWindowSize(windowId);
  };

  const onResize = (e: React.MouseEvent) => {
    if (resizing && resizeStartPos.current && resizeStartSize.current) {
      e.preventDefault();
      
      const { windowId, direction } = resizing;
      const startPos = positions[windowId] || getInitialPosition(windowId);
      const startSize = resizeStartSize.current;
      
      let newPos = { ...startPos };
      let newSize = { ...startSize };
      
      const deltaX = e.clientX - (resizeStartPos.current?.x || 0);
      const deltaY = e.clientY - (resizeStartPos.current?.y || 0);
      
      if (direction.includes('n')) {
        newPos.y = startPos.y + deltaY;
        newSize.height = startSize.height - deltaY;
      }
      if (direction.includes('s')) {
        newSize.height = startSize.height + deltaY;
      }
      if (direction.includes('w')) {
        newPos.x = startPos.x + deltaX;
        newSize.width = startSize.width - deltaX;
      }
      if (direction.includes('e')) {
        newSize.width = startSize.width + deltaX;
      }
      
      const minSize = 200;
      if (newSize.width < minSize) {
        newSize.width = minSize;
        if (direction.includes('w')) {
          newPos.x = startPos.x + (startSize.width - minSize);
        }
      }
      if (newSize.height < minSize) {
        newSize.height = minSize;
        if (direction.includes('n')) {
          newPos.y = startPos.y + (startSize.height - minSize);
        }
      }
      
      setPositions(prev => ({ ...prev, [windowId]: newPos }));
      setSizes(prev => ({ ...prev, [windowId]: newSize }));
    }
  };

  const stopResize = () => {
    setResizing(null);
    resizeStartPos.current = null;
    resizeStartSize.current = null;
  };

  const toggleMaximize = (windowId: string) => {
    const currentlyMaximized = isMaximized[windowId];
    
    if (currentlyMaximized) {
      const prevState = preMaximizeState[windowId];
      if (prevState) {
        setPositions(prev => ({ ...prev, [windowId]: prevState.position }));
        setSizes(prev => ({ ...prev, [windowId]: prevState.size }));
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
      
      setPositions(prev => ({ 
        ...prev, 
        [windowId]: { x: 0, y: 0 } 
      }));
      setSizes(prev => ({ 
        ...prev, 
        [windowId]: { width: containerWidth, height: containerHeight } 
      }));
    }
    
    setIsMaximized(prev => ({ ...prev, [windowId]: !currentlyMaximized }));
  };

  React.useEffect(() => {
    const handleResize = () => {
      Object.entries(isMaximized).forEach(([windowId, maximized]) => {
        if (maximized) {
          const container = containerRef.current;
          const containerWidth = container?.clientWidth || window.innerWidth;
          const containerHeight = container?.clientHeight || window.innerHeight - 40;
          
          setSizes(prev => ({ 
            ...prev, 
            [windowId]: { width: containerWidth, height: containerHeight } 
          }));
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);

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
};
