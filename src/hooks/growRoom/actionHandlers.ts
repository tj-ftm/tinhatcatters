
import { toast } from '@/hooks/use-toast';
import { 
  GrowthStage, 
  Plant, 
  Equipment, 
  EquipmentType
} from '@/types/growRoom';
import { createNewPlant, calculateMultipliers } from './plantUtils';

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

// Handle upgrading equipment
export const handleUpgradeEquipment = async (
  type: EquipmentType,
  equipment: Record<EquipmentType, Equipment>,
  thcAmount: number,
  handleTransaction: (amount: number, actionType: string) => Promise<boolean>,
  setThcAmount: React.Dispatch<React.SetStateAction<number>>,
  setEquipment: React.Dispatch<React.SetStateAction<Record<EquipmentType, Equipment>>>,
  setShowUpgradeModal: React.Dispatch<React.SetStateAction<EquipmentType | null>>,
  toast: any
) => {
  const item = equipment[type];
  
  // Check if upgrade is available
  if (!item.nextLevel) {
    toast({
      title: "Max Level Reached",
      description: "This equipment is already at maximum level.",
      variant: "destructive"
    });
    return;
  }
  
  // Check if player has enough THC
  if (thcAmount < item.nextLevel.cost) {
    toast({
      title: "Not Enough THC",
      description: `You need ${item.nextLevel.cost} THC to upgrade this equipment.`,
      variant: "destructive"
    });
    return;
  }
  
  // Process transaction
  const success = await handleTransaction(item.nextLevel.cost, `Upgrading ${type}`);
  
  if (success) {
    // Update equipment
    const updatedEquipment = {
      ...equipment,
      [type]: {
        ...item,
        level: item.level + 1,
        name: item.nextLevel.name,
        effect: item.nextLevel.effect,
        nextLevel: null, // Remove next level for simplicity (in a real game, you'd fetch the next upgrade)
      }
    };
    
    // Update state
    setEquipment(updatedEquipment);
    setThcAmount(prevAmount => prevAmount - item.nextLevel!.cost);
    setShowUpgradeModal(null);
    
    toast({
      title: "Equipment Upgraded",
      description: `Your ${type} has been upgraded to ${item.nextLevel.name}!`,
    });
  }
};

// Handle upgrading grow room capacity
export const handleUpgradeCapacity = async (
  plantCapacity: number,
  thcAmount: number,
  handleTransaction: (amount: number, actionType: string) => Promise<boolean>,
  setThcAmount: React.Dispatch<React.SetStateAction<number>>,
  setPlantCapacity: React.Dispatch<React.SetStateAction<number>>,
  toast: any
) => {
  // Check if at maximum capacity
  if (plantCapacity >= 50) {
    toast({
      title: "Maximum Capacity Reached",
      description: "Your grow room is at its maximum size of 50 plants.",
      variant: "destructive"
    });
    return;
  }
  
  // Fixed expansion cost at 2 THC
  const upgradeCost = 2;
  
  // Check if player has enough THC
  if (thcAmount < upgradeCost) {
    toast({
      title: "Not Enough THC",
      description: `You need ${upgradeCost} THC to upgrade your grow room capacity.`,
      variant: "destructive"
    });
    return;
  }
  
  // Process transaction
  const success = await handleTransaction(upgradeCost, "Upgrading Capacity");
  
  if (success) {
    // Update state
    setPlantCapacity(prevCapacity => prevCapacity + 1);
    setThcAmount(prevAmount => prevAmount - upgradeCost);
    
    toast({
      title: "Capacity Upgraded",
      description: `Your grow room capacity has been increased to ${plantCapacity + 1}!`,
    });
  }
};
