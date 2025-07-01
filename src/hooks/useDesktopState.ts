
import { useState } from 'react';

export const useDesktopState = () => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleIconClick = (iconId: string) => {
    setSelectedIcon(iconId);
  };

  const handleDesktopClick = () => {
    setSelectedIcon(null);
  };

  const handleChatClick = () => {
    setShowChat(true);
  };

  const handleChatClose = () => {
    setShowChat(false);
  };

  return {
    selectedIcon,
    showChat,
    handleIconClick,
    handleDesktopClick,
    handleChatClick,
    handleChatClose
  };
};
