
import React from 'react';
import DesktopIcon from './DesktopIcon';
import { desktopIcons } from '@/config/desktopIcons';

interface DesktopIconsProps {
  selectedIcon: string | null;
  onIconClick: (iconId: string) => void;
  onIconDoubleClick: (windowId: string, route?: string) => void;
  onChatClick: () => void;
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({
  selectedIcon,
  onIconClick,
  onIconDoubleClick,
  onChatClick
}) => {
  const handleIconDoubleClick = (iconId: string, route?: string) => {
    if (iconId === 'chat') {
      onChatClick();
      return;
    }
    onIconDoubleClick(iconId, route);
  };

  return (
    <>
      {desktopIcons.map((icon) => (
        <DesktopIcon 
          key={icon.id}
          id={icon.id}
          label={icon.label}
          iconSrc={icon.iconSrc}
          fallbackIcon={icon.fallbackIcon}
          onClick={() => onIconClick(icon.id)}
          onDoubleClick={() => handleIconDoubleClick(icon.id, icon.route)}
          isSelected={selectedIcon === icon.id}
          position={icon.position}
        />
      ))}
    </>
  );
};

export default DesktopIcons;
