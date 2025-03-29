
import React from 'react';
import { useGrowRoom } from '@/hooks/useGrowRoom';
import StatsBar from './grow-room/StatsBar';
import GrowingArea from './grow-room/GrowingArea';
import EquipmentArea from './grow-room/EquipmentArea';
import LoadingOverlay from './grow-room/LoadingOverlay';
import UpgradeModal from './grow-room/UpgradeModal';

const GrowRoom: React.FC = () => {
  const {
    thcAmount,
    plants,
    equipment,
    plantCapacity,
    showUpgradeModal,
    setShowUpgradeModal,
    isLoading,
    pendingAction,
    calculateMultipliers,
    plantSeed,
    harvestPlant,
    upgradeEquipment,
    upgradeCapacity,
    getGrowthColor
  } = useGrowRoom();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Growing Area - Now larger */}
        <div className="flex-1 flex mb-2">
          <GrowingArea 
            plants={plants}
            plantCapacity={plantCapacity}
            isLoading={isLoading}
            thcAmount={thcAmount}
            getGrowthColor={getGrowthColor}
            onPlantSeed={plantSeed}
            onHarvestPlant={harvestPlant}
          />
        </div>
        
        {/* Equipment Area - Smaller and horizontal */}
        <div className="mb-1">
          <EquipmentArea 
            equipment={equipment}
            plantCapacity={plantCapacity}
            isLoading={isLoading}
            onShowUpgradeModal={setShowUpgradeModal}
            onUpgradeCapacity={upgradeCapacity}
          />
        </div>
        
        {/* Stats Bar - At the bottom with reduced spacing */}
        <div>
          <StatsBar 
            thcAmount={thcAmount}
            plantCount={plants.length}
            plantCapacity={plantCapacity}
            isLoading={isLoading}
            onPlantSeed={plantSeed}
          />
        </div>
      </div>
      
      {/* Modals and Overlays */}
      <UpgradeModal 
        showUpgradeModal={showUpgradeModal}
        equipment={equipment}
        thcAmount={thcAmount}
        isLoading={isLoading}
        onClose={() => setShowUpgradeModal(null)}
        onUpgrade={upgradeEquipment}
      />
      
      <LoadingOverlay 
        isLoading={isLoading}
        actionType={pendingAction}
      />
    </div>
  );
};

export default GrowRoom;
