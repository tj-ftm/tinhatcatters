
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import { useGameState } from '@/hooks/useGameState';
import GameCanvas from '@/components/game/GameCanvas';
import GameStats from '@/components/game/GameStats';
import GameControls from '@/components/game/GameControls';
import GameUpgrades from '@/components/game/GameUpgrades';
import GameOverlay from '@/components/game/GameOverlay';

const Game: React.FC = () => {
  const { 
    gameState, 
    isLoading, 
    pendingAction, 
    updateGameState, 
    pauseGame, 
    startGame, 
    handleUpgrade,
    address,
    thcBalance
  } = useGameState();
  
  const [windowIsMaximized, setWindowIsMaximized] = useState(false);
  const gameEngineRef = useRef<ReptilianAttackEngine | null>(null);
  const { toast } = useToast();

  // Show notification when THC is earned
  useEffect(() => {
    if (gameState.gameOver && gameState.thcEarned > 0 && address) {
      toast({
        title: "Crypto Earned!",
        description: `${gameState.thcEarned.toFixed(2)} $THC added to your wallet!`,
      });
    }
  }, [gameState.gameOver, gameState.thcEarned, address, toast]);

  return (
    <div className="win95-window w-full h-full overflow-hidden flex flex-col">
      <div className="p-2 bg-[#c0c0c0] flex flex-col h-full">
        <div className="w-full mb-2 win95-panel p-2">
          <div className="flex flex-row justify-between items-center">
            <GameStats 
              gameState={gameState} 
              thcBalance={thcBalance} 
              address={address} 
            />
            
            <GameControls 
              gameState={gameState} 
              startGame={startGame} 
              pauseGame={pauseGame} 
              address={address} 
            />
          </div>
        </div>

        <GameCanvas 
          gameState={gameState} 
          updateGameState={updateGameState}
          windowIsMaximized={windowIsMaximized}
          setWindowIsMaximized={setWindowIsMaximized}
          gameEngineRef={gameEngineRef}
        />
      </div>
      
      <GameUpgrades 
        gameState={gameState} 
        handleUpgrade={handleUpgrade} 
      />
      
      <GameOverlay 
        isLoading={isLoading} 
        pendingAction={pendingAction} 
      />
    </div>
  );
};

export default Game;
