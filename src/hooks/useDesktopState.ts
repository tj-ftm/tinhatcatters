
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
  const [windowsMaximized, setWindowsMaximized] = useState<Record<string, boolean>>({});
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

  const maximizeWindow = (windowId: string) => {
    setWindowsMaximized(prev => ({ ...prev, [windowId]: !prev[windowId] }));
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
      // Add to activeWindows for taskbar display only when creating new window
      setActiveWindows(prev => [...prev, windowId]);
    }
    setActiveCustomWindow(windowId);
    // Ensure window is not minimized when opened
    setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
  };

  const closeCustomWindow = (windowId: string) => {
    setCustomWindows(prev => prev.filter(w => w.id !== windowId));
    setActiveCustomWindow(prev => prev === windowId ? null : prev);
    // Also remove from activeWindows for taskbar
    setActiveWindows(prev => prev.filter(id => id !== windowId));
    // Clean up maximize state
    setWindowsMaximized(prev => {
      const newMaximized = { ...prev };
      delete newMaximized[windowId];
      return newMaximized;
    });
    // Clean up minimize state
    setWindowsMinimized(prev => {
      const newMinimized = { ...prev };
      delete newMinimized[windowId];
      return newMinimized;
    });
  };

  const minimizeCustomWindow = (windowId: string) => {
    setActiveCustomWindow(prev => prev === windowId ? null : prev);
    // Set window as minimized in taskbar
    setWindowsMinimized(prev => ({ ...prev, [windowId]: true }));
  };

  const maximizeCustomWindow = (windowId: string) => {
    setWindowsMaximized(prev => ({ ...prev, [windowId]: !prev[windowId] }));
  };

  const restoreCustomWindow = (windowId: string) => {
    // Restore the custom window by setting it as active
    setActiveCustomWindow(windowId);
    // Ensure it's not minimized
    setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
  };

  return {
    selectedIcon,
    showChat,
    activeWindows,
    windowsMinimized,
    windowsMaximized,
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
    maximizeWindow,
    restoreWindow,
    openCustomWindow,
    closeCustomWindow,
    minimizeCustomWindow,
    maximizeCustomWindow,
    restoreCustomWindow
  };
};
