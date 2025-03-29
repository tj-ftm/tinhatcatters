
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { 
  GrowthStage, 
  Plant, 
  Equipment, 
  EquipmentType
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
import { useTransactions } from '@/hooks/growRoom/useTransactions';

// Create context with a default empty value
type GrowRoomContextType = {
  thcAmount: number;
  plants: Plant[];
  equipment: Record<EquipmentType, Equipment>;
  plantCapacity: number;
  showUpgradeModal: EquipmentType | null;
  setShowUpgradeModal: (type: EquipmentType | null) => void;
  isLoading: boolean;
  pendingAction: string | null;
  calculateMultipliers: () => { speedMultiplier: number; qualityMultiplier: number };
  plantSeed: () => Promise<void>;
  harvestPlant: (plantId: number) => void;
  upgradeEquipment: (type: EquipmentType) => Promise<void>;
  upgradeCapacity: () => Promise<void>;
  getGrowthColor: (stage: GrowthStage) => string;
};

const GrowRoomContext = createContext<GrowRoomContextType | undefined>(undefined);

export const GrowRoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  const { handleTransaction } = useTransactions(setIsLoading, setPendingAction, toast);
  
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

  const value = {
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

  return (
    <GrowRoomContext.Provider value={value}>
      {children}
    </GrowRoomContext.Provider>
  );
};

// Hook to use the grow room context
export const useGrowRoom = () => {
  const context = useContext(GrowRoomContext);
  if (context === undefined) {
    throw new Error('useGrowRoom must be used within a GrowRoomProvider');
  }
  return context;
};
