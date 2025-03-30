
import React, { useRef, useEffect } from 'react';
import GameManager from '@/game/GameManager';
import { GameState } from '@/hooks/useGameState';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';

interface GameCanvasProps {
  gameManagerRef?: React.MutableRefObject<GameManager | null>;
  isPaused?: boolean;
  isUploading?: boolean;
  // Add props from Game.tsx
  gameState?: GameState;
  updateGameState?: (newState: Partial<GameState>) => void;
  windowIsMaximized?: boolean;
  setWindowIsMaximized?: React.Dispatch<React.SetStateAction<boolean>>;
  gameEngineRef?: React.MutableRefObject<ReptilianAttackEngine | null>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameManagerRef, 
  isPaused, 
  isUploading,
  gameState,
  updateGameState,
  windowIsMaximized,
  setWindowIsMaximized,
  gameEngineRef
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Initialize game on component mount - only when gameManagerRef is provided
  useEffect(() => {
    if (gameManagerRef && !gameManagerRef.current) {
      gameManagerRef.current = new GameManager();
    }
    
    if (gameManagerRef && gameContainerRef.current) {
      gameManagerRef.current?.initialize('game-container');
    }
    
    // Cleanup on unmount
    return () => {
      if (gameManagerRef && gameManagerRef.current) {
        gameManagerRef.current.destroy();
      }
    };
  }, [gameManagerRef]);

  // Add effect for gameEngineRef if needed
  useEffect(() => {
    // Add initialization logic for Reptilian Attack Engine if needed
    // This would depend on how the gameEngineRef is meant to be initialized
  }, [gameEngineRef, gameState]);

  return (
    <div 
      id="game-container" 
      ref={gameContainerRef}
      className="w-full h-full"
    >
      {isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="win95-window p-4 text-center">
            <h3 className="text-lg font-bold mb-4">Game Paused</h3>
            <button className="win95-button" onClick={() => gameManagerRef?.current?.resume()}>
              Resume Game
            </button>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="win95-window p-4 text-center">
            <h3 className="text-lg font-bold mb-4">Processing Image...</h3>
            <div className="animate-pulse">Please wait</div>
          </div>
        </div>
      )}

      {/* Additional canvas-related UI can be added here */}
    </div>
  );
};

export default GameCanvas;
