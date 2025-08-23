
import React from 'react';
import { Home, Gamepad2, ShoppingCart, Cannabis, Wallet, HelpCircle, BarChart2, MessageSquare } from 'lucide-react';
import FileIcon from './FileIcon';

interface ComputerContentProps {
  handleOpenWindow: (windowId: string, path?: string) => void;
}

const ComputerContent: React.FC<ComputerContentProps> = ({ handleOpenWindow }) => {
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
  
  const handleIconClick = (iconId: string, path?: string) => {
    setSelectedIcon(iconId);
  };
  
  const handleIconDoubleClick = (iconId: string, path?: string) => {
    setSelectedIcon(iconId);
    handleOpenWindow(iconId, path);
  };
  // Each icon has its own URL that can be manually changed
  const iconImages = {
    home: "/assets/Icons/tinhatcat.webp",
    game: "/assets/Icons/illuminati.webp",
    shop: "/assets/Icons/illuminati.webp",
    growroom: "/assets/Icons/weed.png",
    wallet: "/assets/Icons/illuminati.webp",
    chat: "/assets/Icons/illuminati.webp",
    analytics: "/assets/Icons/illuminati.webp",
    help: "/assets/Icons/illuminati.webp"
  };

  const renderIcon = (iconKey: keyof typeof iconImages, fallback: React.ReactNode) => (
    <img 
      src={iconImages[iconKey]} 
      alt={`${iconKey}-icon`} 
      className="h-5 w-5 object-contain"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        // Use fallback icon when image fails to load
        if (target.parentNode && typeof fallback === 'object') {
          const fallbackElement = document.createElement('div');
          fallbackElement.className = "h-5 w-5 flex items-center justify-center";
          target.parentNode.appendChild(fallbackElement);
          // React component will be rendered separately
        }
      }}
    />
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">My Computer</h2>
      
      <div className="mb-4">
        <div className="win95-inset p-2 mb-4">
          <p className="text-sm">Welcome to My Computer. Double-click an icon to open the application.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" onClick={(e) => e.target === e.currentTarget && setSelectedIcon(null)}>
        <FileIcon 
          label="Home" 
          icon={renderIcon("home", <Home className="h-5 w-5" />)} 
          onClick={() => handleIconClick('home', '/')} 
          onDoubleClick={() => handleIconDoubleClick('home', '/')} 
          isSelected={selectedIcon === 'home'}
        />
        <FileIcon 
          label="Reptilian Attack" 
          icon={renderIcon("game", <Gamepad2 className="h-5 w-5" />)} 
          onClick={() => handleIconClick('game', '/game')} 
          onDoubleClick={() => handleIconDoubleClick('game', '/game')} 
          isSelected={selectedIcon === 'game'}
        />
        <FileIcon 
          label="NFT Shop" 
          icon={renderIcon("shop", <ShoppingCart className="h-5 w-5" />)} 
          onClick={() => handleIconClick('shop', '/shop')} 
          onDoubleClick={() => handleIconDoubleClick('shop', '/shop')} 
          isSelected={selectedIcon === 'shop'}
        />
        <FileIcon 
          label="THC Grow Room" 
          icon={renderIcon("growroom", <Cannabis className="h-5 w-5" />)} 
          onClick={() => handleIconClick('growroom', '/growroom')} 
          onDoubleClick={() => handleIconDoubleClick('growroom', '/growroom')} 
          isSelected={selectedIcon === 'growroom'}
        />
        <FileIcon 
          label="Wallet" 
          icon={renderIcon("wallet", <Wallet className="h-5 w-5" />)} 
          onClick={() => handleIconClick('wallet')} 
          onDoubleClick={() => handleIconDoubleClick('wallet')} 
          isSelected={selectedIcon === 'wallet'}
        />
        <FileIcon 
          label="Community Chat" 
          icon={renderIcon("chat", <MessageSquare className="h-5 w-5" />)} 
          onClick={() => handleIconClick('chat')} 
          onDoubleClick={() => handleIconDoubleClick('chat')} 
          isSelected={selectedIcon === 'chat'}
        />
        <FileIcon 
          label="Analytics" 
          icon={renderIcon("analytics", <BarChart2 className="h-5 w-5" />)} 
          onClick={() => handleIconClick('analytics', '/analytics')} 
          onDoubleClick={() => handleIconDoubleClick('analytics', '/analytics')} 
          isSelected={selectedIcon === 'analytics'}
        />
        <FileIcon 
          label="Help" 
          icon={renderIcon("help", <HelpCircle className="h-5 w-5" />)} 
          onClick={() => handleIconClick('help')} 
          onDoubleClick={() => alert('Help not available in this version!')} 
          isSelected={selectedIcon === 'help'}
        />
      </div>
    </div>
  );
};

export default ComputerContent;
