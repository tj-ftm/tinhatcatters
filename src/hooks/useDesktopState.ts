
import { useState } from 'react';

export interface CustomWindow {
  id: string;
  title: string;
  route?: string;
}

export const useDesktopState = () => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [windowsMinimized, setWindowsMinimized] = useState<Record<string, boolean>>({});
  const [customWindows, setCustomWindows] = useState<CustomWindow[]>([]);
  const [activeCustomWindow, setActiveCustomWindow] = useState<string | null>(null);
  const [showWalletWindow, setShowWalletWindow] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);

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

  const openWindow = (windowId: string) => {
    setActiveWindows(prev => {
      if (!prev.includes(windowId)) {
        return [...prev, windowId];
      }
      return prev;
    });
    setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
  };

  const closeWindow = (windowId: string) => {
    setActiveWindows(prev => prev.filter(id => id !== windowId));
    setWindowsMinimized(prev => {
      const newMinimized = { ...prev };
      delete newMinimized[windowId];
      return newMinimized;
    });
  };

  const minimizeWindow = (windowId: string) => {
    setWindowsMinimized(prev => ({ ...prev, [windowId]: true }));
  };

  const restoreWindow = (windowId: string) => {
    setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
    if (!activeWindows.includes(windowId)) {
      openWindow(windowId);
    }
  };

  const openCustomWindow = (windowId: string, title: string, route?: string) => {
    const existingWindow = customWindows.find(w => w.id === windowId);
    if (!existingWindow) {
      setCustomWindows(prev => [...prev, { id: windowId, title, route }]);
    }
    setActiveCustomWindow(windowId);
  };

  const closeCustomWindow = (windowId: string) => {
    setCustomWindows(prev => prev.filter(w => w.id !== windowId));
    setActiveCustomWindow(prev => prev === windowId ? null : prev);
  };

  return {
    selectedIcon,
    showChat,
    activeWindows,
    windowsMinimized,
    customWindows,
    activeCustomWindow,
    showWalletWindow,
    showChatDialog,
    setSelectedIcon,
    setActiveCustomWindow,
    setShowWalletWindow,
    setShowChatDialog,
    handleIconClick,
    handleDesktopClick,
    handleChatClick,
    handleChatClose,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    openCustomWindow,
    closeCustomWindow
  };
};
