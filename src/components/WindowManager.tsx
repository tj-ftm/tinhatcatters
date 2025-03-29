
import React, { useState, useRef } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Game from '../pages/Game';
import Shop from '../pages/Shop';
import Index from '../pages/Index';

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

const WindowManager: React.FC<WindowManagerProps> = ({ 
  activeWindows,
  windowsMinimized,
  closeWindow,
  minimizeWindow
}) => {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [topZIndex, setTopZIndex] = useState(100);
  const navigate = useNavigate();

  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const getInitialPosition = (windowId: string): Position => {
    if (positions[windowId]) return positions[windowId];
    
    // Generate a slightly offset position for each new window
    const baseOffset = 50;
    const windowCount = Object.keys(positions).length;
    return {
      x: baseOffset + (windowCount * 20) % 100,
      y: baseOffset + (windowCount * 20) % 100
    };
  };

  const getZIndex = (windowId: string): number => {
    if (windowId === dragging) return topZIndex + 1;
    return zIndexes[windowId] || 100;
  };

  const bringToFront = (windowId: string) => {
    const newZIndex = topZIndex + 1;
    setZIndexes({ ...zIndexes, [windowId]: newZIndex });
    setTopZIndex(newZIndex);
  };

  const startDrag = (windowId: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragging(windowId);
    bringToFront(windowId);

    // Store the initial position in case we need to cancel the drag
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

  const handleClose = (windowId: string) => {
    closeWindow(windowId);
    // If closing Game or Shop, navigate back to home
    if (windowId === 'game') navigate('/');
    if (windowId === 'shop') navigate('/');
  };

  return (
    <div 
      className="absolute inset-0"
      onMouseMove={dragging ? onDrag : undefined}
      onMouseUp={dragging ? stopDrag : undefined}
      onMouseLeave={dragging ? stopDrag : undefined}
    >
      {activeWindows.map((windowId) => {
        if (windowsMinimized[windowId]) return null;
        
        const pos = getInitialPosition(windowId);
        const windowTitle = windowId.charAt(0).toUpperCase() + windowId.slice(1);
        
        return (
          <div 
            key={windowId}
            className="absolute win95-window border-2 border-gray-400 rounded-none overflow-hidden"
            style={{
              width: windowId === 'game' || windowId === 'shop' ? '80%' : '60%',
              height: windowId === 'game' ? '80%' : windowId === 'shop' ? '70%' : '50%',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: getZIndex(windowId)
            }}
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
                >
                  <Square className="h-3 w-3" />
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
          </div>
        );
      })}
    </div>
  );
};

export default WindowManager;
