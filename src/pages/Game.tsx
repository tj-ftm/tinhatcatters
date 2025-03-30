import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import WalletConnector from '@/components/WalletConnector';
import { sendTransaction } from '@/lib/web3';
import LoadingOverlay from '@/components/grow-room/LoadingOverlay';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import { Shield, Zap, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const GAME_ICON_IMAGES = {
  speed: "/assets/Icons/illuminati.webp",
  fireRate: "/assets/Icons/illuminati.webp",
  health: "/assets/Icons/illuminati.webp",
  logo: "/assets/Icons/illuminati.webp",
  player: "/assets/Icons/tinhatcat.webp",
  enemy: "/assets/Icons/illuminati.webp",
  powerup: "/assets/Icons/weed.png",
  background: "/assets/Icons/sidescrollerbg.webp"
};

const RECIPIENT_ADDRESS = '0x097766e8dE97A0A53B3A31AB4dB02d0004C8cc4F';
const GAME_START_COST = 0.1;

const Game: React.FC = () => {
  const { address, thcBalance, connect } = useWeb3();
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
    health: 100,
    thcEarned: 0,
    gameOver: false,
    gameStarted: false,
    paused: false,
    upgrades: {
      speed: 1,
      fireRate: 1,
      health: 1
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [windowIsMaximized, setWindowIsMaximized] = useState(false);
  const isMobile = useIsMobile();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<ReptilianAttackEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const mouseState = useRef({ left: false, right: false, position: { x: 0, y: 0 } });
  const lastFrameTime = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
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
        gameEngineRef.current.setPlayerSprite(GAME_ICON_IMAGES.player);
        gameEngineRef.current.setBackgroundImage(GAME_ICON_IMAGES.background);
        gameEngineRef.current.setEnemyImage(GAME_ICON_IMAGES.enemy);
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
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.paused]);

  useEffect(() => {
    if (gameState.gameOver && gameState.thcEarned > 0 && address) {
      toast({
        title: "Crypto Earned!",
        description: `${gameState.thcEarned.toFixed(2)} $THC added to your wallet!`,
      });
    }
  }, [gameState.gameOver, gameState.thcEarned, address]);

  const handleUpgrade = async (upgradeType: 'speed' | 'fireRate' | 'health') => {
    const upgradeCost = 0.5;
    
    if (parseFloat(thcBalance || '0') < upgradeCost) {
      toast({
        title: "Insufficient THC",
        description: `You need at least ${upgradeCost} THC for this upgrade.`,
        variant: "destructive"
      });
      return;
    }

    const success = await handleTransaction(upgradeCost, `Upgrading ${upgradeType}`);
    
    if (success) {
      setGameState(prev => ({
        ...prev,
        upgrades: {
          ...prev.upgrades,
          [upgradeType]: prev.upgrades[upgradeType] + 0.25
        }
      }));
      
      toast({
        title: "Upgrade Successful",
        description: `Your ${upgradeType} has been upgraded!`,
      });
    }
  };

  const MobileControlsHelp = () => (
    <div className="absolute top-2 left-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs z-10">
      <p>Touch left side to shoot. Touch right side to jump.</p>
    </div>
  );

  return (
    <div className="win95-window w-full h-full overflow-hidden flex flex-col">
      <div className="p-2 bg-[#c0c0c0] flex flex-col h-full">
        <div className={`w-full mb-2 win95-panel p-2 ${isMobile ? 'flex flex-col gap-2' : 'flex justify-between items-center'}`}>
          <div className={`${isMobile ? 'flex justify-between' : 'flex items-center gap-2'}`}>
            <div className="win95-inset px-3 py-1 flex items-center">
              <span className="font-bold mr-2 text-black">Score:</span>
              <span className="text-black">{gameState.score}</span>
            </div>
            
            <div className="win95-inset px-3 py-1 flex items-center">
              <span className="font-bold mr-2 text-black">Lives:</span>
              <span className="text-black">{gameState.lives}</span>
            </div>
            
            <div className="win95-inset px-3 py-1 flex items-center gap-1">
              <span className="font-bold mr-1 text-black">Health:</span>
              <div className="w-24 h-4 win95-inset overflow-hidden">
                <div 
                  className={`h-full ${gameState.health > 30 ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${gameState.health}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className={`${isMobile ? 'flex justify-between mt-2' : 'flex items-center gap-2'}`}>
            {address && (
              <div className="win95-inset px-3 py-1">
                <span className="font-bold mr-1 text-black">THC:</span>
                <span className="text-black">{thcBalance || '0'}</span>
              </div>
            )}
            
            {!gameState.gameStarted ? (
              <>
                {!address ? (
                  <WalletConnector />
                ) : (
                  <Button onClick={startGame} className="win95-button h-8">
                    Start Game ({GAME_START_COST} $THC)
                  </Button>
                )}
              </>
            ) : (
              <>
                {gameState.gameOver ? (
                  <Button onClick={startGame} className="win95-button h-8">
                    Play Again ({GAME_START_COST} $THC)
                  </Button>
                ) : (
                  <Button onClick={pauseGame} className="win95-button h-8">
                    {gameState.paused ? "Resume" : "Pause"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex-grow flex flex-col relative" style={{ minHeight: "0", display: "flex", flex: "1 1 auto" }}>
          <div className="win95-inset p-1 w-full h-full" ref={gameContainerRef}>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />
            {isMobile && gameState.gameStarted && !gameState.paused && !gameState.gameOver && (
              <MobileControlsHelp />
            )}
          </div>
        </div>
      </div>
      
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
      
      <LoadingOverlay 
        isLoading={isLoading}
        actionType={pendingAction}
      />
    </div>
  );
};

export default Game;
