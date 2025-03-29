
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
        return <Sun className="w-5 h-5 mr-2 text-yellow-500" />;
      case EquipmentType.Pot:
        return <div className="w-5 h-5 mr-2 flex items-center justify-center">🪴</div>;
      case EquipmentType.Nutrients:
        return <Droplets className="w-5 h-5 mr-2 text-blue-500" />;
      case EquipmentType.Ventilation:
        return <Fan className="w-5 h-5 mr-2 text-gray-500" />;
      case EquipmentType.Automation:
        return <div className="w-5 h-5 mr-2 flex items-center justify-center">💧</div>;
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
    <div className="win95-window p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {getIcon()}
          <div>
            <div className="font-bold">{equipment.name}</div>
            <div className="text-xs">
              {getDisplayMetric()}
            </div>
          </div>
        </div>
        {equipment.nextLevel && (
          <Button
            className="win95-button px-2 py-1 text-xs"
            onClick={onUpgrade}
            disabled={isLoading}
          >
            Upgrade
          </Button>
        )}
      </div>
    </div>
  );
};

export default EquipmentItem;
