
import { toast } from '@/hooks/use-toast';
import { 
  Plant, 
  Equipment, 
  EquipmentType
} from '@/types/growRoom';
import { createNewPlant, calculateMultipliers } from '../plantUtils';

// Handle planting a new seed
export const handlePlantSeed = async (
  plants: Plant[],
  plantCapacity: number,
  thcAmount: number,
  handleTransaction: (amount: number, actionType: string) => Promise<boolean>,
  equipment: Record<EquipmentType, Equipment>,
  setPlants: React.Dispatch<React.SetStateAction<Plant[]>>,
  setThcAmount: React.Dispatch<React.SetStateAction<number>>,
  toast: any
) => {
  // Check if grow room is full
  if (plants.length >= plantCapacity) {
    toast({
      title: "Grow Room Full",
      description: "Upgrade your grow room capacity to plant more seeds.",
      variant: "destructive"
    });
    return;
  }
  
  // Cost to plant a seed - must match what's shown in the UI
  const seedCost = 0.1;
  
  // Check if player has enough THC
  if (thcAmount < seedCost) {
    toast({
      title: "Not Enough THC",
      description: `You need ${seedCost} THC to plant a new seed.`,
      variant: "destructive"
    });
    return;
  }
  
  // Process transaction
  const success = await handleTransaction(seedCost, "Planting Seed");
  
  if (success) {
    // Calculate multipliers
    const { speedMultiplier } = calculateMultipliers(equipment);
    
    // Create new plant
    const newPlant = createNewPlant(speedMultiplier);
    
    // Update state
    setPlants([...plants, newPlant]);
    setThcAmount(prevAmount => prevAmount - seedCost);
    
    toast({
      title: "Seed Planted",
      description: "A new seed has been planted in your grow room.",
    });
  }
};
