
import { toast } from '@/hooks/use-toast';
import { 
  Plant, 
  Equipment,
  EquipmentType, 
  GrowthStage 
} from '@/types/growRoom';
import { calculateMultipliers } from '../plantUtils';

// Handle harvesting a plant
export const handleHarvestPlant = (
  plantId: number,
  plants: Plant[],
  equipment: Record<EquipmentType, Equipment>,
  setThcAmount: React.Dispatch<React.SetStateAction<number>>,
  setPlants: React.Dispatch<React.SetStateAction<Plant[]>>,
  toast: any,
  onHarvest?: (plant: Plant, thcProduced: number, equipment: Record<EquipmentType, Equipment>) => void
) => {
  // Find plant by ID
  const plantIndex = plants.findIndex(p => p.id === plantId);
  
  if (plantIndex === -1) {
    toast({
      title: "Plant Not Found",
      description: "The plant you're trying to harvest doesn't exist.",
      variant: "destructive"
    });
    return;
  }
  
  const plant = plants[plantIndex];
  
  // Check if plant is ready for harvest
  if (plant.stage !== GrowthStage.Harvest) {
    toast({
      title: "Not Ready",
      description: "This plant is not ready for harvest yet.",
      variant: "destructive"
    });
    return;
  }
  
  // Calculate THC produced based on plant quality and equipment
  const { qualityMultiplier } = calculateMultipliers(equipment);
  const thcProduced = Math.round(10 * plant.quality * qualityMultiplier);
  
  // Remove plant from array
  const updatedPlants = [...plants];
  updatedPlants.splice(plantIndex, 1);
  
  // Update state
  setPlants(updatedPlants);
  setThcAmount(prevAmount => prevAmount + thcProduced);
  
  // Call the onHarvest callback if provided
  if (onHarvest) {
    onHarvest(plant, thcProduced, equipment);
  }
  
  toast({
    title: "Plant Harvested",
    description: `You harvested ${thcProduced} THC from your plant!`,
  });
};
