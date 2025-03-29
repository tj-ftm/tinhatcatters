import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import WalletConnector from '@/components/WalletConnector';

interface GameState {
  score: number;
  lives: number;
  gameOver: boolean;
  coneBalance: number;
  gameStarted: boolean;
  paused: boolean;
  character: {
    x: number;
    y: number;
    jumping: boolean;
    shooting: boolean;
    speed: number;
    jumpPower: number;
  };
  enemies: Enemy[];
  projectiles: Projectile[];
  powerUps: PowerUp[];
  terrain: TerrainBlock[];
  lastEnemySpawn: number;
  lastTerrainGeneration: number;
  lastPowerUpSpawn: number;
}

interface Enemy {
  id: string;
  type: 'lizard' | 'croc' | 'snake';
  x: number;
  y: number;
  health: number;
  speed: number;
  width: number;
  height: number;
  attackCooldown: number;
  lastAttack: number;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  fromPlayer: boolean;
}

interface PowerUp {
  id: string;
  type: 'health' | 'speed' | 'cone' | 'extraLife';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TerrainBlock {
  id: string;
  type: 'ground' | 'pit' | 'spike';
  x: number;
  y: number;
  width: number;
  height: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_HEIGHT = 40;
const CHARACTER_WIDTH = 32;
const CHARACTER_HEIGHT = 48;
const GRAVITY = 0.6;

const Game: React.FC = () => {
  const { address, thcBalance, connect } = useWeb3();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    gameOver: false,
    coneBalance: 0,
    gameStarted: false,
    paused: false,
    character: {
      x: 100,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - CHARACTER_HEIGHT,
      jumping: false,
      shooting: false,
      speed: 5,
      jumpPower: 12
    },
    enemies: [],
    projectiles: [],
    powerUps: [],
    terrain: [
      {
        id: 'initial-ground',
        type: 'ground',
        x: 0,
        y: CANVAS_HEIGHT - GROUND_HEIGHT,
        width: CANVAS_WIDTH * 2,
        height: GROUND_HEIGHT
      }
    ],
    lastEnemySpawn: 0,
    lastTerrainGeneration: 0,
    lastPowerUpSpawn: 0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const keysPressed = useRef<Record<string, boolean>>({});
  const lastFrameTime = useRef<number>(0);

  const startGame = () => {
    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to play and earn $THC",
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      lives: 3,
      score: 0,
      coneBalance: 0,
      character: {
        ...prev.character,
        x: 100,
        y: CANVAS_HEIGHT - GROUND_HEIGHT - CHARACTER_HEIGHT,
        jumping: false
      },
      enemies: [],
      projectiles: [],
      powerUps: [],
      terrain: [
        {
          id: 'initial-ground',
          type: 'ground',
          x: 0,
          y: CANVAS_HEIGHT - GROUND_HEIGHT,
          width: CANVAS_WIDTH * 2,
          height: GROUND_HEIGHT
        }
      ]
    }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  const gameLoop = (timestamp: number) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.paused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - (lastFrameTime.current || timestamp);
    lastFrameTime.current = timestamp;
    const delta = deltaTime / 16.67;

    setGameState(prevState => {
      let updatedCharacter = { ...prevState.character };
      
      if (keysPressed.current['ArrowUp'] || keysPressed.current[' ']) {
        if (!updatedCharacter.jumping) {
          updatedCharacter.jumping = true;
          updatedCharacter.y -= updatedCharacter.jumpPower;
        }
      }
      
      if (keysPressed.current['Control'] || keysPressed.current['x']) {
        if (!updatedCharacter.shooting) {
          updatedCharacter.shooting = true;
          
          const newProjectile: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: updatedCharacter.x + CHARACTER_WIDTH,
            y: updatedCharacter.y + CHARACTER_HEIGHT / 2 - 5,
            speed: 8,
            width: 16,
            height: 10,
            fromPlayer: true
          };
          
          prevState.projectiles.push(newProjectile);
        }
      } else {
        updatedCharacter.shooting = false;
      }
      
      if (updatedCharacter.jumping) {
        updatedCharacter.y += GRAVITY * delta;
        
        const groundY = CANVAS_HEIGHT - GROUND_HEIGHT - CHARACTER_HEIGHT;
        if (updatedCharacter.y >= groundY) {
          updatedCharacter.y = groundY;
          updatedCharacter.jumping = false;
        }
      }
      
      const updatedProjectiles = prevState.projectiles
        .map(proj => ({
          ...proj,
          x: proj.fromPlayer ? proj.x + proj.speed * delta : proj.x - proj.speed * delta
        }))
        .filter(proj => proj.x > 0 && proj.x < CANVAS_WIDTH);
      
      const updatedEnemies = prevState.enemies
        .map(enemy => ({
          ...enemy,
          x: enemy.x - enemy.speed * delta
        }))
        .filter(enemy => enemy.x > -enemy.width);
      
      if (timestamp - prevState.lastEnemySpawn > 2000) {
        const enemyTypes = ['lizard', 'croc', 'snake'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)] as 'lizard' | 'croc' | 'snake';
        
        const newEnemy: Enemy = {
          id: `enemy-${Date.now()}`,
          type: randomType,
          x: CANVAS_WIDTH,
          y: CANVAS_HEIGHT - GROUND_HEIGHT - 48,
          health: randomType === 'snake' ? 2 : 1,
          speed: 2 + Math.random() * 2,
          width: 32,
          height: 48,
          attackCooldown: 3000,
          lastAttack: 0
        };
        
        updatedEnemies.push(newEnemy);
        prevState.lastEnemySpawn = timestamp;
      }
      
      let updatedLives = prevState.lives;
      let updatedScore = prevState.score;
      let updatedConeBalance = prevState.coneBalance;
      
      const projectilesAfterCollision = [...updatedProjectiles];
      const enemiesAfterCollision = updatedEnemies.map(enemy => {
        let enemyHealth = enemy.health;
        
        projectilesAfterCollision.forEach((proj, idx) => {
          if (proj.fromPlayer && 
              proj.x < enemy.x + enemy.width &&
              proj.x + proj.width > enemy.x &&
              proj.y < enemy.y + enemy.height &&
              proj.y + proj.height > enemy.y) {
            enemyHealth--;
            projectilesAfterCollision[idx] = { ...proj, x: -100 };
          }
        });
        
        if (enemyHealth <= 0) {
          updatedScore += 10;
          updatedConeBalance += Math.floor(Math.random() * 5) + 1;
          return { ...enemy, health: 0, x: -100 };
        }
        
        return { ...enemy, health: enemyHealth };
      }).filter(enemy => enemy.x > -enemy.width);
      
      let characterHit = false;
      enemiesAfterCollision.forEach(enemy => {
        if (updatedCharacter.x < enemy.x + enemy.width &&
            updatedCharacter.x + CHARACTER_WIDTH > enemy.x &&
            updatedCharacter.y < enemy.y + enemy.height &&
            updatedCharacter.y + CHARACTER_HEIGHT > enemy.y) {
          characterHit = true;
        }
      });
      
      if (characterHit) {
        updatedLives--;
        updatedCharacter.x = 50;
      }
      
      updatedScore += 0.1 * delta;
      
      if (Math.floor(prevState.score / 100) < Math.floor(updatedScore / 100)) {
        updatedConeBalance += 1;
      }
      
      const gameOver = updatedLives <= 0;
      
      return {
        ...prevState,
        score: updatedScore,
        lives: updatedLives,
        coneBalance: updatedConeBalance,
        gameOver: gameOver,
        character: updatedCharacter,
        projectiles: projectilesAfterCollision.filter(p => p.x > -50),
        enemies: enemiesAfterCollision,
        lastEnemySpawn: prevState.lastEnemySpawn
      };
    });

    renderGame();
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    gameState.terrain.forEach(block => {
      if (block.type === 'ground') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(block.x, block.y, block.width, 5);
      } else if (block.type === 'spike') {
        ctx.fillStyle = '#696969';
        
        const spikeWidth = 10;
        const spikes = Math.floor(block.width / spikeWidth);
        
        for (let i = 0; i < spikes; i++) {
          ctx.beginPath();
          ctx.moveTo(block.x + (i * spikeWidth), block.y + block.height);
          ctx.lineTo(block.x + (i * spikeWidth) + (spikeWidth / 2), block.y);
          ctx.lineTo(block.x + (i * spikeWidth) + spikeWidth, block.y + block.height);
          ctx.closePath();
          ctx.fill();
        }
      }
    });
    
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(
      gameState.character.x,
      gameState.character.y,
      CHARACTER_WIDTH,
      CHARACTER_HEIGHT
    );
    
    gameState.projectiles.forEach(proj => {
      if (proj.fromPlayer) {
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        ctx.lineTo(proj.x + proj.width, proj.y + proj.height / 2);
        ctx.lineTo(proj.x, proj.y + proj.height);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
      }
    });
    
    gameState.enemies.forEach(enemy => {
      if (enemy.type === 'lizard') {
        ctx.fillStyle = '#008000';
      } else if (enemy.type === 'croc') {
        ctx.fillStyle = '#006400';
      } else if (enemy.type === 'snake') {
        ctx.fillStyle = '#800080';
      }
      
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`Score: ${Math.floor(gameState.score)}`, 20, 30);
    ctx.fillText(`$THC: ${gameState.coneBalance}`, 20, 60);
    
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '30px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
      
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(`Final Score: ${Math.floor(gameState.score)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
      ctx.fillText(`$THC Earned: ${gameState.coneBalance}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      
      ctx.textAlign = 'start';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
    renderGame();
  }, []);

  useEffect(() => {
    if (gameState.gameOver && gameState.coneBalance > 0 && address) {
      toast({
        title: "Crypto Earned!",
        description: `${gameState.coneBalance} $THC added to your wallet!`,
      });
    }
  }, [gameState.gameOver, gameState.coneBalance, address]);

  return (
    <div className="win95-window w-full h-full overflow-hidden">
      <div className="win95-title-bar px-2 py-1 flex justify-between items-center">
        <div className="text-white">Reptilian Attack</div>
      </div>
      <div className="p-4 bg-[#c0c0c0] flex flex-col items-center">
        <div className="mb-4 win95-inset p-2 w-full max-w-screen-lg">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-700 bg-white mx-auto"
          />
        </div>
        
        <div className="flex gap-2 mb-4">
          {!gameState.gameStarted ? (
            <>
              {!address ? (
                <WalletConnector />
              ) : (
                <Button onClick={startGame} className="win95-button">
                  Start Game
                </Button>
              )}
            </>
          ) : (
            <>
              {gameState.gameOver ? (
                <Button onClick={startGame} className="win95-button">
                  Play Again
                </Button>
              ) : (
                <Button onClick={pauseGame} className="win95-button">
                  {gameState.paused ? "Resume" : "Pause"}
                </Button>
              )}
            </>
          )}
        </div>
        
        <div className="win95-panel p-2 w-full max-w-screen-lg">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm space-y-1">
            <li>• Use <span className="font-bold">UP ARROW</span> or <span className="font-bold">SPACE</span> to jump</li>
            <li>• Use <span className="font-bold">CTRL</span> or <span className="font-bold">X</span> to shoot ice cream cones</li>
            <li>• Survive as long as possible and defeat enemies to earn $THC</li>
            <li>• $THC can be used to purchase upgrades in the NFT Shop</li>
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
    </div>
  );
};

export default Game;
