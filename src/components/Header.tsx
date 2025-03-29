
import React from 'react';
import { Link } from 'react-router-dom';
import WalletConnector from './WalletConnector';

const Header: React.FC = () => {
  return (
    <header className="win95-window sticky top-0 z-50">
      <div className="win95-title-bar flex justify-between items-center">
        <span className="text-lg">Sonic Sidescroller Adventure</span>
        <span className="text-xs opacity-75">Windows 95 Edition</span>
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
        </nav>
        
        <WalletConnector />
      </div>
    </header>
  );
};

export default Header;
