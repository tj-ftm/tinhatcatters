
import React from 'react';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameStatsProps {
  gameState: GameState;
  thcBalance: string | null;
  address: string | null;
}

const GameStats: React.FC<GameStatsProps> = ({ 
  gameState, 
  thcBalance,
  address
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex justify-between items-center'}`}>
      <div className={`${isMobile ? 'flex justify-between' : 'flex items-center gap-2'}`}>
        <div className="win95-inset px-3 py-1 flex items-center">
          <span className="font-bold mr-2 text-black">Score:</span>
          <span className="text-black">{gameState.score}</span>
        </div>
        
        <div className="win95-inset px-3 py-1 flex items-center">
          <span className="font-bold mr-2 text-black">Lives:</span>
          <span className="text-black">{gameState.lives}</span>
        </div>
        
        <div className="win95-inset px-3 py-1 flex items-center gap-1">
          <span className="font-bold mr-1 text-black">Health:</span>
          <div className="w-24 h-4 win95-inset overflow-hidden">
            <div 
              className={`h-full ${gameState.health > 30 ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${gameState.health}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className={`${isMobile ? 'flex justify-between mt-2' : 'flex items-center gap-2'}`}>
        {address && (
          <div className="win95-inset px-3 py-1">
            <span className="font-bold mr-1 text-black">THC:</span>
            <span className="text-black">{thcBalance || '0'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;
