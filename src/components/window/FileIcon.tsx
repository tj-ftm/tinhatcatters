
import React from 'react';

interface FileIconProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const FileIcon: React.FC<FileIconProps> = ({ label, icon, onClick }) => {
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

export default FileIcon;
