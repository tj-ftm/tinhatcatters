
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { sendTransaction } from '@/lib/web3';

export interface GameUpgrades {
  speed: number;
  fireRate: number;
  health: number;
}

export interface GameState {
  score: number;
  lives: number;
  health: number;
  thcEarned: number;
  gameOver: boolean;
  gameStarted: boolean;
  paused: boolean;
  upgrades: GameUpgrades;
}

const RECIPIENT_ADDRESS = '0x097766e8dE97A0A53B3A31AB4dB02d0004C8cc4F';
const GAME_START_COST = 0.1;
const UPGRADE_COST = 0.5;

export const useGameState = () => {
  const { address, thcBalance, connect } = useWeb3();
  const [gameState, setGameState] = useState<GameState>({
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
  const { toast } = useToast();

  const updateGameState = (newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

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
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        gameOver: false,
        lives: 3,
        health: 100,
        score: 0,
        thcEarned: 0,
      }));
      return true;
    }
    
    return false;
  };

  const handleUpgrade = async (upgradeType: 'speed' | 'fireRate' | 'health') => {
    if (parseFloat(thcBalance || '0') < UPGRADE_COST) {
      toast({
        title: "Insufficient THC",
        description: `You need at least ${UPGRADE_COST} THC for this upgrade.`,
        variant: "destructive"
      });
      return;
    }

    const success = await handleTransaction(UPGRADE_COST, `Upgrading ${upgradeType}`);
    
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

  return {
    gameState,
    isLoading,
    pendingAction,
    updateGameState,
    pauseGame,
    startGame,
    handleUpgrade,
    address,
    thcBalance,
    connect
  };
};
