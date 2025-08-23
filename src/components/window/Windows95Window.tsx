
import React, { useState, useRef, useEffect } from 'react';

interface WindowProps {
  title: string;
  icon?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isActive?: boolean;
  onFocus?: () => void;
  showMinimize?: boolean;
  showMaximize?: boolean;
  isMaximized?: boolean;
  children: React.ReactNode;
}

const Windows95Window: React.FC<WindowProps> = ({
  title,
  icon,
  width = 400,
  height = 300,
  x = 50,
  y = 50,
  onClose,
  onMinimize,
  onMaximize,
  isActive = true,
  onFocus,
  showMinimize = true,
  showMaximize = true,
  isMaximized = false,
  children
}) => {
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (onFocus) onFocus();
    
    // Only allow dragging from title bar and not when maximized
    if ((e.target as HTMLElement).closest('.win95-title-bar') && !isMaximized) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      
      // Make sure the window doesn't go off-screen
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.min(newX, maxX),
        y: Math.min(newY, maxY)
      });
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(200, resizeStart.width + deltaX);
      const newHeight = Math.max(150, resizeStart.height + deltaY);
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Update size and position when props change
  useEffect(() => {
    if (isMaximized) {
      setSize({ width: window.innerWidth, height: window.innerHeight - 40 });
      setPosition({ x: 0, y: 0 });
    } else {
      setSize({ width, height });
      setPosition({ x, y });
    }
  }, [width, height, x, y, isMaximized]);

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  // Handle focus
  const handleWindowClick = () => {
    if (onFocus) onFocus();
  };

  return (
    <div 
      ref={windowRef}
      className={`win95-window absolute ${isActive ? 'z-50' : 'z-10'} ${isDragging ? 'cursor-move' : ''} ${isResizing ? 'cursor-se-resize' : ''}`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        border: '2px solid #c0c0c0',
        boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)'
      }}
      onClick={handleWindowClick}
      onMouseDown={handleMouseDown}
    >
      <div className="win95-title-bar flex justify-between items-center cursor-move">
        <div className="text-white font-bold px-1 flex items-center">
          {icon && <img src={icon} alt="" className="h-4 w-4 mr-1 object-contain" />}
          {title}
        </div>
        <div className="flex">
          {showMinimize && onMinimize && (
            <button 
              className="text-white hover:bg-blue-800 px-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
            >
              _
            </button>
          )}
          {showMaximize && onMaximize && (
            <button 
              className="text-white hover:bg-blue-800 px-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onMaximize();
              }}
            >
              {isMaximized ? '❐' : '□'}
            </button>
          )}
          <button 
            className="text-white hover:bg-red-700 px-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div className="bg-[#c0c0c0] h-[calc(100%-24px)] overflow-auto p-1 relative">
        {children}
        {/* Resize handle */}
        {!isMaximized && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-[#c0c0c0] border-l border-t border-gray-400"
            onMouseDown={handleResizeStart}
            style={{
              background: 'linear-gradient(-45deg, transparent 0%, transparent 30%, #808080 30%, #808080 40%, transparent 40%, transparent 60%, #808080 60%, #808080 70%, transparent 70%)'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Windows95Window;
