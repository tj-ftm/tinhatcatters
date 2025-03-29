
import React, { useEffect, useRef, useState } from 'react';
import GameManager from '@/game/GameManager';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface GameUIProps {
  selectedPet: any | null;
}

const GameUI: React.FC<GameUIProps> = ({ selectedPet }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameManagerRef = useRef<GameManager | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();
  
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
  }, []);
  
  // Update game with selected pet
  useEffect(() => {
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
      <div className="win95-title-bar">
        <span>Sonic Sidescroller Adventure</span>
        <div className="flex gap-2">
          <button 
            className="text-white hover:text-gray-300"
            onClick={handlePauseToggle}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button 
            className="text-white hover:text-gray-300"
            onClick={handleRestart}
            aria-label="Restart"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative win95-panel">
        <div 
          id="game-container" 
          ref={gameContainerRef}
          className="w-full h-full"
        />
        
        {isPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="win95-window p-4 text-center">
              <h3 className="text-lg font-bold mb-4">Game Paused</h3>
              <Button 
                className="win95-button" 
                onClick={handlePauseToggle}
              >
                Resume Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameUI;
