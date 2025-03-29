
import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import WalletConnector from '@/components/WalletConnector';
import { sendTransaction } from '@/lib/web3';
import { LoadingOverlay } from '@/components/grow-room/LoadingOverlay';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';

// Wallet address to send THC to (same as grow room)
const RECIPIENT_ADDRESS = '0x097766e8dE97A0A53B3A31AB4dB02d0004C8cc4F';
// Game start cost
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

  // Maximize window on load
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

  // Initialize game engine
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
      // Send THC to the recipient address
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

    // Check THC balance
    if (parseFloat(thcBalance || '0') < GAME_START_COST) {
      toast({
        title: "Insufficient THC",
        description: `You need at least ${GAME_START_COST} THC to start the game.`,
        variant: "destructive"
      });
      return;
    }

    // Process the transaction
    const success = await handleTransaction(GAME_START_COST, "Starting Game");
    
    if (success) {
      if (gameEngineRef.current) {
        gameEngineRef.current.reset(gameState.upgrades);
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
    const delta = deltaTime / 16.67; // Normalize to ~60fps

    // Update game state
    const updatedState = gameEngineRef.current.update(delta, {
      left: mouseState.current.left,
      right: mouseState.current.right
    });
    
    // Render the game
    gameEngineRef.current.render();
    
    // Update React state (only properties we care about in the UI)
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
      e.preventDefault(); // Prevent context menu from showing on right click
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
    // Award THC when game is over
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

    // Process the transaction
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
    <div className="win95-window w-full h-full overflow-hidden">
      <div className="win95-title-bar px-2 py-1 flex justify-between items-center">
        <div className="text-white">Reptilian Attack</div>
      </div>
      <div className="p-4 bg-[#c0c0c0] flex flex-col items-center h-full">
        <div className="mb-4 win95-inset p-2 w-full flex-grow" ref={gameContainerRef}>
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex gap-2 mb-4">
          {!gameState.gameStarted ? (
            <>
              {!address ? (
                <WalletConnector />
              ) : (
                <Button onClick={startGame} className="win95-button">
                  Start Game ({GAME_START_COST} $THC)
                </Button>
              )}
            </>
          ) : (
            <>
              {gameState.gameOver ? (
                <Button onClick={startGame} className="win95-button">
                  Play Again ({GAME_START_COST} $THC)
                </Button>
              ) : (
                <Button onClick={pauseGame} className="win95-button">
                  {gameState.paused ? "Resume" : "Pause"}
                </Button>
              )}
            </>
          )}
        </div>
        
        {/* Upgrades Section */}
        {address && !gameState.gameStarted && (
          <div className="win95-panel p-2 w-full max-w-screen-lg mb-4">
            <h3 className="font-bold mb-2">Upgrades:</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="win95-inset p-2 flex flex-col items-center">
                <div className="font-bold mb-1">Speed</div>
                <div className="text-xs mb-2">Current: x{gameState.upgrades.speed.toFixed(2)}</div>
                <Button onClick={() => handleUpgrade('speed')} className="win95-button text-xs">
                  Upgrade (0.5 $THC)
                </Button>
              </div>
              <div className="win95-inset p-2 flex flex-col items-center">
                <div className="font-bold mb-1">Fire Rate</div>
                <div className="text-xs mb-2">Current: x{gameState.upgrades.fireRate.toFixed(2)}</div>
                <Button onClick={() => handleUpgrade('fireRate')} className="win95-button text-xs">
                  Upgrade (0.5 $THC)
                </Button>
              </div>
              <div className="win95-inset p-2 flex flex-col items-center">
                <div className="font-bold mb-1">Health</div>
                <div className="text-xs mb-2">Current: x{gameState.upgrades.health.toFixed(2)}</div>
                <Button onClick={() => handleUpgrade('health')} className="win95-button text-xs">
                  Upgrade (0.5 $THC)
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="win95-panel p-2 w-full max-w-screen-lg">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm space-y-1">
            <li>• <span className="font-bold">LEFT MOUSE BUTTON</span> to shoot at enemies</li>
            <li>• <span className="font-bold">RIGHT MOUSE BUTTON</span> to jump over obstacles</li>
            <li>• Survive as long as possible and defeat enemies to earn $THC</li>
            <li>• Buy upgrades to improve your speed, fire rate, and health</li>
            <li>• Costs {GAME_START_COST} $THC to start a game</li>
          </ul>
        </div>
        
        {address && (
          <div className="mt-4 win95-panel p-2 w-full max-w-screen-lg flex justify-between">
            <div>
              <span className="text-sm font-bold">Your Wallet:</span>
              <div className="text-xs truncate max-w-xs">{address}</div>
            </div>
            <div>
              <span className="text-sm font-bold">THC Balance:</span>
              <div className="text-xs">{thcBalance || '0'} $THC</div>
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
