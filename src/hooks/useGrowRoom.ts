import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { sendTransaction } from '@/lib/web3';
import { 
  GrowthStage, 
  Plant, 
  Equipment, 
  EquipmentType,
  GameState
} from '@/types/growRoom';
import { initialEquipment } from '@/data/initialEquipment';
import { 
  calculateMultipliers,
  updatePlantProgress,
  createNewPlant 
} from '@/hooks/growRoom/plantUtils';
import { 
  saveGameState, 
  loadGameState 
} from '@/hooks/growRoom/persistenceUtils';
import {
  handlePlantSeed,
  handleHarvestPlant,
  handleUpgradeEquipment,
  handleUpgradeCapacity
} from '@/hooks/growRoom/actionHandlers';

// Wallet address to send THC to
const RECIPIENT_ADDRESS = '0x097766e8dE97A0A53B3A31AB4dB02d0004C8cc4F';

export const useGrowRoom = () => {
  const { thcBalance, address } = useWeb3();
  const [thcAmount, setThcAmount] = useState<number>(0);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [equipment, setEquipment] = useState<Record<EquipmentType, Equipment>>(initialEquipment);
  const [plantCapacity, setPlantCapacity] = useState<number>(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState<EquipmentType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { toast } = useToast();
  const { recordPlantHarvest } = useLeaderboard();
  
  // Load game state from localStorage on component mount
  useEffect(() => {
    if (!address) return;
    
    const result = loadGameState(address, equipment, toast);
    if (result) {
      const { updatedPlants, updatedEquipment, updatedPlantCapacity } = result;
      setPlants(updatedPlants);
      setEquipment(updatedEquipment);
      setPlantCapacity(updatedPlantCapacity);
    }
  }, [address, toast]);
  
  // Save game state to localStorage whenever important state changes
  useEffect(() => {
    if (!address) return;
    
    const saveInterval = saveGameState(address, plants, equipment, plantCapacity, thcAmount);
    
    return () => clearInterval(saveInterval);
  }, [thcAmount, plants, equipment, plantCapacity, address]);

  // Update local THC amount from wallet balance if available
  useEffect(() => {
    if (thcBalance) {
      const parsedBalance = parseFloat(thcBalance);
      if (!isNaN(parsedBalance)) {
        setThcAmount(parsedBalance);
      }
    }
  }, [thcBalance]);

  // Handle plant growing process
  useEffect(() => {
    const multipliers = calculateMultipliers(equipment);
    const growthInterval = setInterval(() => {
      setPlants(prevPlants => 
        prevPlants.map(plant => updatePlantProgress(plant, multipliers.speedMultiplier))
      );
    }, 1000);

    return () => clearInterval(growthInterval);
  }, [equipment]);

  // Function to handle THC transaction
  const handleTransaction = async (amount: number, actionType: string): Promise<boolean> => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to perform this action.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    setPendingAction(actionType);

    try {
      // Send THC to the recipient address
      const success = await sendTransaction(RECIPIENT_ADDRESS, amount.toString());
      
      if (success) {
        toast({
          title: "Transaction Successful",
          description: `Successfully sent ${amount} THC to the game.`,
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

  // Plant a new seed
  const plantSeed = async () => {
    await handlePlantSeed(
      plants,
      plantCapacity,
      thcAmount,
      handleTransaction,
      equipment,
      setPlants,
      setThcAmount,
      toast
    );
  };

  // Harvest a plant
  const harvestPlant = (plantId: number) => {
    handleHarvestPlant(
      plantId,
      plants,
      equipment,
      setThcAmount,
      setPlants,
      toast,
      // Add the callback to record the harvest for leaderboard
      (plant, thcProduced, equipment) => {
        recordPlantHarvest(plant, thcProduced, equipment);
      }
    );
  };

  // Upgrade equipment
  const upgradeEquipment = async (type: EquipmentType) => {
    await handleUpgradeEquipment(
      type,
      equipment,
      thcAmount,
      handleTransaction,
      setThcAmount,
      setEquipment,
      setShowUpgradeModal,
      toast
    );
  };

  // Upgrade grow room capacity
  const upgradeCapacity = async () => {
    await handleUpgradeCapacity(
      plantCapacity,
      thcAmount,
      handleTransaction,
      setThcAmount,
      setPlantCapacity,
      toast
    );
  };

  // Get color class based on growth stage
  const getGrowthColor = (stage: GrowthStage) => {
    switch (stage) {
      case GrowthStage.Seed: return 'bg-yellow-600';
      case GrowthStage.Sprout: return 'bg-green-300';
      case GrowthStage.Vegetative: return 'bg-green-500';
      case GrowthStage.Flowering: return 'bg-purple-500';
      case GrowthStage.Harvest: return 'bg-pink-600';
      default: return 'bg-gray-400';
    }
  };

  return {
    thcAmount,
    plants,
    equipment,
    plantCapacity,
    showUpgradeModal,
    setShowUpgradeModal,
    isLoading,
    pendingAction,
    calculateMultipliers: () => calculateMultipliers(equipment),
    plantSeed,
    harvestPlant,
    upgradeEquipment,
    upgradeCapacity,
    getGrowthColor
  };
};
