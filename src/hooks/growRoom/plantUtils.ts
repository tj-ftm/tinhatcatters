
import { GrowthStage, Plant, Equipment, EquipmentType } from '@/types/growRoom';

// Calculate total speed and quality multipliers from equipment
export const calculateMultipliers = (equipmentState: Record<EquipmentType, Equipment>) => {
  let speedMultiplier = 1;
  let qualityMultiplier = 1;

  Object.values(equipmentState).forEach(item => {
    speedMultiplier *= item.effect.speedBoost;
    qualityMultiplier *= item.effect.qualityBoost;
  });

  return { speedMultiplier, qualityMultiplier };
};

// Create a new plant
export const createNewPlant = (speedMultiplier: number): Plant => {
  return {
    id: Date.now(),
    stage: GrowthStage.Seed,
    progress: 0,
    totalGrowthTime: 15000 / speedMultiplier, // 15 seconds for seed stage
    isGrowing: true,
    quality: 1,
    lastUpdateTime: Date.now()
  };
};

// Update plant progress
export const updatePlantProgress = (plant: Plant, speedMultiplier: number): Plant => {
  if (!plant.isGrowing) return plant;
  
  const now = Date.now();
  const newProgress = plant.progress + (1 * speedMultiplier);
  
  // Check if plant is ready for next stage
  if (newProgress >= 100) {
    // Move to next stage or harvest
    switch (plant.stage) {
      case GrowthStage.Seed:
        return {
          ...plant,
          stage: GrowthStage.Sprout,
          progress: 0,
          totalGrowthTime: 30000 / speedMultiplier, // 30 seconds for sprout stage
          lastUpdateTime: now
        };
      case GrowthStage.Sprout:
        return {
          ...plant,
          stage: GrowthStage.Vegetative,
          progress: 0,
          totalGrowthTime: 45000 / speedMultiplier, // 45 seconds for vegetative stage
          lastUpdateTime: now
        };
      case GrowthStage.Vegetative:
        return {
          ...plant,
          stage: GrowthStage.Flowering,
          progress: 0,
          totalGrowthTime: 60000 / speedMultiplier, // 60 seconds for flowering stage
          lastUpdateTime: now
        };
      case GrowthStage.Flowering:
        return {
          ...plant,
          stage: GrowthStage.Harvest,
          progress: 100,
          isGrowing: false,
          lastUpdateTime: now
        };
      default:
        return plant;
    }
  }
  
  return {
    ...plant,
    progress: newProgress,
    lastUpdateTime: now
  };
};
