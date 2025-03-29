
import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import WalletConnector from '@/components/WalletConnector';
import { sendTransaction } from '@/lib/web3';
import LoadingOverlay from '@/components/grow-room/LoadingOverlay';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import { Shield, Zap, Heart, Info } from 'lucide-react';

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
  const [showInstructions, setShowInstructions] = useState(false);

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
        // Make sure collisions disappear immediately
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

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="win95-window w-full h-full overflow-hidden">
      <div className="win95-title-bar px-2 py-1 flex justify-between items-center">
        <div className="text-white">Reptilian Attack</div>
      </div>
      <div className="p-2 bg-[#c0c0c0] flex flex-col items-center h-full">
        {/* Game Stats Bar - Horizontal at the top */}
        <div className="w-full mb-2 win95-panel p-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="win95-inset px-3 py-1 flex items-center">
              <span className="font-bold mr-2">Score:</span>
              <span>{gameState.score}</span>
            </div>
            
            <div className="win95-inset px-3 py-1 flex items-center">
              <span className="font-bold mr-2">Lives:</span>
              <span>{gameState.lives}</span>
            </div>
            
            <div className="win95-inset px-3 py-1 flex items-center gap-1">
              <span className="font-bold mr-1">Health:</span>
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
                <span className="font-bold mr-1">THC:</span>
                <span>{thcBalance || '0'}</span>
              </div>
            )}
            
            <Button 
              onClick={toggleInstructions} 
              className="win95-button h-8 px-2 flex items-center"
              variant="outline"
            >
              <Info size={16} className="mr-1" />
              Help
            </Button>
            
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

        <div className="flex w-full h-[calc(100%-120px)]">
          {/* Main Game Area */}
          <div className="win95-inset p-1 flex-grow h-full mr-0" ref={gameContainerRef}>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Upgrades Panel */}
          {address && !gameState.gameStarted && (
            <div className="win95-panel p-2 w-64 ml-2 h-full flex flex-col">
              <h3 className="font-bold mb-4 text-center">Upgrades</h3>
              
              <div className="flex flex-col gap-4">
                <div className="win95-inset p-2 flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <Zap size={18} className="mr-2 text-yellow-500" />
                    <span className="font-bold">Speed</span>
                  </div>
                  <div className="w-full h-4 win95-inset mb-2 overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ width: `${(gameState.upgrades.speed - 1) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs mb-2">Current: x{gameState.upgrades.speed.toFixed(2)}</div>
                  <Button onClick={() => handleUpgrade('speed')} className="win95-button text-xs">
                    Upgrade (0.5 $THC)
                  </Button>
                </div>
                
                <div className="win95-inset p-2 flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <Shield size={18} className="mr-2 text-blue-500" />
                    <span className="font-bold">Fire Rate</span>
                  </div>
                  <div className="w-full h-4 win95-inset mb-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${(gameState.upgrades.fireRate - 1) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs mb-2">Current: x{gameState.upgrades.fireRate.toFixed(2)}</div>
                  <Button onClick={() => handleUpgrade('fireRate')} className="win95-button text-xs">
                    Upgrade (0.5 $THC)
                  </Button>
                </div>
                
                <div className="win95-inset p-2 flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <Heart size={18} className="mr-2 text-red-500" />
                    <span className="font-bold">Health</span>
                  </div>
                  <div className="w-full h-4 win95-inset mb-2 overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ width: `${(gameState.upgrades.health - 1) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs mb-2">Current: x{gameState.upgrades.health.toFixed(2)}</div>
                  <Button onClick={() => handleUpgrade('health')} className="win95-button text-xs">
                    Upgrade (0.5 $THC)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions Panel - Now below game */}
        {showInstructions && (
          <div className="win95-panel p-2 w-full mt-2">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <div className="grid grid-cols-2 text-sm gap-4">
              <div className="flex items-center">
                <div className="win95-button min-w-16 text-center mr-4">Left Click</div>
                <span>Shoot at enemies</span>
              </div>
              <div className="flex items-center">
                <div className="win95-button min-w-16 text-center mr-4">Right Click</div>
                <span>Jump over obstacles</span>
              </div>
              <div className="col-span-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Survive as long as possible and defeat enemies to earn $THC</li>
                  <li>Buy upgrades to improve your speed, fire rate, and health</li>
                  <li>Costs {GAME_START_COST} $THC to start a game</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <LoadingOverlay 
        isLoading={isLoading}
        actionType={pendingAction}
      />
    </div>
  );
};

export default Game;
