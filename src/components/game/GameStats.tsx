
import React from 'react';
import { Progress } from '@/components/ui/progress';
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
      <div className={`${isMobile ? 'flex flex-col gap-1 text-xs' : 'flex gap-4 text-sm'}`}>
        <div className="flex items-center">
          <span className="font-bold mr-1">Player:</span>
          <span className="text-blue-600">{displayName}</span>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
