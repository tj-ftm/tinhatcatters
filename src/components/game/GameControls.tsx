
import React from 'react';
import { Button } from '@/components/ui/button';
import WalletConnector from '@/components/WalletConnector';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameControlsProps {
  gameState: GameState;
  startGame: () => Promise<boolean>;
  pauseGame: () => void;
  address: string | null;
}

const GAME_START_COST = 0.1;

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  startGame,
  pauseGame,
  address
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'flex justify-center' : ''}`}>
      {!gameState.gameStarted ? (
        <>
          {!address ? (
            <WalletConnector />
          ) : (
            <Button onClick={startGame} className="win95-button h-8 whitespace-nowrap text-xs">
              Start Game ({GAME_START_COST} $THC)
            </Button>
          )}
        </>
      ) : (
        <>
          {gameState.gameOver ? (
            <Button onClick={startGame} className="win95-button h-8 whitespace-nowrap text-xs">
              Play Again ({GAME_START_COST} $THC)
            </Button>
          ) : (
            <Button onClick={pauseGame} className="win95-button h-8 whitespace-nowrap text-xs">
              {gameState.paused ? "Resume" : "Pause"}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default GameControls;
