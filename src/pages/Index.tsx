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

// Configurable index page icon images with placeholder links
const INDEX_ICON_IMAGES = {
  logo: "/assets/game/reptilian-logo.png",
  game: "/assets/Icons/illuminati.webp",
  shop: "/assets/Icons/illuminati.webp",
  wallet: "/assets/Icons/illuminati.webp",
  chat: "/assets/Icons/illuminati.webp",
  leaderboard: "/assets/Icons/illuminati.webp",
  analytics: "/assets/Icons/illuminati.webp"
};

// Placeholder links for external pages
const EXTERNAL_LINKS = {
  analytics: "https://analytics.reptilianattack.com",
  community: "https://community.reptilianattack.com",
  settings: "https://settings.reptilianattack.com"
};

const Index = () => {
  const navigate = useNavigate();
  const { address } = useWeb3();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [clickedIcon, setClickedIcon] = useState<string | null>(null);

  const openGameDialog = () => setOpenDialog('game');
  const openShopDialog = () => setOpenDialog('shop');
  const openLeaderboardDialog = () => setOpenDialog('leaderboard');
  const closeDialog = () => setOpenDialog(null);

  // Handle icon click with animation
  const handleIconClick = (icon: string, action: () => void) => {
    setClickedIcon(icon);
    setTimeout(() => {
      setClickedIcon(null);
      action();
    }, 200); // Animation duration
  };

  // Handle external link navigation
  const handleExternalLink = (url: string) => {
    setClickedIcon(url);
    setTimeout(() => {
      setClickedIcon(null);
      window.open(url, '_blank');
    }, 200);
  };

  return (
    <div className="flex flex-col h-full bg-win95-teal">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Wallet Bar - only show when wallet is connected */}
        {address && (
          <div className="w-full max-w-4xl mb-6">
            <WalletBar />
          </div>
        )}
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2 text-win95-gray-dark">Welcome to Reptilian Run</h1>
          <p className="text-sm mb-4 text-win95-gray">Windows 95 Edition</p>
          
          <div className="flex justify-center items-center w-full max-w-4xl mx-auto mb-6 p-4 bg-gray-800 rounded-lg">
            <video 
              src="/assets/Icons/player_idle.webm" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-64 h-48 object-contain"
            />
            <video 
              src="/assets/game/reptilianrun.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-64 h-48 object-contain"
            />
            <video 
              src="/assets/Icons/Reptile_running.webm" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-64 h-48 object-contain"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
          {[
            { id: 'game', label: 'Play Game', desc: 'Free to play! Earn points!', icon: INDEX_ICON_IMAGES.game, action: openGameDialog },
            { id: 'shop', label: 'NFT Shop', desc: 'Buy awesome items!', icon: INDEX_ICON_IMAGES.shop, action: openShopDialog },
            { id: 'leaderboard', label: 'Leaderboard', desc: 'See top players!', icon: INDEX_ICON_IMAGES.leaderboard, action: openLeaderboardDialog },
            { id: 'analytics', label: 'Analytics', desc: 'View game stats', icon: INDEX_ICON_IMAGES.analytics, link: EXTERNAL_LINKS.analytics },
            { id: 'community', label: 'Community', desc: 'Join the discussion', icon: INDEX_ICON_IMAGES.chat, link: EXTERNAL_LINKS.community },
            { id: 'settings', label: 'Settings', desc: 'Customize your experience', icon: INDEX_ICON_IMAGES.wallet, link: EXTERNAL_LINKS.settings },
          ].map(({ id, label, desc, icon, action, link }) => (
            <Button 
              key={id}
              className={`
                win95-button h-auto py-4 flex flex-col items-center
                ${clickedIcon === (link || id) ? 'animate-icon-click' : ''}
                hover:bg-win95-gray-light hover:shadow-win95-inner
                focus:bg-win95-gray-light focus:shadow-win95-inner
                transition-all duration-200
              `}
              onClick={() => link ? handleExternalLink(link) : handleIconClick(id, action)}
            >
              <img 
                src={icon} 
                alt={label} 
                className="h-8 w-8 mb-2 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const container = target.parentElement;
                  if (container) {
                    const fallback = document.createElement('span');
                    fallback.textContent = {
                      game: '🎮',
                      shop: '🛒',
                      leaderboard: '🏆',
                      analytics: '📊',
                      community: '💬',
                      settings: '⚙️'
                    }[id] || '❓';
                    fallback.className = 'text-2xl mb-2';
                    container.insertBefore(fallback, container.firstChild);
                  }
                }}
              />
              <span className="font-bold text-win95-gray-dark">{label}</span>
              <span className="text-xs mt-1 text-win95-gray">{desc}</span>
            </Button>
          ))}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <WalletConnector />
          <ChatButton />
        </div>
      </div>
      
      <footer className="win95-panel p-2 text-center text-xs text-win95-gray">
        Reptilian Run - Windows 95 Edition - Copyright © 2023
      </footer>

      {/* Dialogs remain unchanged */}
      <Dialog open={openDialog === 'game'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
          <Game />
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'shop'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
          <Shop />
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'leaderboard'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <Leaderboard />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;