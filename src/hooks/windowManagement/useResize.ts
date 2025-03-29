
import React, { useState, useRef } from 'react';
import { Position, Size, ResizeDirection } from './types';

export function useResize() {
  const [resizing, setResizing] = useState<{ windowId: string, direction: ResizeDirection } | null>(null);
  const resizeStartPos = useRef<Position | null>(null);
  const resizeStartSize = useRef<Size | null>(null);

  const startResize = (
    windowId: string, 
    direction: ResizeDirection, 
    e: React.MouseEvent,
    isMaximized: boolean,
    getWindowSize: (windowId: string) => Size
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMaximized) return;
    
    setResizing({ windowId, direction });
    
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = getWindowSize(windowId);
  };

  const onResize = (
    e: React.MouseEvent,
    getInitialPosition: (windowId: string) => Position,
    updatePositions: (windowId: string, pos: Position) => void,
    updateSizes: (windowId: string, size: Size) => void,
    positions: Record<string, Position>
  ) => {
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
      
      updatePositions(windowId, newPos);
      updateSizes(windowId, newSize);
    }
  };

  const stopResize = () => {
    setResizing(null);
    resizeStartPos.current = null;
    resizeStartSize.current = null;
  };

  return {
    resizing,
    startResize,
    onResize,
    stopResize
  };
}
