
import { useState } from 'react';

export function useZIndex() {
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});
  const [topZIndex, setTopZIndex] = useState(100);

  const getZIndex = (windowId: string, dragging: string | null, resizing: { windowId: string } | null): number => {
    if (windowId === dragging || (resizing && resizing.windowId === windowId)) return topZIndex + 1;
    return zIndexes[windowId] || 100;
  };

  const bringToFront = (windowId: string) => {
    const newZIndex = topZIndex + 1;
    setZIndexes({ ...zIndexes, [windowId]: newZIndex });
    setTopZIndex(newZIndex);
  };

  return {
    zIndexes,
    getZIndex,
    bringToFront
  };
}
