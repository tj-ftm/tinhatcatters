
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Lightbulb, Fan, FlowerIcon, Beaker, Timer } from 'lucide-react';
import { Equipment, EquipmentType } from '@/types/growRoom';
import { useIsMobile } from '@/hooks/use-mobile';

interface EquipmentItemProps {
  type: EquipmentType;
  equipment: Equipment;
  isLoading: boolean;
  onUpgrade: () => void;
  className?: string;
}

// Helper functions
const getEquipmentIcon = (type: EquipmentType) => {
  // Mapping equipment types to appropriate Lucide icons
  switch (type) {
    case EquipmentType.Light:
      return Lightbulb;
    case EquipmentType.Ventilation:
      return Fan;
    case EquipmentType.Pot:
      return FlowerIcon;
    case EquipmentType.Nutrients:
      return Beaker;
    case EquipmentType.Automation:
      return Timer;
    default:
      return ArrowUp;
  }
};

const getLevelLabel = (level: number) => {
  switch (level) {
    case 1:
      return 'Basic';
    case 2:
      return 'Standard';
    case 3:
      return 'Advanced';
    case 4:
      return 'Premium';
    case 5:
      return 'Elite';
    default:
      return `Level ${level}`;
  }
};

const EquipmentItem: React.FC<EquipmentItemProps> = ({
  type,
  equipment,
  isLoading,
  onUpgrade,
  className = ''
}) => {
  const Icon = getEquipmentIcon(type);
  const levelLabel = getLevelLabel(equipment.level);
  const isMobile = useIsMobile();
  
  return (
    <div className={`win95-panel p-1 flex flex-col items-center ${className}`}>
      <div className="p-1">
        <Icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-purple-600`} />
      </div>
      <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center mb-1`}>{type}</div>
      <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold text-center`}>{levelLabel}</div>
      <Button
        className={`win95-button mt-1 py-0 ${isMobile ? 'h-5 text-[10px]' : 'h-6 text-xs'} w-full flex items-center justify-center`}
        onClick={onUpgrade}
        disabled={isLoading}
      >
        <ArrowUp className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
        Upgrade
      </Button>
    </div>
  );
};

export default EquipmentItem;
