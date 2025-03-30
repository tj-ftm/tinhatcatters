
import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { GameState } from '@/hooks/useGameState';

interface GameControlsProps {
  isPaused?: boolean;
  handlePauseToggle?: () => void;
  handleRestart?: () => void;
  // Add the props that are passed from Game.tsx
  gameState?: GameState;
  startGame?: () => Promise<boolean>;
  pauseGame?: () => void;
  address?: string;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  isPaused, 
  handlePauseToggle, 
  handleRestart,
  gameState,
  startGame,
  pauseGame,
  address
}) => {
  // If we have the newer props (from Game.tsx), use those
  const isGamePaused = gameState ? gameState.paused : isPaused;
  
  const onPauseToggle = () => {
    if (pauseGame) {
      pauseGame();
    } else if (handlePauseToggle) {
      handlePauseToggle();
    }
  };
  
  const onRestart = () => {
    if (startGame) {
      startGame();
    } else if (handleRestart) {
      handleRestart();
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        className="text-white hover:text-gray-300"
        onClick={onPauseToggle}
        aria-label={isGamePaused ? 'Resume' : 'Pause'}
      >
        {isGamePaused ? <Play size={14} /> : <Pause size={14} />}
      </button>
      <button 
        className="text-white hover:text-gray-300"
        onClick={onRestart}
        aria-label="Restart"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
};

export default GameControls;
