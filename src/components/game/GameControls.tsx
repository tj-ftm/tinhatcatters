
import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface GameControlsProps {
  isPaused: boolean;
  handlePauseToggle: () => void;
  handleRestart: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  isPaused, 
  handlePauseToggle, 
  handleRestart 
}) => {
  return (
    <div className="flex gap-2">
      <button 
        className="text-white hover:text-gray-300"
        onClick={handlePauseToggle}
        aria-label={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? <Play size={14} /> : <Pause size={14} />}
      </button>
      <button 
        className="text-white hover:text-gray-300"
        onClick={handleRestart}
        aria-label="Restart"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
};

export default GameControls;
