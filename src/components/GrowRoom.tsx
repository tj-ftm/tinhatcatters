
import React, { useEffect, useRef } from 'react';
import { useGrowRoom } from '@/hooks/useGrowRoom';
import StatsBar from './grow-room/StatsBar';
import GrowingArea from './grow-room/GrowingArea';
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

  // Maximize window on load
  useEffect(() => {
    toggleMaximize('growroom');
  }, [toggleMaximize]);

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Stats Bar - Now at the top for mobile */}
        {isMobile && (
          <StatsBar 
            thcAmount={thcAmount}
            plantCount={plants.length}
            plantCapacity={plantCapacity}
            isLoading={isLoading}
            onPlantSeed={plantSeed}
          />
        )}
        
        {/* Visual Grow Room Canvas - This is new */}
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="win95-window p-2 flex-1 flex flex-col">
            <div className="win95-title-bar mb-2">
              <span>THC Grow Room - Visual</span>
            </div>
            
            <GrowRoomCanvas />
          </div>
          
          {/* Traditional Growing Area Interface */}
          <div className={`${isMobile ? 'flex-1' : 'w-1/3'} flex flex-col gap-4`}>
            <GrowingArea 
              plants={plants}
              plantCapacity={plantCapacity}
              isLoading={isLoading}
              thcAmount={thcAmount}
              getGrowthColor={getGrowthColor}
              onPlantSeed={plantSeed}
              onHarvestPlant={harvestPlant}
              isMobile={isMobile}
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

        {/* Stats Bar - At the bottom for desktop */}
        {!isMobile && (
          <StatsBar 
            thcAmount={thcAmount}
            plantCount={plants.length}
            plantCapacity={plantCapacity}
            isLoading={isLoading}
            onPlantSeed={plantSeed}
          />
        )}
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
