
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
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const navigate = useNavigate();

  // Each desktop icon has its own URL that can be manually changed
  const desktopIconImages = {
    computer: "/assets/Icons/computer.png",
    game: "/assets/Icons/illuminati.webp",
    growroom: "/assets/Icons/weed.png",
    shop: "/assets/Icons/nftshop.ico",
    chat: "/assets/Icons/illuminati.webp"
  };

  // Handle icon selection and navigation
  const handleIconClick = (windowId: string, route?: string) => {
    // Toggle selection on single click
    setSelectedIcon(windowId);
  };

  // Handle double click to open window and navigate
  const handleIconDoubleClick = (windowId: string, route?: string) => {
    addWindow(windowId);
    if (route) {
      navigate(route);
    }
  };

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

  const handleChatClick = () => {
    if (activeWindows.includes('chat')) {
      restoreWindow('chat');
      setShowChatDialog(false);
    } else {
      setShowChatDialog(true);
    }
  };

  // Clear selection when clicking on desktop background
  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIcon(null);
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#1AB0ED] relative" 
      onClick={handleDesktopClick}
    >
      <div className="flex-grow relative">
        {/* Desktop Icons */}
        <div className="absolute top-2 left-2 flex flex-col items-center gap-6">
          <DesktopIcon 
            id="computer"
            label="My Computer" 
            iconSrc={desktopIconImages.computer}
            fallbackIcon="💻"
            onClick={() => handleIconClick('computer')}
            onDoubleClick={() => handleIconDoubleClick('computer')}
            isSelected={selectedIcon === 'computer'}
          />
          <DesktopIcon 
            id="game"
            label="Reptilian Attack" 
            iconSrc={desktopIconImages.game}
            fallbackIcon="🎮"
            onClick={() => handleIconClick('game')}
            onDoubleClick={() => handleIconDoubleClick('game', '/game')}
            isSelected={selectedIcon === 'game'}
          />
          <DesktopIcon 
            id="growroom"
            label="THC Grow Room" 
            iconSrc={desktopIconImages.growroom}
            fallbackIcon="🌿"
            onClick={() => handleIconClick('growroom')}
            onDoubleClick={() => handleIconDoubleClick('growroom', '/growroom')}
            isSelected={selectedIcon === 'growroom'}
          />
          <DesktopIcon 
            id="shop"
            label="NFT Shop" 
            iconSrc={desktopIconImages.shop}
            fallbackIcon="🛒"
            onClick={() => handleIconClick('shop')}
            onDoubleClick={() => handleIconDoubleClick('shop', '/shop')}
            isSelected={selectedIcon === 'shop'}
          />
          <DesktopIcon 
            id="chat"
            label="Community Chat" 
            iconSrc={desktopIconImages.chat}
            fallbackIcon="💬"
            onClick={() => handleIconClick('chat')}
            onDoubleClick={() => handleChatClick()}
            isSelected={selectedIcon === 'chat'}
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
  id: string;
  label: string; 
  iconSrc: string;
  fallbackIcon: string;
  onClick: () => void;
  onDoubleClick: () => void;
  isSelected: boolean;
}> = ({ id, label, iconSrc, fallbackIcon, onClick, onDoubleClick, isSelected }) => {
  return (
    <div 
      id={`desktop-icon-${id}`}
      className={`flex flex-col items-center cursor-pointer w-16 group ${isSelected ? 'bg-win95-blue/40' : 'hover:bg-win95-blue/20'}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    >
      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
        <img 
          src={iconSrc} 
          alt={label} 
          className="h-8 w-8 object-contain" /* Made icons bigger */
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallbackElement = document.createElement('div');
            fallbackElement.textContent = fallbackIcon;
            fallbackElement.className = 'text-2xl';
            if (target.parentNode) {
              target.parentNode.appendChild(fallbackElement);
            }
          }}
        />
      </div>
      <span className={`text-white text-xs text-center ${isSelected ? 'bg-win95-blue' : 'bg-win95-blue/80'} px-1 py-0.5 w-full`}>
        {label}
      </span>
    </div>
  );
};

export default Desktop;
