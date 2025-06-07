
import { useState } from 'react';

export interface CustomWindow {
  id: string;
  title: string;
  content: React.ReactNode;
  path?: string;
}

export const useDesktopState = () => {
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [windowsMinimized, setWindowsMinimized] = useState<Record<string, boolean>>({});
  const [customWindows, setCustomWindows] = useState<CustomWindow[]>([]);
  const [activeCustomWindow, setActiveCustomWindow] = useState<string | null>(null);
  const [showWalletWindow, setShowWalletWindow] = useState(true);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const openWindow = (windowId: string) => {
    if (!activeWindows.includes(windowId)) {
      setActiveWindows(prev => [...prev, windowId]);
      setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
    } else {
      if (windowsMinimized[windowId]) {
        setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
      }
    }
    setSelectedIcon(null);
  };

  const closeWindow = (windowId: string) => {
    setActiveWindows(prev => prev.filter(id => id !== windowId));
  };

  const minimizeWindow = (windowId: string) => {
    setWindowsMinimized(prev => ({ ...prev, [windowId]: true }));
  };

  const restoreWindow = (windowId: string) => {
    setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
  };

  const openCustomWindow = (windowId: string, title: string, route?: string) => {
    const existingWindow = customWindows.find(w => w.id === windowId);
    
    if (existingWindow) {
      setActiveCustomWindow(windowId);
    } else {
      const content = <div className="p-2">Loading {windowId} content...</div>;
      setCustomWindows(prev => [...prev, { id: windowId, title, content, path: route }]);
      setActiveCustomWindow(windowId);
    }
  };

  const closeCustomWindow = (windowId: string) => {
    setCustomWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeCustomWindow === windowId) {
      setActiveCustomWindow(customWindows.length > 1 ? customWindows[0]?.id : null);
    }
  };

  return {
    activeWindows,
    windowsMinimized,
    customWindows,
    activeCustomWindow,
    showWalletWindow,
    showChatDialog,
    selectedIcon,
    setActiveWindows,
    setWindowsMinimized,
    setCustomWindows,
    setActiveCustomWindow,
    setShowWalletWindow,
    setShowChatDialog,
    setSelectedIcon,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    openCustomWindow,
    closeCustomWindow
  };
};
