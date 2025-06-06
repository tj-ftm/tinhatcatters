
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';
import WalletWindow from './WalletWindow';
import ChatButton from './ChatButton';
import ChatDialog from './ChatDialog';
import { ScrollArea } from './ui/scroll-area';
import { 
  Computer, 
  ShoppingCart, 
  Gamepad2, 
  Wallet, 
  Cannabis, 
  MessageSquare, 
  TrendingUp, 
  BarChart2 
} from 'lucide-react';

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
    chat: "/assets/Icons/illuminati.webp",
    leaderboard: "/assets/Icons/illuminati.webp",
    analytics: "/assets/Icons/illuminati.webp"
  };

  // Handle desktop icon click
  const handleDesktopIconClick = (iconId: string) => {
    setSelectedIcon(prev => prev === iconId ? null : iconId);
  };

  // Handle desktop icon double-click
  const handleDesktopIconDoubleClick = (windowId: string, route?: string) => {
    openWindow(windowId);
    if (route) {
      navigate(route);
    }
  };

  // Open window function
  const openWindow = (windowId: string) => {
    if (!activeWindows.includes(windowId)) {
      setActiveWindows(prev => [...prev, windowId]);
      setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
    } else {
      if (windowsMinimized[windowId]) {
        setWindowsMinimized(prev => ({ ...prev, [windowId]: false }));
      }
    }
    // Ensure icon is deselected after opening
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

  // Desktop icon component with click tracking
  const DesktopIcon: React.FC<{ 
    id: string;
    label: string; 
    iconSrc: string;
    fallbackIcon: string;
    onClick: () => void;
    onDoubleClick: () => void;
    isSelected: boolean;
    position?: { top: number, left: number };
  }> = ({ id, label, iconSrc, fallbackIcon, onClick, onDoubleClick, isSelected, position }) => {
    // Use a ref to track clicks for double-click detection
    const clickTimeoutRef = React.useRef<number | null>(null);
    const clickCountRef = React.useRef(0);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      clickCountRef.current += 1;
      
      if (clickCountRef.current === 1) {
        if (clickTimeoutRef.current) {
          window.clearTimeout(clickTimeoutRef.current);
        }
        
        clickTimeoutRef.current = window.setTimeout(() => {
          if (clickCountRef.current === 1) {
            // Single click
            onClick();
          } else {
            // Double click
            onDoubleClick();
          }
          clickCountRef.current = 0;
          clickTimeoutRef.current = null;
        }, 250); // Double click timeout
      }
    };

    const positionStyle = position ? { top: `${position.top}px`, left: `${position.left}px` } : {};
    
    return (
      <div 
        id={`desktop-icon-${id}`}
        className={`absolute flex flex-col items-center cursor-pointer w-16 group ${isSelected ? 'bg-win95-blue/40' : 'hover:bg-win95-blue/20'}`}
        style={positionStyle}
        onClick={handleClick}
      >
        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
          <img 
            src={iconSrc} 
            alt={label} 
            className="h-8 w-8 object-contain"
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

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#1AB0ED] relative" 
      onClick={handleDesktopClick}
    >
      {/* Desktop content area */}
      <div className="flex-grow relative">
        {/* Desktop Icons with improved click handling */}
        <DesktopIcon 
          id="computer"
          label="My Computer" 
          iconSrc={desktopIconImages.computer}
          fallbackIcon="💻"
          onClick={() => handleDesktopIconClick('computer')}
          onDoubleClick={() => handleDesktopIconDoubleClick('computer')}
          isSelected={selectedIcon === 'computer'}
          position={{ top: 20, left: 20 }}
        />
        
        <DesktopIcon 
          id="game"
          label="Reptilian Attack" 
          iconSrc={desktopIconImages.game}
          fallbackIcon="🎮"
          onClick={() => handleDesktopIconClick('game')}
          onDoubleClick={() => handleDesktopIconDoubleClick('game', '/game')}
          isSelected={selectedIcon === 'game'}
          position={{ top: 110, left: 20 }}
        />
        
        <DesktopIcon 
          id="growroom"
          label="THC Grow Room" 
          iconSrc={desktopIconImages.growroom}
          fallbackIcon="🌿"
          onClick={() => handleDesktopIconClick('growroom')}
          onDoubleClick={() => handleDesktopIconDoubleClick('growroom', '/growroom')}
          isSelected={selectedIcon === 'growroom'}
          position={{ top: 200, left: 20 }}
        />
        
        <DesktopIcon 
          id="shop"
          label="NFT Shop" 
          iconSrc={desktopIconImages.shop}
          fallbackIcon="🛒"
          onClick={() => handleDesktopIconClick('shop')}
          onDoubleClick={() => handleDesktopIconDoubleClick('shop', '/shop')}
          isSelected={selectedIcon === 'shop'}
          position={{ top: 290, left: 20 }}
        />
        
        <DesktopIcon 
          id="leaderboard"
          label="Leaderboard" 
          iconSrc={desktopIconImages.leaderboard}
          fallbackIcon="🏆"
          onClick={() => handleDesktopIconClick('leaderboard')}
          onDoubleClick={() => handleDesktopIconDoubleClick('leaderboard', '/leaderboard')}
          isSelected={selectedIcon === 'leaderboard'}
          position={{ top: 380, left: 20 }}
        />
        
        <DesktopIcon 
          id="analytics"
          label="Analytics" 
          iconSrc={desktopIconImages.analytics}
          fallbackIcon="📊"
          onClick={() => handleDesktopIconClick('analytics')}
          onDoubleClick={() => handleDesktopIconDoubleClick('analytics', '/analytics')}
          isSelected={selectedIcon === 'analytics'}
          position={{ top: 20, left: 110 }}
        />
        
        <DesktopIcon 
          id="chat"
          label="Community Chat" 
          iconSrc={desktopIconImages.chat}
          fallbackIcon="💬"
          onClick={() => handleDesktopIconClick('chat')}
          onDoubleClick={() => handleChatClick()}
          isSelected={selectedIcon === 'chat'}
          position={{ top: 110, left: 110 }}
        />
        
        {/* Wallet Window */}
        {showWalletWindow && (
          <div className="absolute top-2 right-2 z-50">
            <WalletWindow 
              onClose={() => setShowWalletWindow(false)} 
              onMinimize={() => {
                openWindow('wallet');
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
                      openWindow('chat');
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
      
      {/* Taskbar always on top with fixed position */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Taskbar 
          activeWindows={activeWindows} 
          windowsMinimized={windowsMinimized}
          addWindow={openWindow}
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
    </div>
  );
};

export default Desktop;
