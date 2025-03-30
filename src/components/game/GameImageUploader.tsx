
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameImageUploaderProps {
  gameManagerRef: React.MutableRefObject<GameManager | null>;
  setIsUploading: (value: boolean) => void;
}

interface GameManager {
  preloadImage: (url: string) => Promise<boolean>;
  getGame: () => any;
}

const GameImageUploader: React.FC<GameImageUploaderProps> = ({ 
  gameManagerRef, 
  setIsUploading 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  return (
    <div className="absolute top-2 right-2 flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="win95-button text-xs flex items-center gap-1"
        onClick={handlePlayerSpriteUpload}
        disabled={!!gameManagerRef.current && false}
      >
        <Upload size={12} />
        Player Sprite
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="win95-button text-xs flex items-center gap-1"
        onClick={handleBackgroundUpload}
        disabled={!!gameManagerRef.current && false}
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
  );
};

export default GameImageUploader;
