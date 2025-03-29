
import React from 'react';

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

interface WindowResizeHandlesProps {
  windowId: string;
  startResize: (windowId: string, direction: ResizeDirection, e: React.MouseEvent) => void;
}

const WindowResizeHandles: React.FC<WindowResizeHandlesProps> = ({ windowId, startResize }) => {
  return (
    <>
      <div className="absolute w-3 h-3 top-0 left-0 cursor-nw-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 'nw', e)} />
      <div className="absolute w-3 h-3 top-0 right-0 cursor-ne-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 'ne', e)} />
      <div className="absolute w-3 h-3 bottom-0 left-0 cursor-sw-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 'sw', e)} />
      <div className="absolute w-3 h-3 bottom-0 right-0 cursor-se-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 'se', e)}>
        <svg width="5" height="5" viewBox="0 0 8 8" className="fill-current text-gray-700">
          <path d="M0,6 h2 v2 h-2 z M3,3 h2 v2 h-2 z M6,0 h2 v2 h-2 z" />
        </svg>
      </div>
      
      <div className="absolute h-2 left-3 right-3 top-0 cursor-n-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 'n', e)} />
      <div className="absolute h-2 left-3 right-3 bottom-0 cursor-s-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 's', e)} />
      <div className="absolute w-2 top-3 bottom-3 left-0 cursor-w-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 'w', e)} />
      <div className="absolute w-2 top-3 bottom-3 right-0 cursor-e-resize z-50" 
           onMouseDown={(e) => startResize(windowId, 'e', e)} />
    </>
  );
};

export default WindowResizeHandles;
