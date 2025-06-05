
import React, { useState } from 'react';
import WalletConnector from '../components/WalletConnector';
import WalletBar from '../components/WalletBar';
import ChatButton from '../components/ChatButton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Game from './Game';
import Shop from './Shop';
import Leaderboard from './Leaderboard';

// Configurable index page icon images
const INDEX_ICON_IMAGES = {
  logo: "/assets/game/reptilian-logo.png",
  game: "/assets/Icons/illuminati.webp",
  shop: "/assets/Icons/illuminati.webp",
  wallet: "/assets/Icons/illuminati.webp",
  chat: "/assets/Icons/illuminati.webp",
  leaderboard: "/assets/Icons/illuminati.webp"
};

const Index = () => {
  const navigate = useNavigate();
  const { address } = useWeb3();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const openGameDialog = () => setOpenDialog('game');
  const openShopDialog = () => setOpenDialog('shop');
  const openLeaderboardDialog = () => setOpenDialog('leaderboard');
  const closeDialog = () => setOpenDialog(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Wallet Bar - only show when wallet is connected */}
        {address && (
          <div className="w-full max-w-4xl mb-6">
            <WalletBar />
          </div>
        )}
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Reptilian Attack</h1>
          <p className="text-sm mb-4">Windows 95 Edition</p>
          
          <div className="animate-float mb-6">
            <img 
              src={INDEX_ICON_IMAGES.logo} 
              alt="Reptilian" 
              className="w-48 h-48 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><text x='20' y='100' font-size='24'>Reptilian Attack</text></svg>";
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={openGameDialog}
          >
            <img 
              src={INDEX_ICON_IMAGES.game} 
              alt="Game" 
              className="h-8 w-8 mb-2 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const container = target.parentElement;
                if (container) {
                  const fallback = document.createElement('span');
                  fallback.textContent = '🎮';
                  fallback.className = 'text-2xl mb-2';
                  container.insertBefore(fallback, container.firstChild);
                }
              }}
            />
            <span className="font-bold">Play Game</span>
            <span className="text-xs mt-1">Free to play! Earn points!</span>
          </Button>
          
          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={openShopDialog}
          >
            <img 
              src={INDEX_ICON_IMAGES.shop} 
              alt="Shop" 
              className="h-8 w-8 mb-2 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const container = target.parentElement;
                if (container) {
                  const fallback = document.createElement('span');
                  fallback.textContent = '🛒';
                  fallback.className = 'text-2xl mb-2';
                  container.insertBefore(fallback, container.firstChild);
                }
              }}
            />
            <span className="font-bold">NFT Shop</span>
            <span className="text-xs mt-1">Buy awesome items!</span>
          </Button>

          <Button 
            className="win95-button h-auto py-4 flex flex-col items-center"
            onClick={openLeaderboardDialog}
          >
            <img 
              src={INDEX_ICON_IMAGES.leaderboard} 
              alt="Leaderboard" 
              className="h-8 w-8 mb-2 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const container = target.parentElement;
                if (container) {
                  const fallback = document.createElement('span');
                  fallback.textContent = '🏆';
                  fallback.className = 'text-2xl mb-2';
                  container.insertBefore(fallback, container.firstChild);
                }
              }}
            />
            <span className="font-bold">Leaderboard</span>
            <span className="text-xs mt-1">See top players!</span>
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

      {/* Game Dialog */}
      <Dialog open={openDialog === 'game'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
          <Game />
        </DialogContent>
      </Dialog>

      {/* Shop Dialog */}
      <Dialog open={openDialog === 'shop'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
          <Shop />
        </DialogContent>
      </Dialog>

      {/* Leaderboard Dialog */}
      <Dialog open={openDialog === 'leaderboard'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <Leaderboard />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
