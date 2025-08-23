
import React from 'react';
import WindowTitleBar from './WindowTitleBar';
import WindowContent from './WindowContent';
import WindowResizeHandles from './WindowResizeHandles';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

interface SingleWindowProps {
  windowId: string;
  pos: Position;
  size: Size;
  zIndex: number;
  isMaximized: boolean;
  title: string;
  startDrag: (windowId: string, e: React.MouseEvent) => void;
  minimizeWindow: (windowId: string) => void;
  toggleMaximize: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  startResize: (windowId: string, direction: ResizeDirection, e: React.MouseEvent) => void;
  bringToFront: (windowId: string) => void;
  handleOpenWindow: (windowId: string, path?: string) => void;
  resizing?: { windowId: string, direction: ResizeDirection } | null;
  isResizable?: boolean;
}

// Updated function to return the correct window titles
const getWindowTitle = (windowId: string, defaultTitle: string) => {
  switch (windowId) {
    case 'game':
      return 'Reptilian Run';
    case 'growroom':
      return 'THC Grow Room';
    case 'leaderboard':
      return 'Leaderboard';
    case 'analytics':
      return 'Analytics Dashboard';
    case 'shop':
      return 'Shop';
    default:
      return defaultTitle;
  }
};

const SingleWindow: React.FC<SingleWindowProps> = ({
  windowId,
  pos,
  size,
  zIndex,
  isMaximized,
  title,
  startDrag,
  minimizeWindow,
  toggleMaximize,
  closeWindow,
  startResize,
  bringToFront,
  handleOpenWindow,
  resizing,
  isResizable = true
}) => {
  const displayTitle = getWindowTitle(windowId, title);
  
  return (
    <div 
      className="absolute win95-window border-2 border-gray-400 rounded-none overflow-hidden"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: zIndex,
        cursor: resizing && resizing.windowId === windowId ? 
                `${resizing.direction}-resize` : 'default'
      }}
      onClick={() => bringToFront(windowId)}
      data-id={windowId}
    >
      <WindowTitleBar
        windowId={windowId}
        title={displayTitle}
        startDrag={startDrag}
        minimizeWindow={minimizeWindow}
        toggleMaximize={toggleMaximize}
        closeWindow={closeWindow}
      />
      
      <WindowContent 
        windowId={windowId} 
        handleOpenWindow={handleOpenWindow}
      />
      
      {!isMaximized && isResizable && (
        <WindowResizeHandles
          windowId={windowId}
          startResize={startResize}
        />
      )}
    </div>
  );
};

export default SingleWindow;
