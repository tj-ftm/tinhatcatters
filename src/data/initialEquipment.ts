
import { EquipmentType, Equipment } from '@/types/growRoom';

// Initial equipment setup with costs reduced by 100x
export const initialEquipment: Record<EquipmentType, Equipment> = {
  [EquipmentType.Light]: {
    type: EquipmentType.Light,
    level: 1,
    name: 'Basic Lamp',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'LED Grow Light',
      effect: { speedBoost: 1.5, qualityBoost: 1.2 },
      cost: 1 // Reduced from 100
    }
  },
  [EquipmentType.Pot]: {
    type: EquipmentType.Pot,
    level: 1,
    name: 'Clay Pot',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Smart Pot',
      effect: { speedBoost: 1.2, qualityBoost: 1.5 },
      cost: 1.5 // Reduced from 150
    }
  },
  [EquipmentType.Nutrients]: {
    type: EquipmentType.Nutrients,
    level: 1,
    name: 'Basic Fertilizer',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Organic Mix',
      effect: { speedBoost: 1.1, qualityBoost: 1.8 },
      cost: 1.2 // Reduced from 120
    }
  },
  [EquipmentType.Ventilation]: {
    type: EquipmentType.Ventilation,
    level: 1,
    name: 'Small Fan',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Exhaust System',
      effect: { speedBoost: 1.6, qualityBoost: 1.1 },
      cost: 2 // Reduced from 200
    }
  },
  [EquipmentType.Automation]: {
    type: EquipmentType.Automation,
    level: 1,
    name: 'Manual Watering',
    effect: { speedBoost: 1, qualityBoost: 1 },
    cost: 0,
    nextLevel: {
      name: 'Auto-Waterer',
      effect: { speedBoost: 1.3, qualityBoost: 1.3 },
      cost: 1.8 // Reduced from 180
    }
  }
};
