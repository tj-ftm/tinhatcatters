
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import { useGameState } from '@/hooks/useGameState';
import GameCanvas from '@/components/game/GameCanvas';
import GameStats from '@/components/game/GameStats';
import GameControls from '@/components/game/GameControls';
import GameUpgrades from '@/components/game/GameUpgrades';
import GameOverlay from '@/components/game/GameOverlay';

<<<<<<< HEAD
const GAME_ICON_IMAGES = {
  speed: "/assets/Icons/illuminati.webp",
  fireRate: "/assets/Icons/illuminati.webp",
  health: "/assets/Icons/illuminati.webp",
<<<<<<< HEAD
  logo: "/assets/game/playersprite.gif",
  player: "/assets/Icons/playersprite.gif",
=======
   logo: "/assets/game/playersprite.gif",
  player: "/assets/Icons/playersprite.gif",
>>>>>>> 
  enemy: "/assets/Icons/illuminati.webp",
  powerup: "/assets/Icons/weed.png",
  background: "/assets/Icons/sidescrollerbg.webp"
};

const RECIPIENT_ADDRESS = '0x097766e8dE97A0A53B3A31AB4dB02d0004C8cc4F';
const GAME_START_COST = 0.1;

=======
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
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
<<<<<<< HEAD
    const windowElement = document.querySelector('.window[data-id="game"]');
    if (windowElement && !windowIsMaximized) {
      const maximizeButton = windowElement.querySelector('.maximize-button') as HTMLButtonElement;
      if (maximizeButton) {
        setTimeout(() => {
          maximizeButton.click();
          setWindowIsMaximized(true);
        }, 100);
      }
    }
  }, [windowIsMaximized]);

  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new ReptilianAttackEngine();
    }
    
    if (canvasRef.current) {
      gameEngineRef.current.initialize(canvasRef.current);
      
      if (gameEngineRef.current) {
        try {
          // Set the game assets immediately so they appear before game starts
          if (typeof gameEngineRef.current.setPlayerSprite === 'function') {
            gameEngineRef.current.setPlayerSprite(GAME_ICON_IMAGES.player);
          }
          
          if (typeof gameEngineRef.current.setBackgroundImage === 'function') {
            gameEngineRef.current.setBackgroundImage(GAME_ICON_IMAGES.background);
          }
          
          if (typeof gameEngineRef.current.setEnemyImage === 'function') {
            gameEngineRef.current.setEnemyImage(GAME_ICON_IMAGES.enemy);
          }
          
          // Add an animation loop for the start screen
          const animateStartScreen = () => {
            if (gameEngineRef.current && !gameState.gameStarted) {
              // Render the start screen instead of the game when not started
              gameEngineRef.current.renderStartScreen();
            }
            if (!gameState.gameStarted) {
              requestAnimationFrame(animateStartScreen);
            }
          };
          
          animateStartScreen();
        } catch (error) {
          console.error("Error initializing game assets:", error);
        }
      }
    }
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleTransaction = async (amount: number, actionType: string): Promise<boolean> => {
    setIsLoading(true);
    setPendingAction(actionType);

    try {
      const success = await sendTransaction(RECIPIENT_ADDRESS, amount.toString());
      
      if (success) {
        toast({
          title: "Transaction Successful",
          description: `Successfully sent ${amount} THC to play the game.`,
        });
        return true;
      } else {
        toast({
          title: "Transaction Failed",
          description: "Failed to send THC. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Error",
        description: error.message || "An error occurred during the transaction.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const startGame = async () => {
    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to play and earn $THC",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(thcBalance || '0') < GAME_START_COST) {
      toast({
        title: "Insufficient THC",
        description: `You need at least ${GAME_START_COST} THC to start the game.`,
        variant: "destructive"
      });
      return;
    }

    const success = await handleTransaction(GAME_START_COST, "Starting Game");
    
    if (success) {
      if (gameEngineRef.current) {
        gameEngineRef.current.reset(gameState.upgrades);
        gameEngineRef.current.setCollisionBehavior('immediate');
      }
      
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        gameOver: false,
        lives: 3,
        health: 100,
        score: 0,
        thcEarned: 0,
      }));
      
      // Start the game loop
      lastFrameTime.current = 0;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  const gameLoop = (timestamp: number) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.paused || !gameEngineRef.current) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - (lastFrameTime.current || timestamp);
    lastFrameTime.current = timestamp;
    const delta = deltaTime / 16.67;

    const updatedState = gameEngineRef.current.update(delta, {
      left: mouseState.current.left,
      right: mouseState.current.right
    });
    
    gameEngineRef.current.render();
    
    setGameState(prev => ({
      ...prev,
      score: updatedState.score,
      lives: updatedState.lives,
      health: updatedState.health,
      thcEarned: updatedState.thcEarned,
      gameOver: updatedState.gameOver
    }));
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && gameContainerRef.current) {
        const containerWidth = gameContainerRef.current.clientWidth;
        const containerHeight = gameContainerRef.current.clientHeight;
        
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        
        if (gameEngineRef.current) {
          gameEngineRef.current.render();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!gameState.gameStarted || gameState.gameOver || gameState.paused) return;
      
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const screenWidth = window.innerWidth;
      
      if (touchX < screenWidth / 2) {
        mouseState.current.left = true;
      } else {
        mouseState.current.right = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        mouseState.current.left = false;
        mouseState.current.right = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouseState.current.position = { x: touch.clientX, y: touch.clientY };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouseState.current.left = true;
      if (e.button === 2) mouseState.current.right = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouseState.current.left = false;
      if (e.button === 2) mouseState.current.right = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseState.current.position = { x: e.clientX, y: e.clientY };
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('resize', handleResize);
    
    if (isMobile) {
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchmove', handleTouchMove);
    }
    
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);

    handleResize();

    return () => {
      window.addEventListener('resize', handleResize);
      if (isMobile) {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchmove', handleTouchMove);
      }
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.paused, isMobile]);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.paused) {
      lastFrameTime.current = 0;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else if (!gameState.gameStarted && gameEngineRef.current) {
      // When game is not started, render the start screen instead
      cancelAnimationFrame(animationFrameRef.current);
      gameEngineRef.current.renderStartScreen();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.paused]);

  useEffect(() => {
=======
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
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
      
<<<<<<< HEAD
      <div className="win95-panel p-1 w-full mt-auto bg-[#c0c0c0]">
        <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex justify-center gap-2 items-center h-8'}`}>
          <span className="font-bold text-black text-sm mr-1">Upgrades:</span>
          
          <div className={`win95-inset p-1 ${isMobile ? 'flex flex-col gap-2' : 'flex flex-row items-center gap-2'} w-full ${isMobile ? '' : 'h-6'}`}>
            <div className={`${isMobile ? 'flex' : 'flex flex-1'} items-center gap-1`}>
              <img 
                src={GAME_ICON_IMAGES.speed} 
                alt="Speed" 
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Fallback to Lucide icon
                  const iconContainer = target.parentElement;
                  if (iconContainer) {
                    const iconElement = document.createElement('span');
                    iconContainer.appendChild(iconElement);
                    // React elements can't be directly inserted this way
                    // This is just a placeholder for the error handling
                  }
                }}
              />
              <Zap size={16} className="text-yellow-500 shrink-0" style={{ display: 'none' }} />
              <div className="flex-1">
                <div className="w-full h-3 win95-inset overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${(gameState.upgrades.speed - 1) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-black whitespace-nowrap">Speed: x{gameState.upgrades.speed.toFixed(2)}</span>
              <Button onClick={() => handleUpgrade('speed')} className="win95-button text-xs py-0 h-6 whitespace-nowrap">
                + (0.5 $THC)
              </Button>
            </div>
            
            <div className={`${isMobile ? 'flex' : 'flex flex-1'} items-center gap-1`}>
              <img 
                src={GAME_ICON_IMAGES.fireRate} 
                alt="Fire Rate" 
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Show Shield icon as fallback
                  const shieldIcon = target.parentElement?.querySelector('.lucide-shield');
                  if (shieldIcon) {
                    (shieldIcon as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <Shield size={16} className="text-blue-500 shrink-0" style={{ display: 'none' }} />
              <div className="flex-1">
                <div className="w-full h-3 win95-inset overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(gameState.upgrades.fireRate - 1) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-black whitespace-nowrap">Fire: x{gameState.upgrades.fireRate.toFixed(2)}</span>
              <Button onClick={() => handleUpgrade('fireRate')} className="win95-button text-xs py-0 h-6 whitespace-nowrap">
                + (0.5 $THC)
              </Button>
            </div>
            
            <div className={`${isMobile ? 'flex' : 'flex flex-1'} items-center gap-1`}>
              <img 
                src={GAME_ICON_IMAGES.health} 
                alt="Health" 
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Show Heart icon as fallback
                  const heartIcon = target.parentElement?.querySelector('.lucide-heart');
                  if (heartIcon) {
                    (heartIcon as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <Heart size={16} className="text-red-500 shrink-0" style={{ display: 'none' }} />
              <div className="flex-1">
                <div className="w-full h-3 win95-inset overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ width: `${(gameState.upgrades.health - 1) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-black whitespace-nowrap">Health: x{gameState.upgrades.health.toFixed(2)}</span>
              <Button onClick={() => handleUpgrade('health')} className="win95-button text-xs py-0 h-6 whitespace-nowrap">
                + (0.5 $THC)
              </Button>
            </div>
          </div>
        </div>
      </div>
=======
      <GameUpgrades 
        gameState={gameState} 
        handleUpgrade={handleUpgrade} 
      />
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
      
      <GameOverlay 
        isLoading={isLoading} 
        pendingAction={pendingAction} 
      />
    </div>
  );
};

export default Game;
