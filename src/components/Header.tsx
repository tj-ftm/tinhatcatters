
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
        <span className="text-lg">Sonic Sidescroller Adventure</span>
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
          <Link to="/" className="win95-button">
            Home
          </Link>
          <Link to="/game" className="win95-button">
            Play Game
          </Link>
          <Link to="/shop" className="win95-button">
            NFT Shop
          </Link>
          <Link to="/growroom" className="win95-button">
            THC Grow Room
          </Link>
        </nav>
        
        <WalletConnector />
      </div>
    </header>
  );
};

export default Header;
