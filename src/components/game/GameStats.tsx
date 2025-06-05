
import React from 'react';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNickname } from '@/hooks/useNickname';

interface GameStatsProps {
  gameState: GameState;
  currentPoints: number;
  address: string | null;
}

const GameStats: React.FC<GameStatsProps> = ({ 
  gameState, 
  currentPoints,
  address 
}) => {
  const isMobile = useIsMobile();
  const { nickname, getNickname } = useNickname();
  
  const displayName = address && nickname ? nickname : address ? getNickname(address) : 'Guest Player';

  return (
    <div className={`${isMobile ? 'w-full' : ''}`}>
      <div className={`${isMobile ? 'grid grid-cols-2 gap-2 text-xs' : 'flex gap-4 text-sm'}`}>
        <div className="flex items-center">
          <span className="font-bold mr-1">Player:</span>
          <span className="text-blue-600">{displayName}</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-bold mr-1">Score:</span>
          <span className="text-green-600">{gameState.score}</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-bold mr-1">Lives:</span>
          <span className="text-red-600">{gameState.lives}</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-bold mr-1">Health:</span>
          <span className="text-purple-600">{gameState.health}%</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-bold mr-1">Points:</span>
          <span className="text-yellow-600">{currentPoints}</span>
        </div>
        
        {gameState.gameStarted && (
          <div className="flex items-center">
            <span className="font-bold mr-1">Earned:</span>
            <span className="text-orange-600">{Math.floor(gameState.pointsEarned + gameState.score / 10)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;
