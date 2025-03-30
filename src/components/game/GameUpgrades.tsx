
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Heart } from 'lucide-react';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameUpgradesProps {
  gameState: GameState;
  handleUpgrade: (upgradeType: 'speed' | 'fireRate' | 'health') => Promise<void>;
}

const GAME_ICON_IMAGES = {
  speed: "/assets/Icons/illuminati.webp",
  fireRate: "/assets/Icons/illuminati.webp",
  health: "/assets/Icons/illuminati.webp"
};

const GameUpgrades: React.FC<GameUpgradesProps> = ({ gameState, handleUpgrade }) => {
  const isMobile = useIsMobile();

  return (
    <div className="win95-panel p-1 w-full mt-auto bg-[#c0c0c0] overflow-x-auto">
      <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex justify-center gap-2 items-center h-8'}`}>
        <span className="font-bold text-black text-sm mr-1">Upgrades:</span>
        
        <div className={`win95-inset p-1 ${isMobile ? 'flex flex-col gap-2' : 'flex flex-row items-center gap-2'} w-full min-w-0 ${isMobile ? '' : 'h-6'}`}>
          <div className={`${isMobile ? 'flex' : 'flex flex-1'} items-center gap-1 min-w-0`}>
            <img 
              src={GAME_ICON_IMAGES.speed} 
              alt="Speed" 
              className="h-4 w-4 object-contain shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback to Lucide icon
                const iconContainer = target.parentElement;
                if (iconContainer) {
                  const iconElement = document.createElement('span');
                  iconContainer.appendChild(iconElement);
                }
              }}
            />
            <Zap size={16} className="text-yellow-500 shrink-0" style={{ display: 'none' }} />
            <div className="flex-1 min-w-0">
              <div className="w-full h-3 win95-inset overflow-hidden">
                <div 
                  className="h-full bg-yellow-500"
                  style={{ width: `${(gameState.upgrades.speed - 1) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-black whitespace-nowrap shrink-0">Speed: x{gameState.upgrades.speed.toFixed(2)}</span>
            <Button onClick={() => handleUpgrade('speed')} className="win95-button text-xs py-0 h-6 whitespace-nowrap shrink-0">
              + (0.5 $THC)
            </Button>
          </div>
          
          <div className={`${isMobile ? 'flex' : 'flex flex-1'} items-center gap-1 min-w-0`}>
            <img 
              src={GAME_ICON_IMAGES.fireRate} 
              alt="Fire Rate" 
              className="h-4 w-4 object-contain shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Show Shield icon as fallback
                const shieldIcon = target.parentElement?.querySelector('.lucide-shield');
                if (shieldIcon) {
                  (shieldIcon as HTMLElement).style.display = 'block';
                }
              }}
            />
            <Shield size={16} className="text-blue-500 shrink-0" style={{ display: 'none' }} />
            <div className="flex-1 min-w-0">
              <div className="w-full h-3 win95-inset overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(gameState.upgrades.fireRate - 1) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-black whitespace-nowrap shrink-0">Fire: x{gameState.upgrades.fireRate.toFixed(2)}</span>
            <Button onClick={() => handleUpgrade('fireRate')} className="win95-button text-xs py-0 h-6 whitespace-nowrap shrink-0">
              + (0.5 $THC)
            </Button>
          </div>
          
          <div className={`${isMobile ? 'flex' : 'flex flex-1'} items-center gap-1 min-w-0`}>
            <img 
              src={GAME_ICON_IMAGES.health} 
              alt="Health" 
              className="h-4 w-4 object-contain shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Show Heart icon as fallback
                const heartIcon = target.parentElement?.querySelector('.lucide-heart');
                if (heartIcon) {
                  (heartIcon as HTMLElement).style.display = 'block';
                }
              }}
            />
            <Heart size={16} className="text-red-500 shrink-0" style={{ display: 'none' }} />
            <div className="flex-1 min-w-0">
              <div className="w-full h-3 win95-inset overflow-hidden">
                <div 
                  className="h-full bg-red-500"
                  style={{ width: `${(gameState.upgrades.health - 1) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-black whitespace-nowrap shrink-0">Health: x{gameState.upgrades.health.toFixed(2)}</span>
            <Button onClick={() => handleUpgrade('health')} className="win95-button text-xs py-0 h-6 whitespace-nowrap shrink-0">
              + (0.5 $THC)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUpgrades;
