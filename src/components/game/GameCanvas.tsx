
import React, { useRef, useEffect } from 'react';
import ReptilianAttackEngine from '@/game/ReptilianAttackEngine';
import { GameState } from '@/hooks/useGameState';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameCanvasProps {
  gameState: GameState;
  updateGameState: (state: Partial<GameState>) => void;
  windowIsMaximized: boolean;
  setWindowIsMaximized: (state: boolean) => void;
  gameEngineRef: React.MutableRefObject<ReptilianAttackEngine | null>;
}

const GAME_ICON_IMAGES = {
  speed: "/assets/Icons/illuminati.webp",
  fireRate: "/assets/Icons/illuminati.webp",
  health: "/assets/Icons/illuminati.webp",
  logo: "/assets/Icons/illuminati.webp",
  player: "/playersprite.gif",
  enemy: "/assets/Icons/illuminati.webp",
  powerup: "/assets/Icons/weed.png",
  background: "/assets/Icons/sidescrollerbg.webp",
  playerSprite: "/playersprite.gif"
};

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  updateGameState, 
  windowIsMaximized, 
  setWindowIsMaximized,
  gameEngineRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const mouseState = useRef({ left: false, right: false, position: { x: 0, y: 0 } });
  const lastFrameTime = useRef<number>(0);
  const isMobile = useIsMobile();

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
          // Set the game assets immediately so they appear before game starts
          if (typeof gameEngineRef.current.setPlayerSprite === 'function') {
            gameEngineRef.current.setPlayerSprite(GAME_ICON_IMAGES.player);
          }
          
          if (typeof gameEngineRef.current.setPlayerAnimatedSprite === 'function') {
            gameEngineRef.current.setPlayerAnimatedSprite(GAME_ICON_IMAGES.playerSprite, 4);
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
      thcEarned: updatedState.thcEarned,
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
      
      // When game is not started, render the start screen instead
      cancelAnimationFrame(animationFrameRef.current);
      gameEngineRef.current.renderStartScreen();
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
  }, [gameState.gameStarted, gameState.gameOver, gameState.paused]);

  // Handle input and resize
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

  // Mobile controls help tooltip
  const MobileControlsHelp = () => (
    <div className="absolute top-2 left-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs z-10">
      <p>Touch left side to shoot. Touch right side to jump.</p>
    </div>
  );

  return (
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
  );
};

export default GameCanvas;
