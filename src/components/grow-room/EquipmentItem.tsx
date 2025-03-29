
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { Equipment, EquipmentType } from '@/types/growRoom';
import { getLevelLabel, getEquipmentIcon } from '@/data/initialEquipment';

interface EquipmentItemProps {
  type: EquipmentType;
  equipment: Equipment;
  isLoading: boolean;
  onUpgrade: () => void;
  className?: string;
}

const EquipmentItem: React.FC<EquipmentItemProps> = ({
  type,
  equipment,
  isLoading,
  onUpgrade,
  className = ''
}) => {
  const Icon = getEquipmentIcon(type);
  const levelLabel = getLevelLabel(equipment.level);
  
  return (
    <div className={`win95-panel p-1 flex flex-col items-center ${className}`}>
      <div className="p-1">
        <Icon className="w-8 h-8 text-purple-600" />
      </div>
      <div className="text-xs text-center mb-1">{type}</div>
      <div className="text-xs font-bold text-center">{levelLabel}</div>
      <Button
        className="win95-button mt-1 py-0 h-6 w-full flex items-center justify-center text-xs"
        onClick={onUpgrade}
        disabled={isLoading}
      >
        <ArrowUp className="w-3 h-3 mr-1" />
        Upgrade
      </Button>
    </div>
  );
};

export default EquipmentItem;
