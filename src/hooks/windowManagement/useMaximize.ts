
import { useState } from 'react';
import { Position, Size } from './types';

export function useMaximize() {
  const [isMaximized, setIsMaximized] = useState<Record<string, boolean>>({});
  const [preMaximizeState, setPreMaximizeState] = useState<Record<string, { position: Position, size: Size }>>({});

  return {
    isMaximized,
    preMaximizeState,
    setIsMaximized,
    setPreMaximizeState
  };
}
