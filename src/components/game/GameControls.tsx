
import React from 'react';
import { Button } from '@/components/ui/button';
import WalletConnector from '@/components/WalletConnector';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePoints } from '@/hooks/use-points';

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
  const { getPoints } = usePoints();
  
  return (
    <div className={`${isMobile ? 'flex flex-col gap-2 items-center' : 'flex gap-2 items-center'}`}>
      {!gameState.gameStarted ? (
        <>
          <Button onClick={startGame} className="win95-button h-8 whitespace-nowrap text-xs">
            Start Game (Free!)
          </Button>
          {address && (
            <div className="win95-panel p-2 h-8 flex items-center text-xs">
              <span className="font-bold text-yellow-600">
                Points: {getPoints(address)}
              </span>
            </div>
          )}
          {!address && <WalletConnector />}
        </>
      ) : (
        <>
          {gameState.gameOver ? (
            <>
              <Button onClick={startGame} className="win95-button h-8 whitespace-nowrap text-xs">
                Play Again (Free!)
              </Button>
              {address && (
                <div className="win95-panel p-2 h-8 flex items-center text-xs">
                  <span className="font-bold text-yellow-600">
                    Points: {getPoints(address)}
                  </span>
                </div>
              )}
            </>
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
