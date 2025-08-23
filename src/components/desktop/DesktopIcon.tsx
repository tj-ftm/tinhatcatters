
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface DesktopIconProps {
  id: string;
  label: string;
  iconSrc: string;
  fallbackIcon: string;
  onClick: () => void;
  onDoubleClick: () => void;
  isSelected: boolean;
  position: { top: number; left: number };
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  id, 
  label, 
  iconSrc, 
  fallbackIcon, 
  onClick, 
  onDoubleClick, 
  isSelected, 
  position 
}) => {
  const [isClicking, setIsClicking] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Visual feedback for click
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 150);
    
    clickCountRef.current += 1;
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        // Single click - select icon
        onClick();
      }
      clickCountRef.current = 0;
    }, 250); // Reduced timeout for better responsiveness
  }, [onClick, id]);
  
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Clear the single-click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Reset click count and call double-click handler
    clickCountRef.current = 0;
    onDoubleClick();
  }, [onDoubleClick]);
  
  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const positionStyle = { top: `${position.top}px`, left: `${position.left}px` };
  
  return (
    <button 
      id={`desktop-icon-${id}`}
      className={`absolute flex flex-col items-center cursor-pointer w-24 h-24 p-1 group z-10
        ${isSelected ? 'bg-win95-blue/50 border-dotted border-white' : 'hover:bg-win95-blue/20'} 
        ${isClicking ? 'bg-win95-blue/70 scale-95' : ''}
        ${isPressed ? 'scale-95 brightness-90' : ''}
        transition-all duration-100 border border-transparent 
        hover:border-white/20 focus:outline-none focus:border-white/50
        select-none
      `}
      style={positionStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-label={`Open ${label}`}
    >
      <div className={`text-2xl mb-1 transition-transform duration-100 ${
        isPressed ? 'scale-95' : 'group-hover:scale-105'
      }`}>
        {iconSrc.endsWith('.webm') ? (
          <video 
            src={iconSrc}
            className={`h-12 w-12 object-contain transition-all duration-100 ${
               isPressed ? 'brightness-90' : 'drop-shadow-sm group-hover:drop-shadow-md'
             }`}
            autoPlay
            loop
            muted
            playsInline
            onError={(e) => {
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              const fallbackElement = document.createElement('div');
              fallbackElement.textContent = fallbackIcon;
              fallbackElement.className = 'text-2xl';
              if (target.parentNode) {
                target.parentNode.appendChild(fallbackElement);
              }
            }}
          />
        ) : (
          <img 
            src={iconSrc} 
            alt={label} 
            className={`h-12 w-12 object-contain transition-all duration-100 ${
               isPressed ? 'brightness-90' : 'drop-shadow-sm group-hover:drop-shadow-md'
             }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackElement = document.createElement('div');
              fallbackElement.textContent = fallbackIcon;
              fallbackElement.className = 'text-2xl';
              if (target.parentNode) {
                target.parentNode.appendChild(fallbackElement);
              }
            }}
          />
        )}
      </div>
      <span 
        className={`text-white text-xs text-center font-medium
          px-1 py-0.5 w-full transition-all duration-100
          ${isPressed ? 'brightness-90' : ''}
        `}
      >
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;
