
import React, { useRef, useState } from 'react';
import GameManager from '@/game/GameManager';
import { useToast } from '@/hooks/use-toast';
import GameCanvas from './GameCanvas';
import GameControls from './GameControls';
import GameImageUploader from './GameImageUploader';

interface GameUIProps {
  selectedPet: any | null;
}

const GameUI: React.FC<GameUIProps> = ({ selectedPet }) => {
  const gameManagerRef = useRef<GameManager | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  // Update game with selected pet
  React.useEffect(() => {
    if (gameManagerRef.current && selectedPet) {
      gameManagerRef.current.setPet(selectedPet);
      toast({
        title: 'Pet Active',
        description: `${selectedPet.name} is now following you in the game!`
      });
    }
  }, [selectedPet, toast]);
  
  // Handle pause/resume
  const handlePauseToggle = () => {
    if (!gameManagerRef.current) return;
    
    if (isPaused) {
      gameManagerRef.current.resume();
    } else {
      gameManagerRef.current.pause();
    }
    
    setIsPaused(!isPaused);
  };
  
  // Handle restart
  const handleRestart = () => {
    if (!gameManagerRef.current) return;
    
    gameManagerRef.current.restart();
    setIsPaused(false);
    
    toast({
      title: 'Game Restarted',
      description: 'The game has been restarted.'
    });
  };
  
  // Use snack in game
  const useSnack = (snackId: string) => {
    if (!gameManagerRef.current) return false;
    
    return gameManagerRef.current.useSnack(snackId);
  };
  
  return (
    <div className="win95-window w-full h-full flex flex-col">
      <div className="win95-title-bar flex justify-between items-center">
        <span>Sonic Sidescroller Adventure</span>
        <GameControls 
          isPaused={isPaused}
          handlePauseToggle={handlePauseToggle}
          handleRestart={handleRestart}
        />
      </div>
      
      <div className="flex-1 relative win95-panel">
        <GameCanvas 
          gameManagerRef={gameManagerRef}
          isPaused={isPaused}
          isUploading={isUploading}
        />
        
        <GameImageUploader 
          gameManagerRef={gameManagerRef}
          setIsUploading={setIsUploading}
        />
      </div>
    </div>
  );
};

export default GameUI;
