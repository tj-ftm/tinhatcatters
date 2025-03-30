
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';
import WalletWindow from './WalletWindow';
import ChatButton from './ChatButton';
import ChatDialog from './ChatDialog';
import { ScrollArea } from './ui/scroll-area';

const Desktop: React.FC = () => {
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [windowsMinimized, setWindowsMinimized] = useState<Record<string, boolean>>({});
  const [showWalletWindow, setShowWalletWindow] = useState(true);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const navigate = useNavigate();

  const addWindow = (windowId: string) => {
    if (!activeWindows.includes(windowId)) {
      setActiveWindows(prev => [...prev, windowId]);
      setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
    } else {
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

  const handleIconClick = (windowId: string, route?: string) => {
    addWindow(windowId);
    if (route) {
      navigate(route);
    }
  };

  const handleChatClick = () => {
    if (activeWindows.includes('chat')) {
      restoreWindow('chat');
      setShowChatDialog(false);
    } else {
      setShowChatDialog(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1AB0ED] relative">
      <div className="flex-grow relative">
        {/* Desktop Icons */}
        <div className="absolute top-2 left-2 flex flex-col items-center gap-6">
          <DesktopIcon 
            label="My Computer" 
            icon="💻" 
            onClick={() => handleItemClick('computer')} 
          />
          <DesktopIcon 
            label="Reptilian Attack" 
            icon="🎮" 
            onClick={() => handleIconClick('game', '/game')} 
          />
          <DesktopIcon 
            label="THC Grow Room" 
            icon="data:image/webp;base64,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" 
            onClick={() => handleItemClick('growroom', '/growroom')} 
          />
          <DesktopIcon 
            label="NFT Shop" 
            icon="🛒" 
            onClick={() => handleIconClick('shop', '/shop')} 
          />
          <DesktopIcon 
            label="Community Chat" 
            icon="💬" 
            onClick={handleChatClick} 
          />
        </div>
        
        {/* Wallet Window */}
        {showWalletWindow && (
          <div className="absolute top-2 right-2 z-50">
            <WalletWindow 
              onClose={() => setShowWalletWindow(false)} 
              onMinimize={() => {
                addWindow('wallet');
                setWindowsMinimized(prev => ({ ...prev, wallet: true }));
                setShowWalletWindow(false);
              }}
            />
          </div>
        )}
        
        {/* Chat Dialog */}
        {showChatDialog && (
          <div className="absolute top-2 right-2 mt-[280px] z-50">
            <div className="win95-window shadow-lg">
              <div className="win95-title-bar flex justify-between items-center">
                <span className="text-white font-bold px-2 flex items-center gap-2">
                  <span className="text-white">Community Chat</span>
                </span>
                <div className="flex">
                  <button 
                    className="text-white hover:bg-blue-800 px-1 cursor-pointer z-30" 
                    onClick={() => {
                      addWindow('chat');
                      setWindowsMinimized(prev => ({ ...prev, chat: true }));
                      setShowChatDialog(false);
                    }}
                  >
                    <span className="text-xs">_</span>
                  </button>
                  <button 
                    className="text-white hover:bg-red-500 px-1 cursor-pointer z-30" 
                    onClick={() => setShowChatDialog(false)}
                  >
                    <span className="text-xs">x</span>
                  </button>
                </div>
              </div>
              <div className="p-0">
                <ChatDialog open={true} onOpenChange={setShowChatDialog} />
              </div>
            </div>
          </div>
        )}
        
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
        onWalletClick={() => {
          if (activeWindows.includes('wallet')) {
            restoreWindow('wallet');
            setShowWalletWindow(false);
          } else {
            setShowWalletWindow(true);
          }
        }}
        onChatClick={handleChatClick}
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
      className="flex flex-col items-center cursor-pointer w-16 group hover:bg-win95-blue/20"
      onClick={onClick}
      onDoubleClick={onClick}
    >
      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-white text-xs text-center bg-win95-blue/80 px-1 py-0.5 w-full">
        {label}
      </span>
    </div>
  );
};

export default Desktop;
