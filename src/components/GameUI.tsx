
import React, { useEffect, useRef, useState } from 'react';
import GameManager from '@/game/GameManager';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RefreshCw, Upload } from 'lucide-react';

interface GameUIProps {
  selectedPet: any | null;
}

const GameUI: React.FC<GameUIProps> = ({ selectedPet }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameManagerRef = useRef<GameManager | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
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
  
  // Handle player sprite upload
  const handlePlayerSpriteUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Process the uploaded image file with error handling
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        if (gameManagerRef.current) {
          // Validate image first
          const isValid = await gameManagerRef.current.preloadImage(imageUrl);
          
          if (!isValid) {
            toast({
              title: 'Invalid Image',
              description: 'The image could not be loaded. Please try another image.',
              variant: 'destructive'
            });
            setIsUploading(false);
            return;
          }
          
          // Get access to the reptilian attack engine instance
          const gameScene = gameManagerRef.current?.getGame()?.scene?.getScene('GameScene');
          if (gameScene) {
            try {
              // Set the player sprite image
              const engine = (gameScene as any).reptilianEngine;
              if (engine && engine.setPlayerSprite) {
                engine.setPlayerSprite(imageUrl, 50, 70);
                toast({
                  title: 'Sprite Updated',
                  description: 'Player sprite has been updated successfully.'
                });
              } else {
                throw new Error('Game engine not initialized properly');
              }
            } catch (error) {
              console.error('Error updating player sprite:', error);
              toast({
                title: 'Update Failed',
                description: 'Failed to update player sprite. Please try again.',
                variant: 'destructive'
              });
            }
          }
        }
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: 'Upload Failed',
          description: 'There was an error reading the image file.',
          variant: 'destructive'
        });
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'There was an error processing the image.',
        variant: 'destructive'
      });
      setIsUploading(false);
    }
  };
  
  // Handle background image upload with error handling
  const handleBackgroundUpload = () => {
    const bgFileInput = document.createElement('input');
    bgFileInput.type = 'file';
    bgFileInput.accept = 'image/*';
    
    bgFileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setIsUploading(true);
      
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageUrl = e.target?.result as string;
          
          if (gameManagerRef.current) {
            // Validate image first
            const isValid = await gameManagerRef.current.preloadImage(imageUrl);
            
            if (!isValid) {
              toast({
                title: 'Invalid Image',
                description: 'The background image could not be loaded. Please try another image.',
                variant: 'destructive'
              });
              setIsUploading(false);
              return;
            }
            
            // Get access to the reptilian attack engine instance
            const gameScene = gameManagerRef.current?.getGame()?.scene?.getScene('GameScene');
            if (gameScene) {
              try {
                // Set the background image
                const engine = (gameScene as any).reptilianEngine;
                if (engine && engine.setBackgroundImage) {
                  engine.setBackgroundImage(imageUrl, 800, 400);
                  toast({
                    title: 'Background Updated',
                    description: 'Game background has been updated successfully.'
                  });
                } else {
                  throw new Error('Game engine not initialized properly');
                }
              } catch (error) {
                console.error('Error updating background:', error);
                toast({
                  title: 'Update Failed',
                  description: 'Failed to update background. Please try again.',
                  variant: 'destructive'
                });
              }
            }
          }
          setIsUploading(false);
        };
        
        reader.onerror = () => {
          toast({
            title: 'Upload Failed',
            description: 'There was an error reading the background image file.',
            variant: 'destructive'
          });
          setIsUploading(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Background upload error:', error);
        toast({
          title: 'Upload Error',
          description: 'There was an error processing the background image.',
          variant: 'destructive'
        });
        setIsUploading(false);
      }
    };
    
    bgFileInput.click();
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
        
        {/* Customization panel */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="win95-button text-xs flex items-center gap-1"
            onClick={handlePlayerSpriteUpload}
            disabled={isUploading}
          >
            <Upload size={12} />
            Player Sprite
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="win95-button text-xs flex items-center gap-1"
            onClick={handleBackgroundUpload}
            disabled={isUploading}
          >
            <Upload size={12} />
            Background
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
        
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
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="win95-window p-4 text-center">
              <h3 className="text-lg font-bold mb-4">Processing Image...</h3>
              <div className="animate-pulse">Please wait</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameUI;
