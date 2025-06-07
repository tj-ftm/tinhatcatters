
import React, { useRef } from 'react';

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
  const clickTimeoutRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    clickCountRef.current += 1;
    
    if (clickCountRef.current === 1) {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
      
      clickTimeoutRef.current = window.setTimeout(() => {
        if (clickCountRef.current === 1) {
          onClick();
        } else {
          onDoubleClick();
        }
        clickCountRef.current = 0;
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const positionStyle = { top: `${position.top}px`, left: `${position.left}px` };
  
  return (
    <div 
      id={`desktop-icon-${id}`}
      className={`absolute flex flex-col items-center cursor-pointer w-16 group ${isSelected ? 'bg-win95-blue/40' : 'hover:bg-win95-blue/20'}`}
      style={positionStyle}
      onClick={handleClick}
    >
      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
        <img 
          src={iconSrc} 
          alt={label} 
          className="h-8 w-8 object-contain"
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
      </div>
      <span className={`text-white text-xs text-center ${isSelected ? 'bg-win95-blue' : 'bg-win95-blue/80'} px-1 py-0.5 w-full`}>
        {label}
      </span>
    </div>
  );
};

export default DesktopIcon;
