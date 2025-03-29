
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
            src="/favicon.png" 
            alt="TinHatCatters" 
            className="h-5 w-5 mr-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" fill="lightgray"/></svg>';
            }}
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
              src="/favicon.png" 
              alt="Home" 
              className="h-4 w-4 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="darkgray"/><text x="8" y="9" font-family="sans-serif" font-size="8" text-anchor="middle" fill="white">H</text></svg>';
              }}
            />
            Home
          </Link>
          <Link to="/game" className="win95-button flex items-center">
            <img 
              src="/windows-logo.svg" 
              alt="Game" 
              className="h-4 w-4 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="darkgray"/><text x="8" y="9" font-family="sans-serif" font-size="8" text-anchor="middle" fill="white">G</text></svg>';
              }}
            />
            Play Game
          </Link>
          <Link to="/shop" className="win95-button flex items-center">
            <img 
              src="/windows-logo.svg" 
              alt="Shop" 
              className="h-4 w-4 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="darkgray"/><text x="8" y="9" font-family="sans-serif" font-size="8" text-anchor="middle" fill="white">S</text></svg>';
              }}
            />
            NFT Shop
          </Link>
          <Link to="/growroom" className="win95-button flex items-center">
            <img 
              src="/windows-logo.svg" 
              alt="THC" 
              className="h-4 w-4 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="darkgray"/><text x="8" y="9" font-family="sans-serif" font-size="8" text-anchor="middle" fill="white">T</text></svg>';
              }}
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
