
// Plant growth stages
export enum GrowthStage {
  Seed = 'seed',
  Sprout = 'sprout',
  Vegetative = 'vegetative',
  Flowering = 'flowering',
  Harvest = 'harvest'
}

// Equipment types
export enum EquipmentType {
  Light = 'light',
  Pot = 'pot',
  Nutrients = 'nutrients',
  Ventilation = 'ventilation',
  Automation = 'automation'
}

// Plant interface
export interface Plant {
  id: number;
  stage: GrowthStage;
  progress: number;
  totalGrowthTime: number;
  isGrowing: boolean;
  quality: number;
  lastUpdateTime?: number;
}

// Equipment interface
export interface Equipment {
  type: EquipmentType;
  level: number;
  name: string;
  effect: {
    speedBoost: number;
    qualityBoost: number;
  };
  cost: number;
  nextLevel?: {
    name: string;
    effect: {
      speedBoost: number;
      qualityBoost: number;
    };
    cost: number;
  };
}

// Game state interface for persistence
export interface GameState {
  thcAmount: number;
  plants: Plant[];
  equipment: Record<EquipmentType, Equipment>;
  plantCapacity: number;
  lastSaved: number;
}
