
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import { useGameState } from '@/hooks/useGameState';
import GameCanvas from '@/components/game/GameCanvas';
import GameStats from '@/components/game/GameStats';
import GameControls from '@/components/game/GameControls';
import GameUpgrades from '@/components/game/GameUpgrades';
import GameOverlay from '@/components/game/GameOverlay';
import { useIsMobile } from '@/hooks/use-mobile';

const Game: React.FC = () => {
  const { 
    gameState, 
    isLoading, 
    pendingAction, 
    updateGameState, 
    pauseGame, 
    startGame, 
    handleUpgrade,
    saveGameResults,
    address,
    currentPoints,
    upgradeCost
  } = useGameState();
  
  const [windowIsMaximized, setWindowIsMaximized] = useState(false);
  const gameEngineRef = useRef<ReptilianAttackEngine | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Save game results when game ends
  useEffect(() => {
    if (gameState.gameOver && gameState.pointsEarned > 0) {
      const pointsEarned = Math.floor(gameState.score / 10) + Math.floor(gameState.pointsEarned);
      saveGameResults(gameState.score, pointsEarned);
    }
  }, [gameState.gameOver, gameState.score, gameState.pointsEarned, saveGameResults]);

  return (
    <div className="win95-window w-full h-full overflow-hidden flex flex-col">
      <div className="p-2 bg-[#c0c0c0] flex flex-col h-full">
        <div className="w-full mb-2 win95-panel p-2">
          <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex flex-row justify-between'} items-center`}>
            <GameStats 
              gameState={gameState} 
              currentPoints={currentPoints}
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
        currentPoints={currentPoints}
        upgradeCost={upgradeCost}
      />
      
      <GameOverlay 
        isLoading={isLoading} 
        pendingAction={pendingAction} 
      />
    </div>
  );
};

export default Game;
