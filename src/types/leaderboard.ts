
import { EquipmentType, Equipment } from './growRoom';

export interface PlantStats {
  id: number;
  seedTime: number;
  harvestTime: number;
  totalGrowTime: number;
  quality: number;
  thcProduced: number;
}

export interface PlayerStats {
  walletAddress: string;
  displayName?: string;
  totalPlantsGrown: number;
  totalThcProduced: number;
  fastestGrowTime: number;
  highestQualityPlant: number;
  lastActive: number;
  plantStats: PlantStats[];
  equipment: Record<EquipmentType, Equipment>;
}

export interface LeaderboardState {
  players: Record<string, PlayerStats>;
  lastUpdated: number;
}
