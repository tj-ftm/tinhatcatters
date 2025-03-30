
import React, { useEffect, useRef } from 'react';
import { useGrowRoom } from '@/hooks/useGrowRoom';
import StatsBar from './grow-room/StatsBar';
import EquipmentArea from './grow-room/EquipmentArea';
import LoadingOverlay from './grow-room/LoadingOverlay';
import UpgradeModal from './grow-room/UpgradeModal';
import GrowRoomCanvas from './grow-room/GrowRoomCanvas';
import { useWindowManagement } from '@/hooks/useWindowManagement';
import { useIsMobile } from '@/hooks/use-mobile';

const GrowRoom: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
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

  const { toggleMaximize } = useWindowManagement(containerRef);

  // Maximize window on load - but only once
  useEffect(() => {
    const timer = setTimeout(() => {
      toggleMaximize('growroom');
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      {/* Stats Bar - Always at the top now */}
      <StatsBar 
        thcAmount={thcAmount}
        plantCount={plants.length}
        plantCapacity={plantCapacity}
        isLoading={isLoading}
        onPlantSeed={plantSeed}
      />
      
      <div className="flex-1 flex flex-col gap-2">
        {/* Visual Grow Room Canvas - Smaller size */}
        <div className="win95-window p-2">
          <div className="win95-title-bar mb-2">
            <span>THC Grow Room</span>
          </div>
          <div className="win95-inset p-1">
            <GrowRoomCanvas
              plants={plants}
              equipment={equipment}
              plantCapacity={plantCapacity}
              onPlantSeed={plantSeed}
              onHarvestPlant={harvestPlant}
              getGrowthColor={getGrowthColor}
              thcAmount={thcAmount}
            />
          </div>
        </div>
        
        {/* Equipment Area */}
        <EquipmentArea 
          equipment={equipment}
          plantCapacity={plantCapacity}
          isLoading={isLoading}
          onShowUpgradeModal={setShowUpgradeModal}
          onUpgradeCapacity={upgradeCapacity}
          isMobile={isMobile}
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
