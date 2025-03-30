
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
              target.src = 'data:image/webp;base64,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" width="20" height="20" viewBox="0 0 20 20"><rect width="9" height="9" x="1" y="1" fill="red"/><rect width="9" height="9" x="10" y="1" fill="green"/><rect width="9" height="9" x="1" y="10" fill="blue"/><rect width="9" height="9" x="10" y="10" fill="yellow"/></svg>';
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
