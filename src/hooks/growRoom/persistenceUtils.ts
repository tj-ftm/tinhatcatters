
import { Plant, Equipment, EquipmentType, GameState, GrowthStage } from '@/types/growRoom';
import { calculateMultipliers } from './plantUtils';

// Save game state to localStorage
export const saveGameState = (
  address: string,
  plants: Plant[],
  equipment: Record<EquipmentType, Equipment>,
  plantCapacity: number,
  thcAmount: number
) => {
  const saveGameStateFunction = () => {
    const updatedPlants = plants.map(plant => ({
      ...plant,
      lastUpdateTime: Date.now()
    }));
    
    const gameState: GameState = {
      thcAmount,
      plants: updatedPlants,
      equipment,
      plantCapacity,
      lastSaved: Date.now()
    };
    
    localStorage.setItem(`growroom-${address}`, JSON.stringify(gameState));
    console.log('Game state saved:', gameState);
  };
  
  saveGameStateFunction();
  
  // Set up auto-save interval
  const saveInterval = setInterval(saveGameStateFunction, 15000); // Save every 15 seconds
  
  return saveInterval;
};

// Load game state from localStorage
export const loadGameState = (
  address: string,
  currentEquipment: Record<EquipmentType, Equipment>,
  toast: any
) => {
  const savedState = localStorage.getItem(`growroom-${address}`);
  if (!savedState) return null;
  
  try {
    const parsedState: GameState = JSON.parse(savedState);
    
    // Update plants with correct progress based on time passed
    const updatedPlants = parsedState.plants.map(plant => {
      if (!plant.isGrowing || plant.stage === GrowthStage.Harvest) return plant;
      
      // Calculate progress based on time passed since last save
      const { speedMultiplier } = calculateMultipliers(parsedState.equipment);
      const now = Date.now();
      const timePassed = now - (plant.lastUpdateTime || parsedState.lastSaved);
      const progressIncrement = (timePassed / 1000) * speedMultiplier;
      
      let newProgress = plant.progress + progressIncrement;
      let newStage: GrowthStage = plant.stage;
      
      // Check if plant moved to next stage
      if (newProgress >= 100) {
        newProgress = 0;
        
        if (newStage === GrowthStage.Seed) {
          newStage = GrowthStage.Sprout;
        } else if (newStage === GrowthStage.Sprout) {
          newStage = GrowthStage.Vegetative;
        } else if (newStage === GrowthStage.Vegetative) {
          newStage = GrowthStage.Flowering;
        } else if (newStage === GrowthStage.Flowering) {
          newStage = GrowthStage.Harvest;
          newProgress = 100;
        }
      }
      
      return {
        ...plant,
        progress: newProgress,
        stage: newStage,
        lastUpdateTime: now,
        isGrowing: newStage !== GrowthStage.Harvest,
      };
    });
    
    toast({
      title: "Game Loaded",
      description: "Your grow room progress has been loaded!",
    });
    
    return {
      updatedPlants,
      updatedEquipment: parsedState.equipment,
      updatedPlantCapacity: parsedState.plantCapacity,
      updatedThcAmount: parsedState.thcAmount
    };
  } catch (error) {
    console.error('Error loading game state:', error);
    toast({
      title: "Load Error",
      description: "Failed to load your saved game. Starting fresh.",
      variant: "destructive",
    });
    return null;
  }
};
