
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

  // Taskbar button icons - individually configurable
  const taskbarIconImages = {
    game: "/assets/Icons/illuminati.webp",
    shop: "/assets/Icons/illuminati.webp",
    computer: "/assets/Icons/illuminati.webp",
    home: "/assets/Icons/illuminati.webp",
    wallet: "/assets/Icons/illuminati.webp",
    growroom: "/assets/Icons/weed.png",
    chat: "/assets/Icons/illuminati.webp",
    leaderboard: "/assets/Icons/illuminati.webp",
    analytics: "/assets/Icons/illuminati.webp"
  };

  // Start menu icons - individually configurable
  const startMenuIconImages = {
    home: "/assets/Icons/illuminati.webp",
    games: "/assets/Icons/illuminati.webp",
    reptilianAttack: "/assets/Icons/illuminati.webp",
    thcGrowRoom: "/assets/Icons/illuminati.webp",
    nftShop: "/assets/Icons/illuminati.webp",
    leaderboard: "/assets/Icons/illuminati.webp",
    analytics: "/assets/Icons/illuminati.webp",
    wallet: "/assets/Icons/illuminati.webp",
    chat: "/assets/Icons/illuminati.webp",
    computer: "/assets/Icons/illuminati.webp",
    help: "/assets/Icons/illuminati.webp"
  };

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
            <img 
              src={taskbarIconImages[window as keyof typeof taskbarIconImages] || "/assets/Icons/illuminati.webp"} 
              alt={`${window}-icon`} 
              className="h-4 w-4 mr-1 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Use fallback icon
                const IconComponent = getIconComponent(window);
                if (target.parentNode && IconComponent) {
                  const iconContainer = document.createElement('div');
                  iconContainer.className = "h-4 w-4 mr-1 flex items-center justify-center";
                  target.parentNode.insertBefore(iconContainer, target.nextSibling);
                }
              }}
            />
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
                iconSrc={startMenuIconImages.home}
                label="Home"
                onClick={() => handleItemClick('/', 'home')}
              />
              
              {/* Games submenu */}
              <div className="relative group">
                <div className="flex items-center p-1 hover:bg-win95-blue hover:text-white cursor-pointer">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <img 
                      src={startMenuIconImages.games} 
                      alt="Games" 
                      className="h-4 w-4 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.innerHTML = '<span class="h-4 w-4"><span>';
                        if (target.parentNode) {
                          target.parentNode.appendChild(fallback.firstChild as Node);
                        }
                      }}
                    />
                  </div>
                  <span>Games</span>
                  <span className="ml-auto">▶</span>
                </div>
                
                <div className="hidden group-hover:block absolute left-full top-0 win95-window w-48 border-2 z-[9999]">
                  <div className="py-1">
                    <StartMenuItem 
                      iconSrc={startMenuIconImages.reptilianAttack}
                      label="Reptilian Attack"
                      onClick={() => handleItemClick('/game', 'game')}
                    />
                    <StartMenuItem 
                      iconSrc={startMenuIconImages.thcGrowRoom}
                      label="THC Grow Room"
                      onClick={() => handleItemClick('/growroom', 'growroom')}
                    />
                  </div>
                </div>
              </div>
              
              <StartMenuItem 
                iconSrc={startMenuIconImages.nftShop}
                label="NFT Shop"
                onClick={() => handleItemClick('/shop', 'shop')}
              />
              <StartMenuItem 
                iconSrc={startMenuIconImages.leaderboard}
                label="Leaderboard"
                onClick={() => handleItemClick('/leaderboard', 'leaderboard')}
              />
              <StartMenuItem 
                iconSrc={startMenuIconImages.analytics}
                label="Analytics Dashboard"
                onClick={() => handleItemClick('/analytics', 'analytics')}
              />
              <StartMenuItem 
                iconSrc={startMenuIconImages.wallet}
                label="Wallet"
                onClick={() => {
                  setStartMenuOpen(false);
                  onWalletClick();
                }}
              />
              <StartMenuItem 
                iconSrc={startMenuIconImages.chat}
                label="Community Chat"
                onClick={() => {
                  setStartMenuOpen(false);
                  onChatClick();
                }}
              />
              <StartMenuItem 
                iconSrc={startMenuIconImages.computer}
                label="My Computer"
                onClick={() => handleItemClick('/', 'computer')}
              />
              
              <div className="border-t border-win95-darkGray my-1"></div>
              
              <StartMenuItem 
                iconSrc={startMenuIconImages.help}
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
  iconSrc: string; 
  label: string; 
  onClick: () => void 
}> = ({ iconSrc, label, onClick }) => {
  return (
    <div 
      className="flex items-center p-1 hover:bg-win95-blue hover:text-white cursor-pointer"
      onClick={onClick}
    >
      <div className="w-6 h-6 flex items-center justify-center mr-2">
        <img 
          src={iconSrc} 
          alt={`${label} icon`} 
          className="h-4 w-4 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Fallback to text
            const fallback = document.createElement('span');
            fallback.textContent = '•';
            fallback.className = 'text-center';
            if (target.parentNode) {
              target.parentNode.appendChild(fallback);
            }
          }}
        />
      </div>
      <span>{label}</span>
    </div>
  );
};

// Helper function to get the fallback icon component for window buttons
const getIconComponent = (windowId: string) => {
  switch (windowId) {
    case 'game': return <Gamepad2 className="h-4 w-4" />;
    case 'shop': return <ShoppingCart className="h-4 w-4" />;
    case 'computer': return <Computer className="h-4 w-4" />;
    case 'home': return <Home className="h-4 w-4" />;
    case 'wallet': return <Wallet className="h-4 w-4" />;
    case 'growroom': return <Cannabis className="h-4 w-4" />;
    case 'chat': return <MessageSquare className="h-4 w-4" />;
    case 'leaderboard': return <TrendingUp className="h-4 w-4" />;
    case 'analytics': return <BarChart2 className="h-4 w-4" />;
    default: return <div>📄</div>;
  }
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
