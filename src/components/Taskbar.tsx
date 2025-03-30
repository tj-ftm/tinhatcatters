
import React, { useState } from 'react';
import { Computer, ShoppingCart, Gamepad2, Home, Wallet, Cannabis, MessageSquare, TrendingUp, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WalletConnector from './WalletConnector';

interface TaskbarProps {
  activeWindows: string[];
  windowsMinimized: Record<string, boolean>;
  addWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  onWalletClick: () => void;
  onChatClick: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
  activeWindows, 
  windowsMinimized,
  addWindow,
  restoreWindow,
  onWalletClick,
  onChatClick
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartClick = () => {
    setStartMenuOpen(!startMenuOpen);
  };

  const handleItemClick = (path: string, windowId: string) => {
    navigate(path);
    addWindow(windowId);
    setStartMenuOpen(false);
  };

  const handleWindowButtonClick = (windowId: string) => {
    if (windowsMinimized[windowId]) {
      restoreWindow(windowId);
    } else {
      // If it's already active and not minimized, do nothing
      // or you could implement a focus behavior here
    }
  };

  return (
    <div className="win95-window h-11 flex items-stretch z-50 border-t-2 w-full">
      <button 
        className={`win95-button flex items-center px-2 py-1 h-8 my-auto ml-1 ${startMenuOpen ? 'active:translate-y-0' : ''}`}
        onClick={handleStartClick}
      >
        <span className="text-sm font-bold flex items-center">
          <img 
            src="/windows-logo.png" 
            alt="Windows" 
            className="h-5 w-5 mr-1"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="9" height="9" x="1" y="1" fill="red"/><rect width="9" height="9" x="10" y="1" fill="green"/><rect width="9" height="9" x="1" y="10" fill="blue"/><rect width="9" height="9" x="10" y="10" fill="yellow"/></svg>';
            }}
          />
          Start
        </span>
      </button>

      <div className="border-l border-win95-darkGray mx-1 my-1"></div>

      <div className="border-l border-win95-darkGray mx-1 my-1"></div>

      {/* Window buttons */}
      <div className="flex-grow flex items-center px-1 space-x-1 overflow-x-auto">
        {activeWindows.map(window => (
          <button 
            key={window} 
            className={`win95-button px-2 py-1 h-8 text-sm flex items-center ${!windowsMinimized[window] ? 'border-inset' : ''}`}
            onClick={() => handleWindowButtonClick(window)}
          >
            {window === 'game' && <Gamepad2 className="h-4 w-4 mr-1" />}
            {window === 'shop' && <ShoppingCart className="h-4 w-4 mr-1" />}
            {window === 'computer' && <Computer className="h-4 w-4 mr-1" />}
            {window === 'home' && <Home className="h-4 w-4 mr-1" />}
            {window === 'wallet' && <Wallet className="h-4 w-4 mr-1" />}
            {window === 'growroom' && <Cannabis className="h-4 w-4 mr-1" />}
            {window === 'chat' && <MessageSquare className="h-4 w-4 mr-1" />}
            {window === 'leaderboard' && <TrendingUp className="h-4 w-4 mr-1" />}
            {window === 'analytics' && <BarChart2 className="h-4 w-4 mr-1" />}
            {window.charAt(0).toUpperCase() + window.slice(1)}
          </button>
        ))}
      </div>

      {/* Clock */}
      <div className="win95-panel px-2 flex items-center text-xs mr-1">
        <Clock />
      </div>

      {/* Start Menu - Now with higher z-index to ensure it's always on top */}
      {startMenuOpen && (
        <div className="fixed left-0 bottom-11 win95-window w-56 border-2 z-[9999]">
          <div className="bg-win95-blue h-full w-8 absolute left-0 top-0 bottom-0">
            <div className="flex flex-col justify-end h-full pb-2 text-white font-bold">
              <span className="transform -rotate-90 whitespace-nowrap origin-bottom-left translate-y-0 translate-x-0 absolute bottom-12">
                TinhatCatters
              </span>
            </div>
          </div>

          <div className="pl-8 py-1">
            <div className="p-1 font-bold text-lg mb-1">Tin Hat Catters</div>
            
            <div className="flex flex-col">
              <StartMenuItem 
                icon={<Home className="h-4 w-4" />} 
                label="Home"
                onClick={() => handleItemClick('/', 'home')}
              />
              
              {/* Games submenu */}
              <div className="relative group">
                <div className="flex items-center p-1 hover:bg-win95-blue hover:text-white cursor-pointer">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <Gamepad2 className="h-4 w-4" />
                  </div>
                  <span>Games</span>
                  <span className="ml-auto">▶</span>
                </div>
                
                <div className="hidden group-hover:block absolute left-full top-0 win95-window w-48 border-2 z-[9999]">
                  <div className="py-1">
                    <StartMenuItem 
                      icon={<Gamepad2 className="h-4 w-4" />} 
                      label="Reptilian Attack"
                      onClick={() => handleItemClick('/game', 'game')}
                    />
                    <StartMenuItem 
                      icon={<Cannabis className="h-4 w-4" />} 
                      label="THC Grow Room"
                      onClick={() => handleItemClick('/growroom', 'growroom')}
                    />
                  </div>
                </div>
              </div>
              
              <StartMenuItem 
                icon={<ShoppingCart className="h-4 w-4" />}
                label="NFT Shop"
                onClick={() => handleItemClick('/shop', 'shop')}
              />
              <StartMenuItem 
                icon={<TrendingUp className="h-4 w-4" />}
                label="Leaderboard"
                onClick={() => handleItemClick('/leaderboard', 'leaderboard')}
              />
              <StartMenuItem 
                icon={<BarChart2 className="h-4 w-4" />}
                label="Analytics Dashboard"
                onClick={() => handleItemClick('/analytics', 'analytics')}
              />
              <StartMenuItem 
                icon={<Wallet className="h-4 w-4" />}
                label="Wallet"
                onClick={() => {
                  setStartMenuOpen(false);
                  onWalletClick();
                }}
              />
              <StartMenuItem 
                icon={<MessageSquare className="h-4 w-4" />}
                label="Community Chat"
                onClick={() => {
                  setStartMenuOpen(false);
                  onChatClick();
                }}
              />
              <StartMenuItem 
                icon={<Computer className="h-4 w-4" />}
                label="My Computer"
                onClick={() => handleItemClick('/', 'computer')}
              />
              
              <div className="border-t border-win95-darkGray my-1"></div>
              
              <StartMenuItem 
                icon="❓" 
                label="Help"
                onClick={() => alert('Help not available in this version!')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StartMenuItem: React.FC<{ 
  icon: React.ReactNode | string; 
  label: string; 
  onClick: () => void 
}> = ({ icon, label, onClick }) => {
  return (
    <div 
      className="flex items-center p-1 hover:bg-win95-blue hover:text-white cursor-pointer"
      onClick={onClick}
    >
      <div className="w-6 h-6 flex items-center justify-center mr-2">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
};

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-xs">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};

export default Taskbar;
