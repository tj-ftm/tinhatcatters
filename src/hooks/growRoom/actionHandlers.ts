
import { Plant, Equipment, EquipmentType, GrowthStage } from '@/types/growRoom';
import { calculateMultipliers, createNewPlant } from './plantUtils';

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
  if (plants.length >= plantCapacity) {
    toast({
      title: "Maximum Capacity Reached",
      description: "Upgrade your grow room to plant more seeds!",
      variant: "destructive"
    });
    return;
  }

  const seedCost = 0.1; // Reduced from 10
  
  if (thcAmount < seedCost) {
    toast({
      title: "Not Enough $THC",
      description: `You need ${seedCost} $THC to plant a new seed.`,
      variant: "destructive"
    });
    return;
  }

  // Process transaction
  const transactionSuccess = await handleTransaction(seedCost, "Planting Seed");
  if (!transactionSuccess) return;

  const { speedMultiplier } = calculateMultipliers(equipment);
  const newPlant = createNewPlant(speedMultiplier);

  setPlants([...plants, newPlant]);
  setThcAmount(prev => prev - seedCost);

  toast({
    title: "Seed Planted!",
    description: "Your seed has been planted and is now growing.",
  });
};

// Handle harvesting a plant
export const handleHarvestPlant = (
  plantId: number,
  plants: Plant[],
  equipment: Record<EquipmentType, Equipment>,
  setThcAmount: React.Dispatch<React.SetStateAction<number>>,
  setPlants: React.Dispatch<React.SetStateAction<Plant[]>>,
  toast: any
) => {
  const plantToHarvest = plants.find(p => p.id === plantId);
  if (!plantToHarvest || plantToHarvest.stage !== GrowthStage.Harvest) return;

  const { qualityMultiplier } = calculateMultipliers(equipment);
  const thcEarned = Math.floor(25 * qualityMultiplier * plantToHarvest.quality);
  
  setThcAmount(prev => prev + thcEarned);
  setPlants(plants.filter(p => p.id !== plantId));
  
  toast({
    title: "Plant Harvested!",
    description: `You earned ${thcEarned} $THC from your harvest!`
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
  const itemToUpgrade = equipment[type];
  if (!itemToUpgrade.nextLevel) return;

  if (thcAmount < itemToUpgrade.nextLevel.cost) {
    toast({
      title: "Not Enough $THC",
      description: `You need ${itemToUpgrade.nextLevel.cost} $THC for this upgrade.`,
      variant: "destructive"
    });
    return;
  }

  // Process transaction
  const transactionSuccess = await handleTransaction(
    itemToUpgrade.nextLevel.cost, 
    `Upgrading ${itemToUpgrade.name}`
  );
  if (!transactionSuccess) return;

  setThcAmount(prev => prev - itemToUpgrade.nextLevel!.cost);
  
  // Create the next level for the advanced equipment
  let newNextLevel = null;
  if (itemToUpgrade.level === 1) {
    // Set up the third tier with costs reduced by 100x
    switch (type) {
      case EquipmentType.Light:
        newNextLevel = {
          name: 'Full-Spectrum Quantum Board',
          effect: { speedBoost: 2, qualityBoost: 1.5 },
          cost: 3.5 // Reduced from 350
        };
        break;
      case EquipmentType.Pot:
        newNextLevel = {
          name: 'Hydroponic Tray',
          effect: { speedBoost: 1.5, qualityBoost: 2 },
          cost: 4 // Reduced from 400
        };
        break;
      case EquipmentType.Nutrients:
        newNextLevel = {
          name: 'Premium Boost',
          effect: { speedBoost: 1.3, qualityBoost: 2.5 },
          cost: 3 // Reduced from 300
        };
        break;
      case EquipmentType.Ventilation:
        newNextLevel = {
          name: 'Climate Control',
          effect: { speedBoost: 2.2, qualityBoost: 1.3 },
          cost: 4.5 // Reduced from 450
        };
        break;
      case EquipmentType.Automation:
        newNextLevel = {
          name: 'Smart Irrigation',
          effect: { speedBoost: 1.8, qualityBoost: 1.7 },
          cost: 4.2 // Reduced from 420
        };
        break;
    }
  }

  setEquipment({
    ...equipment,
    [type]: {
      ...itemToUpgrade,
      name: itemToUpgrade.nextLevel.name,
      level: itemToUpgrade.level + 1,
      effect: itemToUpgrade.nextLevel.effect,
      nextLevel: newNextLevel
    }
  });

  toast({
    title: "Equipment Upgraded!",
    description: `Your ${type} has been upgraded to ${itemToUpgrade.nextLevel.name}!`
  });

  setShowUpgradeModal(null);
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
  const cost = plantCapacity * 2; // Reduced from 200
  
  if (thcAmount < cost) {
    toast({
      title: "Not Enough $THC",
      description: `You need ${cost} $THC to expand your grow room.`,
      variant: "destructive"
    });
    return;
  }
  
  // Process transaction
  const transactionSuccess = await handleTransaction(cost, "Expanding Grow Room");
  if (!transactionSuccess) return;
  
  setThcAmount(prev => prev - cost);
  setPlantCapacity(prev => prev + 1);
  
  toast({
    title: "Grow Room Expanded!",
    description: `Your grow room can now hold ${plantCapacity + 1} plants!`
  });
};
