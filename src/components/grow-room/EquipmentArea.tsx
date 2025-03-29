
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EquipmentItem from './EquipmentItem';
import { Equipment, EquipmentType } from '@/types/growRoom';
import { Separator } from '@/components/ui/separator';

interface EquipmentAreaProps {
  equipment: Record<EquipmentType, Equipment>;
  plantCapacity: number;
  isLoading: boolean;
  onShowUpgradeModal: (type: EquipmentType) => void;
  onUpgradeCapacity: () => void;
}

const EquipmentArea: React.FC<EquipmentAreaProps> = ({
  equipment,
  plantCapacity,
  isLoading,
  onShowUpgradeModal,
  onUpgradeCapacity
}) => {
  // Fixed expansion cost at 2 THC
  const expansionCost = 2;
  
  return (
    <div className="win95-window p-2 w-full">
      <div className="win95-title-bar mb-2">
        <span>Equipment</span>
      </div>
      
      <div className="p-2 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {/* Light */}
          <EquipmentItem
            type={EquipmentType.Light}
            equipment={equipment[EquipmentType.Light]}
            isLoading={isLoading}
            onUpgrade={() => onShowUpgradeModal(EquipmentType.Light)}
          />
          
          {/* Pot */}
          <EquipmentItem
            type={EquipmentType.Pot}
            equipment={equipment[EquipmentType.Pot]}
            isLoading={isLoading}
            onUpgrade={() => onShowUpgradeModal(EquipmentType.Pot)}
          />
          
          {/* Nutrients */}
          <EquipmentItem
            type={EquipmentType.Nutrients}
            equipment={equipment[EquipmentType.Nutrients]}
            isLoading={isLoading}
            onUpgrade={() => onShowUpgradeModal(EquipmentType.Nutrients)}
          />
          
          {/* Ventilation */}
          <EquipmentItem
            type={EquipmentType.Ventilation}
            equipment={equipment[EquipmentType.Ventilation]}
            isLoading={isLoading}
            onUpgrade={() => onShowUpgradeModal(EquipmentType.Ventilation)}
          />
          
          {/* Automation */}
          <EquipmentItem
            type={EquipmentType.Automation}
            equipment={equipment[EquipmentType.Automation]}
            isLoading={isLoading}
            onUpgrade={() => onShowUpgradeModal(EquipmentType.Automation)}
          />
        </div>
        
        <Separator className="my-2" />
        
        {/* Capacity Upgrade */}
        <div className="win95-window p-2">
          <Button
            className="win95-button flex items-center justify-center w-full"
            onClick={onUpgradeCapacity}
            disabled={isLoading || plantCapacity >= 50}
          >
            <Plus className="w-4 h-4 mr-1" />
            Expand Room ({expansionCost} $THC) - {plantCapacity}/50 Capacity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentArea;
