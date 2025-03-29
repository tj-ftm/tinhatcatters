
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
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden relative"
      style={{
        backgroundImage: "url('/lovable-uploads/6d4e8ebb-627f-4f21-baaf-ff5524cf554c.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="flex-grow relative">
        {/* Desktop Icons */}
        <div className="absolute top-2 left-2 flex flex-col items-center gap-6">
          <DesktopIcon 
            label="My Computer" 
            icon={<img src="/favicon.png" alt="My Computer" className="h-8 w-8" />}
            onClick={() => handleIconClick('computer')} 
          />
          <DesktopIcon 
            label="Reptilian Attack" 
            icon={<img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="Game" className="h-8 w-8" />} 
            onClick={() => handleIconClick('game', '/game')} 
          />
          <DesktopIcon 
            label="THC Grow Room" 
            icon={<img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="THC" className="h-8 w-8" />} 
            onClick={() => handleIconClick('growroom', '/growroom')} 
          />
          <DesktopIcon 
            label="NFT Shop" 
            icon={<img src="/lovable-uploads/e03a9f53-e89d-4a06-aa83-0c24bf7db8db.jpg" alt="Shop" className="h-8 w-8" />} 
            onClick={() => handleIconClick('shop', '/shop')} 
          />
          <DesktopIcon 
            label="Community Chat" 
            icon={<img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="Chat" className="h-8 w-8" />} 
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
  icon: React.ReactNode | string; 
  onClick: () => void 
}> = ({ label, icon, onClick }) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer w-16 group hover:bg-win95-blue/20"
      onClick={onClick}
    >
      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
        {typeof icon === 'string' ? icon : icon}
      </div>
      <span className="text-white text-xs text-center bg-win95-blue/80 px-1 py-0.5 w-full">
        {label}
      </span>
    </div>
  );
};

export default Desktop;
