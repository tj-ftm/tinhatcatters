
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '@/hooks/useGameState';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';

interface GameCanvasProps {
  gameState: GameState;
  updateGameState: (newState: Partial<GameState>) => void;
  windowIsMaximized: boolean;
  setWindowIsMaximized: (maximized: boolean) => void;
  gameEngineRef: React.MutableRefObject<ReptilianAttackEngine | null>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  updateGameState,
  windowIsMaximized,
  setWindowIsMaximized,
  gameEngineRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new ReptilianAttackEngine(canvasRef.current);
      
      gameEngineRef.current.onStateUpdate = (newState: Partial<GameState>) => {
        updateGameState(newState);
      };

      gameEngineRef.current.onGameOver = (finalScore: number, earnedPoints: number) => {
        updateGameState({
          gameOver: true,
          score: finalScore,
          pointsEarned: earnedPoints
        });
      };
    }
  }, [updateGameState, gameEngineRef]);

  useEffect(() => {
    if (gameEngineRef.current) {
      if (gameState.gameStarted && !gameState.gameOver) {
        gameEngineRef.current.start(gameState.upgrades);
      } else if (gameState.paused) {
        gameEngineRef.current.pause();
      } else if (!gameState.paused && gameState.gameStarted) {
        gameEngineRef.current.resume();
      }
    }
  }, [gameState.gameStarted, gameState.paused, gameState.gameOver, gameState.upgrades]);

  const handleMaximize = () => {
    setWindowIsMaximized(!windowIsMaximized);
    if (!windowIsMaximized) {
      setCanvasSize({ width: window.innerWidth - 100, height: window.innerHeight - 150 });
    } else {
      setCanvasSize({ width: 800, height: 600 });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black border-2 border-gray-400 win95-inset overflow-hidden">
      <div className="bg-[#c0c0c0] p-1 flex justify-between items-center text-xs">
        <span>Reptilian Attack</span>
        <button 
          onClick={handleMaximize}
          className="win95-button px-2 py-0 text-xs"
        >
          {windowIsMaximized ? '□' : '▢'}
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-black p-2">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border border-gray-600 bg-gradient-to-b from-blue-900 to-purple-900"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export default GameCanvas;
