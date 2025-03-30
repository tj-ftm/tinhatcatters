
import React from 'react';

interface FileIconProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  iconUrl?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ label, icon, onClick, iconUrl }) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer p-3 hover:bg-gray-200 border border-transparent hover:border-gray-400"
      onClick={onClick}
      onDoubleClick={onClick}
    >
      <div className="mb-2 flex items-center justify-center w-10 h-10">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={`${label}-icon`} 
            className="h-5 w-5 object-contain"
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
      <span className="text-xs text-center">{label}</span>
    </div>
  );
};

export default FileIcon;
