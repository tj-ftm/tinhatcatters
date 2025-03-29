
import React from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

interface WindowTitleBarProps {
  windowId: string;
  title: string;
  startDrag: (windowId: string, e: React.MouseEvent) => void;
  minimizeWindow: (windowId: string) => void;
  toggleMaximize: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
}

const WindowTitleBar: React.FC<WindowTitleBarProps> = ({ 
  windowId, 
  title, 
  startDrag, 
  minimizeWindow, 
  toggleMaximize, 
  closeWindow 
}) => {
  return (
    <div 
      className="win95-title-bar flex justify-between items-center cursor-move"
      onMouseDown={(e) => startDrag(windowId, e)}
    >
      <div className="text-white font-bold px-1">{title}</div>
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
          onClick={() => closeWindow(windowId)}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default WindowTitleBar;
