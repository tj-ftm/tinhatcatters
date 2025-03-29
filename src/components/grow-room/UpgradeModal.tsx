
import React from 'react';
import { CircleDollarSign, ArrowRight } from 'lucide-react';
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
  
  // Get appropriate image for each equipment type
  const getEquipmentImageSrc = (type: EquipmentType, isNextLevel: boolean = false) => {
    const level = isNextLevel ? 'advanced' : 'basic';
    
    switch (type) {
      case EquipmentType.Light:
        return `https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=200&h=150&fit=crop&q=80`;
      case EquipmentType.Pot:
        return `https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=200&h=150&fit=crop&q=80`;
      case EquipmentType.Nutrients:
        return `https://images.unsplash.com/photo-1598282524945-d0436638ae41?w=200&h=150&fit=crop&q=80`;
      case EquipmentType.Ventilation:
        return `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=150&fit=crop&q=80`;
      case EquipmentType.Automation:
        return `https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=200&h=150&fit=crop&q=80`;
      default:
        return '';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="win95-window p-4 max-w-md w-full">
        <div className="win95-title-bar mb-2 flex justify-between">
          <span>Upgrade {item.name}</span>
          <button onClick={onClose} className="px-2">✖</button>
        </div>
        
        <div className="p-4">
          {/* Image comparison section */}
          <div className="flex items-center justify-center gap-4 mb-6 win95-inset p-3">
            <div className="flex flex-col items-center">
              <div className="border-2 border-gray-400 p-1 mb-2">
                <img 
                  src={getEquipmentImageSrc(showUpgradeModal)}
                  alt={`Current ${item.name}`}
                  className="w-32 h-24 object-cover"
                />
              </div>
              <span className="text-sm text-center">{item.name}</span>
            </div>
            
            <ArrowRight className="w-8 h-8 text-green-600" />
            
            <div className="flex flex-col items-center">
              <div className="border-2 border-green-500 p-1 mb-2">
                <img 
                  src={getEquipmentImageSrc(showUpgradeModal, true)}
                  alt={`Upgraded ${item.nextLevel.name}`}
                  className="w-32 h-24 object-cover"
                />
              </div>
              <span className="text-sm text-center">{item.nextLevel.name}</span>
            </div>
          </div>
          
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
