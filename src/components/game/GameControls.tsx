
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import WalletConnector from '@/components/WalletConnector';
import NicknameDialog from '@/components/NicknameDialog';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNickname } from '@/hooks/useNickname';
import { User } from 'lucide-react';

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
  const { hasNickname } = useNickname();
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  
  return (
    <div className={`${isMobile ? 'flex flex-col gap-2 items-center' : 'flex gap-2 items-center'}`}>
      {!gameState.gameStarted ? (
        <>
          <Button onClick={startGame} className="win95-button h-8 whitespace-nowrap text-xs">
            Start Game (Free!)
          </Button>
          {address && (
            <Button 
              onClick={() => setShowNicknameDialog(true)}
              className="win95-button h-8 whitespace-nowrap text-xs flex items-center gap-1"
              variant={hasNickname ? "default" : "outline"}
            >
              <User size={12} />
              {hasNickname ? "Edit Nickname" : "Set Nickname"}
            </Button>
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
                <Button 
                  onClick={() => setShowNicknameDialog(true)}
                  className="win95-button h-8 whitespace-nowrap text-xs flex items-center gap-1"
                >
                  <User size={12} />
                  {hasNickname ? "Edit Nickname" : "Set Nickname"}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={pauseGame} className="win95-button h-8 whitespace-nowrap text-xs">
              {gameState.paused ? "Resume" : "Pause"}
            </Button>
          )}
        </>
      )}
      
      <NicknameDialog 
        open={showNicknameDialog} 
        onOpenChange={setShowNicknameDialog} 
      />
    </div>
  );
};

export default GameControls;
