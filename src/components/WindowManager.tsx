
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindowManagement } from '../hooks/useWindowManagement';
import SingleWindow from './window/SingleWindow';

interface WindowManagerProps {
  activeWindows: string[];
  windowsMinimized: Record<string, boolean>;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
}

const WindowManager: React.FC<WindowManagerProps> = ({ 
  activeWindows,
  windowsMinimized,
  closeWindow,
  minimizeWindow
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const {
    positions,
    sizes,
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
  } = useWindowManagement(containerRef);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleOpenWindow = (windowId: string, path?: string) => {
    if (windowId === 'computer') {
      closeWindow('computer');
    }
    
    if (path) {
      navigate(path);
    }
    
    if (windowId !== 'computer') {
      bringToFront(windowId);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0"
      onMouseMove={(dragging || resizing) ? onDrag : resizing ? onResize : undefined}
      onMouseUp={dragging ? stopDrag : resizing ? stopResize : undefined}
      onMouseLeave={dragging ? stopDrag : resizing ? stopResize : undefined}
    >
      {activeWindows.map((windowId) => {
        if (windowsMinimized[windowId]) return null;
        
        const pos = positions[windowId] || getInitialPosition(windowId);
        const size = sizes[windowId] || getWindowSize(windowId);
        const windowTitle = windowId === 'computer' ? 'My Computer' : windowId.charAt(0).toUpperCase() + windowId.slice(1);
        const maximized = isMaximized[windowId] || false;
        
        return (
          <SingleWindow
            key={windowId}
            windowId={windowId}
            pos={pos}
            size={size}
            zIndex={getZIndex(windowId)}
            isMaximized={maximized}
            title={windowTitle}
            startDrag={startDrag}
            minimizeWindow={minimizeWindow}
            toggleMaximize={toggleMaximize}
            closeWindow={closeWindow}
            startResize={startResize}
            bringToFront={bringToFront}
            handleOpenWindow={handleOpenWindow}
            resizing={resizing}
          />
        );
      })}
    </div>
  );
};

export default WindowManager;
