
import React, { useState, useRef, useEffect } from 'react';

interface WindowProps {
  title: string;
  icon?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  onClose: () => void;
  isActive?: boolean;
  onFocus?: () => void;
  showMinimize?: boolean;
  showMaximize?: boolean;
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
  isActive = true,
  onFocus,
  showMinimize = true,
  showMaximize = true,
  children
}) => {
  const [position, setPosition] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (onFocus) onFocus();
    
    // Only allow dragging from title bar
    if ((e.target as HTMLElement).closest('.win95-title-bar')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      
      // Make sure the window doesn't go off-screen
      const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.min(newX, maxX),
        y: Math.min(newY, maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle focus
  const handleWindowClick = () => {
    if (onFocus) onFocus();
  };

  return (
    <div 
      ref={windowRef}
      className={`win95-window absolute ${isActive ? 'z-50' : 'z-10'} ${isDragging ? 'cursor-move' : ''}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
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
          {showMinimize && <button className="text-white hover:bg-blue-800 px-1 cursor-pointer">_</button>}
          {showMaximize && <button className="text-white hover:bg-blue-800 px-1 cursor-pointer">□</button>}
          <button 
            className="text-white hover:bg-red-700 px-1 cursor-pointer"
            onClick={onClose}
          >×</button>
        </div>
      </div>
      <div className="bg-[#c0c0c0] h-[calc(100%-24px)] overflow-auto p-1">
        {children}
      </div>
    </div>
  );
};

export default Windows95Window;
