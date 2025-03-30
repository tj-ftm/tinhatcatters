
import React from 'react';
import { Home, Gamepad2, ShoppingCart, Cannabis, Wallet, HelpCircle, BarChart2, MessageSquare } from 'lucide-react';
import FileIcon from './FileIcon';

interface ComputerContentProps {
  handleOpenWindow: (windowId: string, path?: string) => void;
}

const ComputerContent: React.FC<ComputerContentProps> = ({ handleOpenWindow }) => {
  const getIconImage = (alt: string, fallback: React.ReactNode) => (
    <img 
      src="/assets/Icons/illuminati.webp" 
      alt={alt} 
      className="h-5 w-5 object-contain"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        const fallbackElement = document.createElement('div');
        if (typeof fallback === 'object') {
          target.style.display = 'none';
          return;
        }
        fallbackElement.innerHTML = typeof fallback === 'string' ? fallback : '🔍';
        if (target.parentNode) {
          target.parentNode.replaceChild(fallbackElement, target);
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
          icon={getIconImage("Home", <Home className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('home', '/')} 
        />
        <FileIcon 
          label="Reptilian Attack" 
          icon={getIconImage("Reptilian Attack", <Gamepad2 className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('game', '/game')} 
        />
        <FileIcon 
          label="NFT Shop" 
          icon={getIconImage("NFT Shop", <ShoppingCart className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('shop', '/shop')} 
        />
        <FileIcon 
          label="THC Grow Room" 
          icon={getIconImage("THC Grow Room", <Cannabis className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('growroom', '/growroom')} 
        />
        <FileIcon 
          label="Wallet" 
          icon={getIconImage("Wallet", <Wallet className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('wallet')} 
        />
        <FileIcon 
          label="Community Chat" 
          icon={getIconImage("Community Chat", <MessageSquare className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('chat')} 
        />
        <FileIcon 
          label="Analytics" 
          icon={getIconImage("Analytics", <BarChart2 className="h-5 w-5" />)} 
          onClick={() => handleOpenWindow('analytics', '/analytics')} 
        />
        <FileIcon 
          label="Help" 
          icon={getIconImage("Help", <HelpCircle className="h-5 w-5" />)} 
          onClick={() => alert('Help not available in this version!')} 
        />
      </div>
    </div>
  );
};

export default ComputerContent;
