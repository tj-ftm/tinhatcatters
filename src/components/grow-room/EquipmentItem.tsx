
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Fan, Droplets } from 'lucide-react';
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
        return <Sun className="w-4 h-4 mr-1 text-yellow-500" />;
      case EquipmentType.Pot:
        return <div className="w-4 h-4 mr-1 flex items-center justify-center">🪴</div>;
      case EquipmentType.Nutrients:
        return <Droplets className="w-4 h-4 mr-1 text-blue-500" />;
      case EquipmentType.Ventilation:
        return <Fan className="w-4 h-4 mr-1 text-gray-500" />;
      case EquipmentType.Automation:
        return <div className="w-4 h-4 mr-1 flex items-center justify-center">💧</div>;
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
    <div className="win95-window p-1">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center">
          {getIcon()}
          <div>
            <div className="font-bold text-xs">{equipment.name.split(' ')[0]}</div>
            <div className="text-[10px]">
              {getDisplayMetric()}
            </div>
          </div>
        </div>
        {equipment.nextLevel && (
          <Button
            className="win95-button px-1 py-0.5 text-[10px]"
            onClick={onUpgrade}
            disabled={isLoading}
          >
            Up
          </Button>
        )}
      </div>
    </div>
  );
};

export default EquipmentItem;
