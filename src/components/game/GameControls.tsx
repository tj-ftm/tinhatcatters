
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

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  startGame,
  pauseGame,
  address
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'flex flex-col gap-2 items-center' : 'flex gap-2 items-center'}`}>
      {!gameState.gameStarted ? (
        <>
          <Button onClick={startGame} className="win95-button h-8 whitespace-nowrap text-xs">
            Start Game (Free!)
          </Button>
          {!address && <WalletConnector />}
        </>
      ) : (
        <>
          {gameState.gameOver ? (
            <Button onClick={startGame} className="win95-button h-8 whitespace-nowrap text-xs">
              Play Again (Free!)
            </Button>
          ) : (
            <Button onClick={pauseGame} className="win95-button h-8 whitespace-nowrap text-xs">
              {gameState.paused ? "Resume" : "Pause"}
            </Button>
          )}
        </>
      )}
      
      {!gameState.gameStarted && address && (
        <div className="text-xs text-gray-600">
          Connected • Scores will be saved
        </div>
      )}
    </div>
  );
};

export default GameControls;
