
import React from 'react';

interface FileIconProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  onDoubleClick?: () => void;
  iconUrl?: string;
  isSelected?: boolean;
}

const FileIcon: React.FC<FileIconProps> = ({ label, icon, onClick, onDoubleClick, iconUrl, isSelected = false }) => {
  const [isClicking, setIsClicking] = React.useState(false);
  const clickTimeoutRef = React.useRef<number | null>(null);
  const clickCountRef = React.useRef(0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Visual feedback for clicking
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 150);
    
    // Handle single vs double click
    if (onDoubleClick) {
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
    } else {
      // Simple click if no double click handler
      onClick();
    }
  };

  return (
    <button 
      className={`flex flex-col items-center cursor-pointer p-3 
        ${isSelected ? 'bg-win95-blue/40' : 'hover:bg-gray-200'} 
        ${isClicking ? 'bg-win95-blue/60 scale-95' : ''}
        border border-transparent hover:border-gray-400
        transition-all duration-150 focus:outline-none focus:border-gray-500
        active:scale-95 active:bg-win95-blue/30
      `}
      onClick={handleClick}
      aria-label={`Open ${label}`}
    >
      <div className="mb-2 flex items-center justify-center w-10 h-10 group-hover:scale-110 transition-transform duration-200">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={`${label}-icon`} 
            className="h-5 w-5 object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Show fallback icon
              const iconContainer = target.parentElement;
              if (iconContainer) {
                const fallbackIcon = document.createElement('div');
                fallbackIcon.className = "h-5 w-5 flex items-center justify-center";
                iconContainer.appendChild(fallbackIcon);
                // The React children will be rendered as fallback
              }
            }}
          />
        ) : icon}
      </div>
      <span className={`text-xs text-center transition-colors duration-150 ${isSelected ? 'bg-win95-blue text-white px-1' : ''}`}>
        {label}
      </span>
    </button>
  );
};

export default FileIcon;
