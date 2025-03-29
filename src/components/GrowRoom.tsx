
import React, { useEffect } from 'react';
import { useGrowRoom } from '@/hooks/useGrowRoom';
import StatsBar from './grow-room/StatsBar';
import GrowingArea from './grow-room/GrowingArea';
import EquipmentArea from './grow-room/EquipmentArea';
import LoadingOverlay from './grow-room/LoadingOverlay';
import UpgradeModal from './grow-room/UpgradeModal';
import { useWindowManagement } from '@/hooks/useWindowManagement';

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

  const { maximizeWindow } = useWindowManagement();

  // Maximize window on load
  useEffect(() => {
    maximizeWindow('growroom');
  }, [maximizeWindow]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Growing Area - Now takes more space */}
        <GrowingArea 
          plants={plants}
          plantCapacity={plantCapacity}
          isLoading={isLoading}
          thcAmount={thcAmount}
          getGrowthColor={getGrowthColor}
          onPlantSeed={plantSeed}
          onHarvestPlant={harvestPlant}
        />
        
        {/* Equipment Area - Now at the bottom and more square */}
        <EquipmentArea 
          equipment={equipment}
          plantCapacity={plantCapacity}
          isLoading={isLoading}
          onShowUpgradeModal={setShowUpgradeModal}
          onUpgradeCapacity={upgradeCapacity}
        />

        {/* Stats Bar - Now at the very bottom */}
        <StatsBar 
          thcAmount={thcAmount}
          plantCount={plants.length}
          plantCapacity={plantCapacity}
          isLoading={isLoading}
          onPlantSeed={plantSeed}
        />
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
