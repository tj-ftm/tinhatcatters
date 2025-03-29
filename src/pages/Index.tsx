
import React from 'react';
import WalletConnector from '../components/WalletConnector';
import ChatButton from '../components/ChatButton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Reptilian Attack</h1>
          <p className="text-sm mb-4">Windows 95 Edition</p>
          
          <div className="animate-float mb-6">
            <img 
              src="/assets/game/reptilian-logo.png" 
              alt="Reptilian" 
              className="w-48 h-48 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><text x='20' y='100' font-size='24'>Reptilian Attack</text></svg>";
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={() => navigate('/game')}
          >
            <img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="Game" className="w-8 h-8 mb-2" />
            <span className="font-bold">Play Game</span>
            <span className="text-xs mt-1">Start your adventure!</span>
          </Button>
          
          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={() => navigate('/shop')}
          >
            <img src="/lovable-uploads/e03a9f53-e89d-4a06-aa83-0c24bf7db8db.jpg" alt="Shop" className="w-8 h-8 mb-2" />
            <span className="font-bold">NFT Shop</span>
            <span className="text-xs mt-1">Buy awesome items!</span>
          </Button>
          
          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={() => navigate('/growroom')}
          >
            <img src="/lovable-uploads/a55fa30c-e72d-45cc-a0fa-02d7143baa9b.jpg" alt="THC" className="w-8 h-8 mb-2" />
            <span className="font-bold">THC Grow Room</span>
            <span className="text-xs mt-1">Grow plants & earn $THC!</span>
          </Button>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <WalletConnector />
          <ChatButton />
        </div>
      </div>
      
      <footer className="win95-panel p-2 text-center text-xs">
        Reptilian Attack - Windows 95 Edition - Copyright © 2023
      </footer>
    </div>
  );
};

export default Index;
