
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export interface WindowState {
  positions: Record<string, Position>;
  sizes: Record<string, Size>;
  zIndexes: Record<string, number>;
  isMaximized: Record<string, boolean>;
  preMaximizeState: Record<string, { position: Position, size: Size }>;
}

export interface DraggingState {
  windowId: string | null;
  offset: Position;
}

export interface ResizingState {
  windowId: string | null;
  direction: ResizeDirection;
  startPos: Position | null;
  startSize: Size | null;
}
