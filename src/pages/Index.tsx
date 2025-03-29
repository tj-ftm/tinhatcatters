
import React from 'react';
import WalletConnector from '../components/WalletConnector';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Sonic Sidescroller Adventure</h1>
          <p className="text-sm mb-4">Windows 95 Edition</p>
          
          <div className="animate-float mb-6">
            <img 
              src="/assets/sonic-logo.png" 
              alt="Sonic" 
              className="w-48 h-48 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><text x='20' y='100' font-size='24'>Sonic Logo</text></svg>";
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={() => navigate('/game')}
          >
            <span className="text-2xl mb-2">🎮</span>
            <span className="font-bold">Play Game</span>
            <span className="text-xs mt-1">Start your adventure!</span>
          </Button>
          
          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={() => navigate('/shop')}
          >
            <span className="text-2xl mb-2">🛒</span>
            <span className="font-bold">NFT Shop</span>
            <span className="text-xs mt-1">Buy awesome items!</span>
          </Button>
        </div>
        
        <div className="mt-6">
          <WalletConnector />
        </div>
      </div>
      
      <footer className="win95-panel p-2 text-center text-xs">
        Sonic Sidescroller Adventure - Windows 95 Edition - Copyright © 2023
      </footer>
    </div>
  );
};

export default Index;
