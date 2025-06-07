
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';
import WalletWindow from './WalletWindow';
import ChatDialog from './ChatDialog';
import DesktopIcons from './desktop/DesktopIcons';
import CustomWindowsManager from './desktop/CustomWindowsManager';
import { useDesktopState } from '@/hooks/useDesktopState';

const Desktop: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeWindows,
    windowsMinimized,
    customWindows,
    activeCustomWindow,
    showWalletWindow,
    showChatDialog,
    selectedIcon,
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
  } = useDesktopState();

  const getWindowTitle = (windowId: string): string => {
    switch (windowId) {
      case 'computer':
        return 'My Computer';
      case 'game':
        return 'Reptilian Attack';
      case 'growroom':
        return 'THC Grow Room';
      case 'shop':
        return 'NFT Shop';
      case 'leaderboard':
        return 'Leaderboard';
      case 'analytics':
        return 'Analytics Dashboard';
      case 'wallet':
        return 'Wallet';
      case 'chat':
        return 'Community Chat';
      default:
        return windowId.charAt(0).toUpperCase() + windowId.slice(1);
    }
  };

  const handleDesktopIconClick = (iconId: string) => {
    setSelectedIcon(prev => prev === iconId ? null : iconId);
  };

  const handleDesktopIconDoubleClick = (windowId: string, route?: string) => {
    openCustomWindow(windowId, getWindowTitle(windowId), route);
    
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

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIcon(null);
    }
  };

  const handleNavigationFromWindow = (windowId: string, route?: string) => {
    if (windowId === 'computer') {
      closeCustomWindow('computer');
    }
    
    if (route) {
      navigate(route);
    }
    
    if (windowId !== 'computer') {
      handleDesktopIconDoubleClick(windowId, route);
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#1AB0ED] relative" 
      onClick={handleDesktopClick}
    >
      <div className="flex-grow relative">
        <DesktopIcons
          selectedIcon={selectedIcon}
          onIconClick={handleDesktopIconClick}
          onIconDoubleClick={handleDesktopIconDoubleClick}
          onChatClick={handleChatClick}
        />
        
        <CustomWindowsManager
          customWindows={customWindows}
          activeCustomWindow={activeCustomWindow}
          setActiveCustomWindow={setActiveCustomWindow}
          closeCustomWindow={closeCustomWindow}
          onNavigate={handleNavigationFromWindow}
        />
        
        {showWalletWindow && (
          <div className="absolute top-2 right-2 z-50">
            <WalletWindow 
              onClose={() => setShowWalletWindow(false)} 
              onMinimize={() => {
                openWindow('wallet');
                minimizeWindow('wallet');
                setShowWalletWindow(false);
              }}
            />
          </div>
        )}
        
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
                      minimizeWindow('chat');
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
        
        <div className="hidden">
          <Outlet />
        </div>
      </div>
      
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
