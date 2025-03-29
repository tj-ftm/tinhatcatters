
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Fan, Droplets, ArrowUp } from 'lucide-react';
import { Equipment, EquipmentType } from '@/types/growRoom';

interface EquipmentItemProps {
  type: EquipmentType;
  equipment: Equipment;
  isLoading: boolean;
  onUpgrade: () => void;
}

const EquipmentItem: React.FC<EquipmentItemProps> = ({ type, equipment, isLoading, onUpgrade }) => {
  const getIcon = () => {
    switch (type) {
      case EquipmentType.Light:
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case EquipmentType.Pot:
        return <div className="w-5 h-5 flex items-center justify-center">🪴</div>;
      case EquipmentType.Nutrients:
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case EquipmentType.Ventilation:
        return <Fan className="w-5 h-5 text-gray-500" />;
      case EquipmentType.Automation:
        return <div className="w-5 h-5 flex items-center justify-center">💧</div>;
      default:
        return null;
    }
  };
  
  const getDisplayMetric = () => {
    switch (type) {
      case EquipmentType.Light:
      case EquipmentType.Ventilation:
        return `Speed: +${Math.round((equipment.effect.speedBoost - 1) * 100)}%`;
      case EquipmentType.Pot:
      case EquipmentType.Nutrients:
        return `Quality: +${Math.round((equipment.effect.qualityBoost - 1) * 100)}%`;
      case EquipmentType.Automation:
        return `Overall: +${Math.round((equipment.effect.speedBoost - 1) * 100)}%`;
      default:
        return '';
    }
  };
  
  return (
    <div className="win95-window p-2 aspect-square flex flex-col">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center mb-2">
          <div className="flex flex-col items-center">
            {getIcon()}
            <div className="font-bold text-center mt-1">{equipment.name}</div>
          </div>
        </div>
        <div className="text-xs text-center mb-auto">
          {getDisplayMetric()}
        </div>
        {equipment.nextLevel && (
          <Button
            className="win95-button px-2 py-1 text-xs mt-2"
            onClick={onUpgrade}
            disabled={isLoading}
          >
            <ArrowUp className="w-3 h-3 mr-1" />
            <span>{equipment.nextLevel.cost} $THC</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EquipmentItem;
