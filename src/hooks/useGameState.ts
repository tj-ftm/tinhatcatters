
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { usePoints } from '@/hooks/use-points';

export interface GameUpgrades {
  speed: number;
  fireRate: number;
  health: number;
}

export interface GameState {
  score: number;
  lives: number;
  health: number;
  pointsEarned: number;
  gameOver: boolean;
  gameStarted: boolean;
  paused: boolean;
  upgrades: GameUpgrades;
}

const UPGRADE_COST = 50; // Points cost for upgrades

export const useGameState = () => {
  const { address } = useWeb3();
  const { addPoints, getPoints } = usePoints();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    health: 100,
    pointsEarned: 0,
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
  const { toast } = useToast();

  const updateGameState = (newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  const startGame = async () => {
    // Game is now free to play - no wallet required, but encouraged for leaderboard
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      lives: 3,
      health: 100,
      score: 0,
      pointsEarned: 0,
    }));
    
    toast({
      title: "Game Started!",
      description: address ? "Your score will be saved to the leaderboard!" : "Connect wallet to save your score to the leaderboard",
    });
    
    return true;
  };

  const handleUpgrade = async (upgradeType: 'speed' | 'fireRate' | 'health') => {
    const currentPoints = address ? getPoints(address) : 0;
    
    if (currentPoints < UPGRADE_COST) {
      toast({
        title: "Insufficient Points",
        description: `You need ${UPGRADE_COST} points for this upgrade. Play more games to earn points!`,
        variant: "destructive"
      });
      return;
    }

    if (address) {
      addPoints(address, -UPGRADE_COST);
    }
    
    setGameState(prev => ({
      ...prev,
      upgrades: {
        ...prev.upgrades,
        [upgradeType]: prev.upgrades[upgradeType] + 0.25
      }
    }));
    
    toast({
      title: "Upgrade Successful",
      description: `Your ${upgradeType} has been upgraded! Cost: ${UPGRADE_COST} points`,
    });
  };

  // Save game results when game ends
  const saveGameResults = (finalScore: number, pointsEarned: number) => {
    if (address) {
      addPoints(address, pointsEarned);
      
      // Save to leaderboard
      const gameResult = {
        walletAddress: address,
        score: finalScore,
        pointsEarned,
        timestamp: Date.now(),
        upgrades: gameState.upgrades
      };
      
      const savedResults = localStorage.getItem('reptilian-leaderboard') || '[]';
      const results = JSON.parse(savedResults);
      results.push(gameResult);
      localStorage.setItem('reptilian-leaderboard', JSON.stringify(results));
      
      toast({
        title: "Game Saved!",
        description: `Score: ${finalScore}, Points earned: ${pointsEarned}`,
      });
    } else {
      toast({
        title: "Game Complete!",
        description: `Score: ${finalScore}. Connect wallet to save results and earn points!`,
      });
    }
  };

  return {
    gameState,
    isLoading,
    pendingAction,
    updateGameState,
    pauseGame,
    startGame,
    handleUpgrade,
    saveGameResults,
    address,
    currentPoints: address ? getPoints(address) : 0,
    upgradeCost: UPGRADE_COST
  };
};
