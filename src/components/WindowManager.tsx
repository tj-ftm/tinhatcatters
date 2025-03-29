import React, { useState, useRef } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Game from '../pages/Game';
import Shop from '../pages/Shop';
import Index from '../pages/Index';
import GrowRoom from './GrowRoom';

interface WindowManagerProps {
  activeWindows: string[];
  windowsMinimized: Record<string, boolean>;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

const WindowManager: React.FC<WindowManagerProps> = ({ 
  activeWindows,
  windowsMinimized,
  closeWindow,
  minimizeWindow
}) => {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{ windowId: string, direction: ResizeDirection } | null>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [topZIndex, setTopZIndex] = useState(100);
  const [isMaximized, setIsMaximized] = useState<Record<string, boolean>>({});
  const [preMaximizeState, setPreMaximizeState] = useState<Record<string, { position: Position, size: Size }>>({});
  
  const navigate = useNavigate();

  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizeStartSize = useRef<Size | null>(null);

  const getInitialPosition = (windowId: string): Position => {
    if (positions[windowId]) return positions[windowId];
    
    const baseOffset = 50;
    const windowCount = Object.keys(positions).length;
    return {
      x: baseOffset + (windowCount * 20) % 100,
      y: baseOffset + (windowCount * 20) % 100
    };
  };

  const getWindowSize = (windowId: string): Size => {
    if (sizes[windowId]) return sizes[windowId];
    
    if (windowId === 'game' || windowId === 'growroom') {
      return { width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 };
    } else if (windowId === 'shop') {
      return { width: window.innerWidth * 0.8, height: window.innerHeight * 0.7 };
    } else {
      return { width: window.innerWidth * 0.6, height: window.innerHeight * 0.5 };
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

  const handleClose = (windowId: string) => {
    closeWindow(windowId);
    if (windowId === 'game') navigate('/');
    if (windowId === 'shop') navigate('/');
    if (windowId === 'growroom') navigate('/');
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
      
      setPositions(prev => ({ 
        ...prev, 
        [windowId]: { x: 0, y: 0 } 
      }));
      setSizes(prev => ({ 
        ...prev, 
        [windowId]: { width: window.innerWidth, height: window.innerHeight - 40 } 
      }));
    }
    
    setIsMaximized(prev => ({ ...prev, [windowId]: !currentlyMaximized }));
  };

  return (
    <div 
      className="absolute inset-0"
      onMouseMove={(dragging || resizing) ? onDrag : resizing ? onResize : undefined}
      onMouseUp={dragging ? stopDrag : resizing ? stopResize : undefined}
      onMouseLeave={dragging ? stopDrag : resizing ? stopResize : undefined}
    >
      {activeWindows.map((windowId) => {
        if (windowsMinimized[windowId]) return null;
        
        const pos = positions[windowId] || getInitialPosition(windowId);
        const size = sizes[windowId] || getWindowSize(windowId);
        const windowTitle = windowId.charAt(0).toUpperCase() + windowId.slice(1);
        const maximized = isMaximized[windowId] || false;
        
        return (
          <div 
            key={windowId}
            className="absolute win95-window border-2 border-gray-400 rounded-none overflow-hidden"
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: getZIndex(windowId),
              cursor: resizing && resizing.windowId === windowId ? 
                      `${resizing.direction}-resize` : 'default'
            }}
            onClick={() => bringToFront(windowId)}
          >
            <div 
              className="win95-title-bar flex justify-between items-center cursor-move"
              onMouseDown={(e) => startDrag(windowId, e)}
            >
              <div className="text-white font-bold px-1">{windowTitle}</div>
              <div className="flex">
                <button 
                  className="text-white hover:bg-blue-800 px-1"
                  onClick={() => minimizeWindow(windowId)}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button 
                  className="text-white hover:bg-blue-800 px-1"
                  onClick={() => toggleMaximize(windowId)}
                >
                  <Maximize2 className="h-3 w-3" />
                </button>
                <button 
                  className="text-white hover:bg-red-700 px-1"
                  onClick={() => handleClose(windowId)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="p-1 bg-[#c0c0c0] h-[calc(100%-24px)] overflow-auto">
              {windowId === 'game' && <Game />}
              {windowId === 'shop' && <Shop />}
              {windowId === 'home' && <Index />}
              {windowId === 'growroom' && <GrowRoom />}
              {windowId === 'computer' && (
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-4">My Computer</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-2xl mb-1">💾</div>
                      <span className="text-xs">3½ Floppy (A:)</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl mb-1">💽</div>
                      <span className="text-xs">Hard Disk (C:)</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl mb-1">📀</div>
                      <span className="text-xs">CD Drive (D:)</span>
                    </div>
                  </div>
                </div>
              )}
              {windowId === 'network' && (
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-4">Network Neighborhood</h2>
                  <p>No network connections available.</p>
                </div>
              )}
              {windowId === 'recyclebin' && (
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-4">Recycle Bin</h2>
                  <p>The Recycle Bin is empty.</p>
                </div>
              )}
            </div>
            
            {!maximized && (
              <>
                <div className="absolute w-3 h-3 top-0 left-0 cursor-nw-resize" 
                     onMouseDown={(e) => startResize(windowId, 'nw', e)} />
                <div className="absolute w-3 h-3 top-0 right-0 cursor-ne-resize" 
                     onMouseDown={(e) => startResize(windowId, 'ne', e)} />
                <div className="absolute w-3 h-3 bottom-0 left-0 cursor-sw-resize" 
                     onMouseDown={(e) => startResize(windowId, 'sw', e)} />
                <div className="absolute w-3 h-3 bottom-0 right-0 cursor-se-resize" 
                     onMouseDown={(e) => startResize(windowId, 'se', e)}>
                  <svg width="5" height="5" viewBox="0 0 8 8" className="fill-current text-gray-700">
                    <path d="M0,6 h2 v2 h-2 z M3,3 h2 v2 h-2 z M6,0 h2 v2 h-2 z" />
                  </svg>
                </div>
                
                <div className="absolute h-2 left-3 right-3 top-0 cursor-n-resize" 
                     onMouseDown={(e) => startResize(windowId, 'n', e)} />
                <div className="absolute h-2 left-3 right-3 bottom-0 cursor-s-resize" 
                     onMouseDown={(e) => startResize(windowId, 's', e)} />
                <div className="absolute w-2 top-3 bottom-3 left-0 cursor-w-resize" 
                     onMouseDown={(e) => startResize(windowId, 'w', e)} />
                <div className="absolute w-2 top-3 bottom-3 right-0 cursor-e-resize" 
                     onMouseDown={(e) => startResize(windowId, 'e', e)} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WindowManager;
