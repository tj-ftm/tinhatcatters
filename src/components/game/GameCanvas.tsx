
import React, { useRef, useEffect } from 'react';
import GameManager from '@/game/GameManager';

interface GameCanvasProps {
  gameManagerRef: React.MutableRefObject<GameManager | null>;
  isPaused: boolean;
  isUploading: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameManagerRef, isPaused, isUploading }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Initialize game on component mount
  useEffect(() => {
    if (!gameManagerRef.current) {
      gameManagerRef.current = new GameManager();
    }
    
    if (gameContainerRef.current) {
      gameManagerRef.current.initialize('game-container');
    }
    
    // Cleanup on unmount
    return () => {
      if (gameManagerRef.current) {
        gameManagerRef.current.destroy();
      }
    };
  }, [gameManagerRef]);

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
            <button className="win95-button" onClick={() => gameManagerRef.current?.resume()}>
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
    </div>
  );
};

export default GameCanvas;
