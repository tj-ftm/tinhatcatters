
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EquipmentItem from './EquipmentItem';
import { Equipment, EquipmentType } from '@/types/growRoom';

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
  return (
    <div className="win95-window p-2 w-full md:w-1/3">
      <div className="win95-title-bar mb-2">
        <span>Equipment</span>
      </div>
      
      <div className="p-2 space-y-4">
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
        
        {/* Capacity Upgrade */}
        <div className="win95-window p-2 mt-4">
          <Button
            className="win95-button flex items-center justify-center w-full"
            onClick={onUpgradeCapacity}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-1" />
            Expand Room ({plantCapacity * 2} $THC)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentArea;
