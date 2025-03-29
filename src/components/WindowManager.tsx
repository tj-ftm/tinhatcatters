import React, { useState, useRef } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Game from '../pages/Game';
import Shop from '../pages/Shop';
import Index from '../pages/Index';
import GrowRoom from './GrowRoom';
import { ScrollArea } from './ui/scroll-area';
import { Computer, ShoppingCart, Gamepad2, Home, Wallet, Cannabis, HelpCircle } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleClose = (windowId: string) => {
    closeWindow(windowId);
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
            
            <div className="bg-[#c0c0c0] h-[calc(100%-24px)]">
              <ScrollArea className="h-full w-full">
                <div className="p-1">
                  {windowId === 'game' && <Game />}
                  {windowId === 'shop' && <Shop />}
                  {windowId === 'growroom' && <GrowRoom />}
                  {windowId === 'computer' && (
                    <div className="p-4">
                      <h2 className="text-lg font-bold mb-4">My Computer</h2>
                      
                      <div className="mb-4">
                        <div className="win95-inset p-2 mb-4">
                          <p className="text-sm">Welcome to My Computer. Double-click an icon to open the application.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <FileIcon 
                          label="Home" 
                          icon={<Home className="h-5 w-5" />} 
                          onClick={() => handleOpenWindow('home', '/')} 
                        />
                        <FileIcon 
                          label="Reptilian Attack" 
                          icon={<Gamepad2 className="h-5 w-5" />} 
                          onClick={() => handleOpenWindow('game', '/game')} 
                        />
                        <FileIcon 
                          label="NFT Shop" 
                          icon={<ShoppingCart className="h-5 w-5" />} 
                          onClick={() => handleOpenWindow('shop', '/shop')} 
                        />
                        <FileIcon 
                          label="THC Grow Room" 
                          icon={<Cannabis className="h-5 w-5" />} 
                          onClick={() => handleOpenWindow('growroom', '/growroom')} 
                        />
                        <FileIcon 
                          label="Wallet" 
                          icon={<Wallet className="h-5 w-5" />} 
                          onClick={() => handleOpenWindow('wallet')} 
                        />
                        <FileIcon 
                          label="Help" 
                          icon={<HelpCircle className="h-5 w-5" />} 
                          onClick={() => alert('Help not available in this version!')} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
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

const FileIcon: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  onClick: () => void;
}> = ({ label, icon, onClick }) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer p-3 hover:bg-gray-200 border border-transparent hover:border-gray-400"
      onClick={onClick}
      onDoubleClick={onClick}
    >
      <div className="mb-2 flex items-center justify-center w-10 h-10">
        {icon}
      </div>
      <span className="text-xs text-center">{label}</span>
    </div>
  );
};

export default WindowManager;
