
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';

const Desktop: React.FC = () => {
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [windowsMinimized, setWindowsMinimized] = useState<Record<string, boolean>>({});

  const addWindow = (windowId: string) => {
    if (!activeWindows.includes(windowId)) {
      setActiveWindows(prev => [...prev, windowId]);
      setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
    } else {
      // If window exists but is minimized, restore it
      if (windowsMinimized[windowId]) {
        setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
      }
    }
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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#008080] relative">
      <div className="flex-grow relative">
        {/* Desktop Icons would go here */}
        <div className="absolute top-2 left-2 flex flex-col items-center gap-6">
          <DesktopIcon label="My Computer" icon="💻" onClick={() => addWindow('computer')} />
          <DesktopIcon label="Network" icon="🌐" onClick={() => addWindow('network')} />
          <DesktopIcon label="Recycle Bin" icon="🗑️" onClick={() => addWindow('recyclebin')} />
          <DesktopIcon label="Game" icon="🎮" onClick={() => addWindow('game')} />
          <DesktopIcon label="Shop" icon="🛒" onClick={() => addWindow('shop')} />
        </div>
        
        <WindowManager 
          activeWindows={activeWindows} 
          windowsMinimized={windowsMinimized}
          closeWindow={closeWindow}
          minimizeWindow={minimizeWindow}
        />
        
        {/* Hidden outlet for React Router */}
        <div className="hidden">
          <Outlet />
        </div>
      </div>
      
      <Taskbar 
        activeWindows={activeWindows} 
        windowsMinimized={windowsMinimized}
        addWindow={addWindow}
        restoreWindow={restoreWindow}
      />
    </div>
  );
};

const DesktopIcon: React.FC<{ 
  label: string; 
  icon: string; 
  onClick: () => void 
}> = ({ label, icon, onClick }) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer w-16 group"
      onClick={onClick}
    >
      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-white text-xs text-center bg-win95-blue/80 px-1 py-0.5 w-full">
        {label}
      </span>
    </div>
  );
};

export default Desktop;
