
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
      {/* Top Bar with Stats */}
      <StatsBar 
        thcAmount={thcAmount}
        plantCount={plants.length}
        plantCapacity={plantCapacity}
        isLoading={isLoading}
        onPlantSeed={plantSeed}
      />

      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Growing Area */}
        <GrowingArea 
          plants={plants}
          plantCapacity={plantCapacity}
          isLoading={isLoading}
          thcAmount={thcAmount}
          getGrowthColor={getGrowthColor}
          onPlantSeed={plantSeed}
          onHarvestPlant={harvestPlant}
        />
        
        {/* Equipment Area */}
        <EquipmentArea 
          equipment={equipment}
          plantCapacity={plantCapacity}
          isLoading={isLoading}
          onShowUpgradeModal={setShowUpgradeModal}
          onUpgradeCapacity={upgradeCapacity}
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
