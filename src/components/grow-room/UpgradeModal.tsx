
import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Equipment, EquipmentType } from '@/types/growRoom';

interface UpgradeModalProps {
  showUpgradeModal: EquipmentType | null;
  equipment: Record<EquipmentType, Equipment>;
  thcAmount: number;
  isLoading: boolean;
  onClose: () => void;
  onUpgrade: (type: EquipmentType) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  showUpgradeModal,
  equipment,
  thcAmount,
  isLoading,
  onClose,
  onUpgrade
}) => {
  if (!showUpgradeModal) return null;
  
  const item = equipment[showUpgradeModal];
  if (!item.nextLevel) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="win95-window p-4 max-w-md w-full">
        <div className="win95-title-bar mb-2 flex justify-between">
          <span>Upgrade {item.name}</span>
          <button onClick={onClose} className="px-2">✖</button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4">Upgrade to {item.nextLevel.name}</h3>
          
          <div className="mb-4">
            <p className="mb-2">Current Effects:</p>
            <ul className="list-disc pl-5 mb-2">
              <li>Growth Speed: +{Math.round((item.effect.speedBoost - 1) * 100)}%</li>
              <li>Quality Boost: +{Math.round((item.effect.qualityBoost - 1) * 100)}%</li>
            </ul>
            
            <p className="mb-2">New Effects:</p>
            <ul className="list-disc pl-5">
              <li>Growth Speed: +{Math.round((item.nextLevel.effect.speedBoost - 1) * 100)}%</li>
              <li>Quality Boost: +{Math.round((item.nextLevel.effect.qualityBoost - 1) * 100)}%</li>
            </ul>
          </div>
          
          <div className="flex justify-between">
            <span className="win95-button cursor-pointer" onClick={onClose}>Cancel</span>
            <Button 
              className="win95-button flex items-center"
              onClick={() => onUpgrade(showUpgradeModal)}
              disabled={thcAmount < item.nextLevel.cost || isLoading}
            >
              <CircleDollarSign className="w-4 h-4 mr-1" />
              Upgrade ({item.nextLevel.cost} $THC)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
