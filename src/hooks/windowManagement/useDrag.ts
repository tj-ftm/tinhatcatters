
import React, { useState, useRef } from 'react';
import { Position } from './types';

export function useDrag() {
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const startDrag = (windowId: string, e: React.MouseEvent, isMaximized: boolean) => {
    if (isMaximized) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragging(windowId);

    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const onDrag = (e: React.MouseEvent, updatePositions: (windowId: string, pos: Position) => void) => {
    if (dragging && dragRef.current) {
      e.preventDefault();
      const newPos = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      };
      updatePositions(dragging, newPos);
    }
  };

  const stopDrag = () => {
    setDragging(null);
    dragRef.current = null;
  };

  return {
    dragging,
    startDrag,
    onDrag,
    stopDrag
  };
}
