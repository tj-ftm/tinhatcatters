
import React from 'react';
import { Home, Gamepad2, ShoppingCart, Cannabis, Wallet, HelpCircle, BarChart2, MessageSquare } from 'lucide-react';
import FileIcon from './FileIcon';

interface ComputerContentProps {
  handleOpenWindow: (windowId: string, path?: string) => void;
}

const ComputerContent: React.FC<ComputerContentProps> = ({ handleOpenWindow }) => {
  // Each icon has its own URL that can be manually changed
  const iconImages = {
    home: "/assets/Icons/tinhatcat.webp",
    game: "/assets/Icons/illuminati.webp",
    shop: "/assets/Icons/illuminati.webp",
    growroom: "/assets/Icons/illuminati.webp",
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <FileIcon 
          label="Home" 
          icon={renderIcon("home", <Home className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('home', '/')} 
        />
        <FileIcon 
          label="Reptilian Attack" 
          icon={renderIcon("game", <Gamepad2 className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('game', '/game')} 
        />
        <FileIcon 
          label="NFT Shop" 
          icon={renderIcon("shop", <ShoppingCart className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('shop', '/shop')} 
        />
        <FileIcon 
          label="THC Grow Room" 
          icon={renderIcon("growroom", <Cannabis className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('growroom', '/growroom')} 
        />
        <FileIcon 
          label="Wallet" 
          icon={renderIcon("wallet", <Wallet className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('wallet')} 
        />
        <FileIcon 
          label="Community Chat" 
          icon={renderIcon("chat", <MessageSquare className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('chat')} 
        />
        <FileIcon 
          label="Analytics" 
          icon={renderIcon("analytics", <BarChart2 className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('analytics', '/analytics')} 
        />
        <FileIcon 
          label="Help" 
          icon={renderIcon("help", <HelpCircle className="h-5 w-5" />)} 
          onClick={() => alert('Help not available in this version!')} 
        />
      </div>
    </div>
  );
};

export default ComputerContent;
