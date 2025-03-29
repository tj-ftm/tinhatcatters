
import React, { useEffect } from 'react';
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

  // Maximize the window when component mounts
  useEffect(() => {
    const growRoomWindow = document.querySelector('[data-window-id="growroom"]');
    if (growRoomWindow) {
      const maximizeButton = growRoomWindow.querySelector('.window-maximize-button') as HTMLButtonElement;
      if (maximizeButton) {
        maximizeButton.click();
      }
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Growing Area - Larger and fills available space */}
      <div className="flex-1 flex">
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
      
      {/* Equipment Area - Horizontal at bottom */}
      <div>
        <EquipmentArea 
          equipment={equipment}
          plantCapacity={plantCapacity}
          isLoading={isLoading}
          onShowUpgradeModal={setShowUpgradeModal}
          onUpgradeCapacity={upgradeCapacity}
        />
      </div>
      
      {/* Stats Bar - At the very bottom */}
      <div>
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
