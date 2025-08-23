
import React, { useRef, useEffect, useState } from 'react';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import GameOverScreen from './GameOverScreen';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameCanvasProps {
  gameState: GameState;
  updateGameState: (state: Partial<GameState>) => void;
  windowIsMaximized: boolean;
  setWindowIsMaximized: (state: boolean) => void;
  gameEngineRef: React.MutableRefObject<ReptilianAttackEngine | null>;
  onPlayAgain: () => void;
  onConnectWallet?: () => void;
}

type StartScreenState = 'video' | 'countdown' | 'game';

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  updateGameState, 
  windowIsMaximized, 
  setWindowIsMaximized,
  gameEngineRef,
  onPlayAgain,
  onConnectWallet
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const mouseState = useRef({ left: false, right: false, position: { x: 0, y: 0 } });
  const lastFrameTime = useRef<number>(0);
  const isMobile = useIsMobile();
  
  const [startScreenState, setStartScreenState] = useState<StartScreenState>('video');
  const [countdownValue, setCountdownValue] = useState(3);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const triggerCountdown = () => {
    setCountdown(3);
    setShowCountdown(true);
  };

  // Start countdown when gameState.showCountdown becomes true
  React.useEffect(() => {
    if (gameState.showCountdown && !showCountdown) {
      triggerCountdown();
    }
  }, [gameState.showCountdown, showCountdown]);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle window maximization
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
  }, [windowIsMaximized, setWindowIsMaximized]);

  // Initialize game engine
  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new ReptilianAttackEngine();
    }
    
    if (canvasRef.current) {
      gameEngineRef.current.initialize(canvasRef.current);
      
      if (gameEngineRef.current) {
        try {
          // Add an animation loop for the start screen
          const animateStartScreen = () => {
            if (gameEngineRef.current && !gameState.gameStarted) {
              if (startScreenState === 'video') {
            gameEngineRef.current.renderStartScreen();
          } else if (startScreenState === 'countdown') {
            gameEngineRef.current.renderStartScreen();
          } else {
            gameEngineRef.current.renderStartScreen();
          }
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

  // Game loop
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
    
    updateGameState({
      score: updatedState.score,
      lives: updatedState.lives,
      health: updatedState.health,
      pointsEarned: updatedState.pointsEarned,
      gameOver: updatedState.gameOver
    });
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Configure game based on state
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.paused) {
      if (gameEngineRef.current) {
        gameEngineRef.current.reset(gameState.upgrades);
        gameEngineRef.current.setCollisionBehavior('immediate');
        
        // Enable sprite animation when game starts
        if (typeof gameEngineRef.current.setAnimationRunning === 'function') {
          gameEngineRef.current.setAnimationRunning(true);
        }
        
        lastFrameTime.current = 0;
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    } else if (!gameState.gameStarted && gameEngineRef.current) {
      // Disable sprite animation
      if (gameEngineRef.current && typeof gameEngineRef.current.setAnimationRunning === 'function') {
        gameEngineRef.current.setAnimationRunning(false);
      }
      
      // When game is not started, render the appropriate start screen
      cancelAnimationFrame(animationFrameRef.current);
      if (startScreenState === 'video') {
        gameEngineRef.current.renderStartScreen();
      } else if (startScreenState === 'countdown') {
        gameEngineRef.current.renderStartScreen();
      } else {
        gameEngineRef.current.renderStartScreen();
      }
    } else if (gameState.paused && gameEngineRef.current) {
      // Disable sprite animation when paused
      if (gameEngineRef.current && typeof gameEngineRef.current.setAnimationRunning === 'function') {
        gameEngineRef.current.setAnimationRunning(false);
      }
      
      cancelAnimationFrame(animationFrameRef.current);
    } else if (gameState.gameOver && gameEngineRef.current) {
      // Disable sprite animation when game over
      if (gameEngineRef.current && typeof gameEngineRef.current.setAnimationRunning === 'function') {
        gameEngineRef.current.setAnimationRunning(false);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.paused, startScreenState, countdownValue, showPlayButton]);

  // Handle countdown logic
  useEffect(() => {
    if (startScreenState === 'countdown' && countdownValue > 0) {
      countdownTimeoutRef.current = setTimeout(() => {
        if (countdownValue === 1) {
          // Start the game after countdown reaches 0
          updateGameState({ gameStarted: true });
          setStartScreenState('game');
        } else {
          setCountdownValue(prev => prev - 1);
        }
      }, 1000);
    }

    return () => {
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
      }
    };
  }, [startScreenState, countdownValue, updateGameState]);

  // Reset start screen state when game is reset
  useEffect(() => {
    if (!gameState.gameStarted && gameState.score === 0) {
      setStartScreenState('video');
      setCountdownValue(3);
      setShowPlayButton(true);
    }
  }, [gameState.gameStarted, gameState.score]);

  // Handle input and resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && gameContainerRef.current) {
        const containerWidth = gameContainerRef.current.clientWidth;
        const containerHeight = gameContainerRef.current.clientHeight;
        
        // Always fill the entire container without maintaining aspect ratio
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        canvasRef.current.style.margin = "0";
        
        if (gameEngineRef.current) {
          gameEngineRef.current.render();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      
      // Handle play button touch
      if (startScreenState === 'video' && showPlayButton && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Scale coordinates to canvas size
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        // Check if touch is within play button area (200x60 centered)
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = canvasRef.current.width / 2 - buttonWidth / 2;
        const buttonY = canvasRef.current.height / 2 - buttonHeight / 2;
        
        if (canvasX >= buttonX && canvasX <= buttonX + buttonWidth &&
            canvasY >= buttonY && canvasY <= buttonY + buttonHeight) {
          setStartScreenState('countdown');
          setShowPlayButton(false);
          return;
        }
      }
      
      if (!gameState.gameStarted || gameState.gameOver || gameState.paused) return;
      
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
      if (e.button === 0) {
        mouseState.current.left = true;
        
        // Handle play button click
        if (startScreenState === 'video' && showPlayButton && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Scale coordinates to canvas size
          const scaleX = canvasRef.current.width / rect.width;
          const scaleY = canvasRef.current.height / rect.height;
          const canvasX = x * scaleX;
          const canvasY = y * scaleY;
          
          // Check if click is within play button area (200x60 centered)
          const buttonWidth = 200;
          const buttonHeight = 60;
          const buttonX = canvasRef.current.width / 2 - buttonWidth / 2;
          const buttonY = canvasRef.current.height / 2 - buttonHeight / 2;
          
          if (canvasX >= buttonX && canvasX <= buttonX + buttonWidth &&
              canvasY >= buttonY && canvasY <= buttonY + buttonHeight) {
            setStartScreenState('countdown');
            setShowPlayButton(false);
          }
        }
      }
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
      window.removeEventListener('resize', handleResize);
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

  // Countdown effect
  useEffect(() => {
    if (showCountdown && countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished, start the actual game
        setShowCountdown(false);
        setCountdown(null);
        updateGameState({ gameStarted: true, showCountdown: false });
      }
    }
  }, [countdown, showCountdown, updateGameState]);

  return (
    <div className="flex-grow flex flex-col relative" style={{ minHeight: "0", display: "flex", flex: "1 1 auto" }}>
      <div className="bg-black border-2 border-solid w-full h-full flex items-center justify-center" style={{ borderColor: "#808080 #ffffff #ffffff #808080" }} ref={gameContainerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-fill"
        />


        
        {gameState.gameOver && (
          <GameOverScreen
            score={gameState.score}
            pointsEarned={gameState.pointsEarned}
            onPlayAgain={onPlayAgain}
            onConnectWallet={onConnectWallet}
          />
        )}
        
        {showCountdown && countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="text-8xl font-bold text-white animate-pulse">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
