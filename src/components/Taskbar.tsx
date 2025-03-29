
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
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

  const openBuyTHC = () => {
    window.open('https://www.shadow.so/trade?inputCurrency=0x0000000000000000000000000000000000000000&outputCurrency=0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5', '_blank');
    setStartMenuOpen(false);
  };

  return (
    <div className="win95-window h-11 flex items-stretch z-50 border-t-2 w-full">
      <button 
        className={`win95-button flex items-center px-2 py-1 h-8 my-auto ml-1 ${startMenuOpen ? 'active:translate-y-0' : ''}`}
        onClick={handleStartClick}
      >
        <span className="text-sm font-bold flex items-center">
          <img 
            src="https://cdn3d.iconscout.com/3d/free/thumb/free-windows-2-4659893-3866197.png" 
            alt="Start" 
            className="h-5 w-5 mr-1"
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
            {window === 'game' && <img src="https://cdn3d.iconscout.com/3d/premium/thumb/game-controller-5679567-4730291.png" className="h-4 w-4 mr-1" alt="Game" />}
            {window === 'shop' && <img src="https://cdn3d.iconscout.com/3d/premium/thumb/shopping-cart-5679599-4730323.png" className="h-4 w-4 mr-1" alt="Shop" />}
            {window === 'computer' && <img src="https://cdn3d.iconscout.com/3d/premium/thumb/computer-5769600-4828559.png" className="h-4 w-4 mr-1" alt="Computer" />}
            {window === 'wallet' && <img src="https://cdn3d.iconscout.com/3d/premium/thumb/wallet-5679597-4730321.png" className="h-4 w-4 mr-1" alt="Wallet" />}
            {window === 'growroom' && <img src="https://cdn3d.iconscout.com/3d/premium/thumb/cannabis-5679566-4730290.png" className="h-4 w-4 mr-1" alt="THC" />}
            {window === 'chat' && <MessageSquare className="h-4 w-4 mr-1" />}
            {window.charAt(0).toUpperCase() + window.slice(1)}
          </button>
        ))}
      </div>

      {/* Clock */}
      <div className="win95-panel px-2 flex items-center text-xs mr-1">
        <Clock />
      </div>

      {/* Start Menu */}
      {startMenuOpen && (
        <div className="fixed left-0 bottom-11 win95-window w-56 border-2 z-[9999]">
          <div className="p-1">
            <div className="p-1 text-lg mb-1 flex items-center">
              <img src="https://cdn3d.iconscout.com/3d/free/thumb/free-windows-2-4659893-3866197.png" alt="Windows" className="h-6 w-6 mr-2" />
              TinHatCatters
            </div>
            
            <div className="flex flex-col">
              {/* Games submenu */}
              <div className="relative group">
                <div className="flex items-center p-1 hover:bg-win95-blue hover:text-white cursor-pointer">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/game-controller-5679567-4730291.png" className="h-4 w-4" alt="Games" />
                  </div>
                  <span>Games</span>
                  <span className="ml-auto">▶</span>
                </div>
                
                <div className="hidden group-hover:block absolute left-full top-0 win95-window w-48 border-2 z-[9999]">
                  <div className="py-1">
                    <StartMenuItem 
                      icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/game-controller-5679567-4730291.png" className="h-4 w-4" alt="Game" />} 
                      label="Reptilian Attack"
                      onClick={() => handleItemClick('/game', 'game')}
                    />
                    <StartMenuItem 
                      icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/cannabis-5679566-4730290.png" className="h-4 w-4" alt="THC" />} 
                      label="THC Grow Room"
                      onClick={() => handleItemClick('/growroom', 'growroom')}
                    />
                  </div>
                </div>
              </div>
              
              <StartMenuItem 
                icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/shopping-cart-5679599-4730323.png" className="h-4 w-4" alt="Shop" />}
                label="NFT Shop"
                onClick={() => handleItemClick('/shop', 'shop')}
              />
              <StartMenuItem 
                icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/wallet-5679597-4730321.png" className="h-4 w-4" alt="Wallet" />}
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
                icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/computer-5769600-4828559.png" className="h-4 w-4" alt="Computer" />}
                label="My Computer"
                onClick={() => handleItemClick('/', 'computer')}
              />
              
              <div className="border-t border-win95-darkGray my-1"></div>
              
              <StartMenuItem 
                icon={<img src="https://cdn3d.iconscout.com/3d/premium/thumb/dollar-5769602-4828561.png" className="h-4 w-4" alt="Buy THC" />} 
                label="Buy $THC"
                onClick={openBuyTHC}
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
