
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WalletConnector from './WalletConnector';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Only show the exit button if we're not already on the homepage
  const showExitButton = location.pathname !== '/';
  
  const handleExit = () => {
    navigate('/');
  };
  
  return (
    <header className="win95-window sticky top-0 z-50">
      <div className="win95-title-bar flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://cdn3d.iconscout.com/3d/free/thumb/free-windows-2-4659893-3866197.png" 
            alt="TinHatCatters" 
            className="h-5 w-5 mr-2"
          />
          <span className="text-lg">Sonic Sidescroller Adventure</span>
        </div>
        <div className="flex items-center gap-2">
          {showExitButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleExit} 
              className="h-6 w-6 text-white hover:bg-red-500 hover:text-white"
              aria-label="Exit to homepage"
            >
              <X size={14} />
            </Button>
          )}
          <span className="text-xs opacity-75">Windows 95 Edition</span>
        </div>
      </div>
      
      <div className="p-2 flex flex-wrap justify-between items-center gap-2">
        <nav className="flex flex-wrap gap-2">
          <Link to="/" className="win95-button flex items-center">
            <img 
              src="https://cdn3d.iconscout.com/3d/free/thumb/free-home-3544420-2969700.png" 
              alt="Home" 
              className="h-4 w-4 mr-1"
            />
            Home
          </Link>
          <Link to="/game" className="win95-button flex items-center">
            <img 
              src="https://cdn3d.iconscout.com/3d/premium/thumb/game-controller-5679567-4730291.png" 
              alt="Game" 
              className="h-4 w-4 mr-1"
            />
            Play Game
          </Link>
          <Link to="/shop" className="win95-button flex items-center">
            <img 
              src="https://cdn3d.iconscout.com/3d/premium/thumb/shopping-cart-5679599-4730323.png" 
              alt="Shop" 
              className="h-4 w-4 mr-1"
            />
            NFT Shop
          </Link>
          <Link to="/growroom" className="win95-button flex items-center">
            <img 
              src="https://cdn3d.iconscout.com/3d/premium/thumb/cannabis-5679566-4730290.png" 
              alt="THC" 
              className="h-4 w-4 mr-1"
            />
            THC Grow Room
          </Link>
        </nav>
        
        <WalletConnector />
      </div>
    </header>
  );
};

export default Header;
