
import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import WalletConnector from '@/components/WalletConnector';
import { sendTransaction } from '@/lib/web3';
import LoadingOverlay from '@/components/grow-room/LoadingOverlay';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import { Shield, Zap, Heart } from 'lucide-react';

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
        maximizeButton.click();
        setWindowIsMaximized(true);
      }
    }
  }, [windowIsMaximized]);

  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new ReptilianAttackEngine();
    }
    
    if (canvasRef.current) {
      gameEngineRef.current.initialize(canvasRef.current);
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
        canvasRef.current.width = gameContainerRef.current.clientWidth;
        canvasRef.current.height = gameContainerRef.current.clientHeight;
        
        if (gameEngineRef.current) {
          gameEngineRef.current.render();
        }
      }
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
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

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

  return (
    <div className="win95-window w-full h-full overflow-hidden flex flex-col">
      <div className="win95-title-bar px-2 py-1 flex justify-between items-center">
        <div className="text-white">Reptilian Attack</div>
      </div>
      
      <div className="p-2 bg-[#c0c0c0] flex flex-col h-full">
        <div className="w-full mb-2 win95-panel p-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
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
          
          <div className="flex items-center gap-2">
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

        {/* Game container - modified to take all available vertical space */}
        <div className="win95-inset p-1 w-full flex-grow flex flex-col" ref={gameContainerRef} style={{ minHeight: "0" }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Moved upgrades to bottom and made thinner */}
        <div className="win95-panel p-1 w-full mt-2 h-auto">
          <div className="flex justify-center gap-2 items-center h-10">
            <span className="font-bold text-black text-sm mr-1">Upgrades:</span>
            
            <div className="win95-inset p-1 flex flex-row items-center gap-2 w-full h-8">
              <div className="flex flex-1 items-center gap-1">
                <Zap size={16} className="text-yellow-500 shrink-0" />
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
              
              <div className="flex flex-1 items-center gap-1">
                <Shield size={16} className="text-blue-500 shrink-0" />
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
              
              <div className="flex flex-1 items-center gap-1">
                <Heart size={16} className="text-red-500 shrink-0" />
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
      </div>
      
      <LoadingOverlay 
        isLoading={isLoading}
        actionType={pendingAction}
      />
    </div>
  );
};

export default Game;
