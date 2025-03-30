
import React from 'react';
import LoadingOverlay from '@/components/grow-room/LoadingOverlay';

interface GameOverlayProps {
  isLoading: boolean;
  pendingAction: string | null;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ isLoading, pendingAction }) => {
  return (
    <LoadingOverlay 
      isLoading={isLoading}
      actionType={pendingAction}
    />
  );
};

export default GameOverlay;
