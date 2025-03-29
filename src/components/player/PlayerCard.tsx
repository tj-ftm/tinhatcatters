
import React from 'react';
import { Trophy, Star, Zap, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeb3 } from '@/contexts/Web3Context';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerCardProps {
  showActions?: boolean;
  className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ showActions = true, className = '' }) => {
  const { address } = useWeb3();
  const { getCurrentPlayerStats, getSortedLeaderboard } = useLeaderboard();
  const playerStats = getCurrentPlayerStats();
  const isMobile = useIsMobile();
  
  // Find player rank
  const leaderboard = getSortedLeaderboard();
  const playerRank = address ? 
    leaderboard.findIndex(player => player.walletAddress === address) + 1 : 0;
  
  // Format THC value
  const formatTHC = (value: number) => {
    if (value > 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };
  
  // Format grow time
  const formatGrowTime = (ms: number) => {
    if (ms === 0) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };
  
  if (!address) {
    return (
      <Card className={`win95-window p-0 ${className}`}>
        <CardHeader className="win95-title-bar p-2">
          <CardTitle className="text-white text-sm">Your Player Card</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-center mb-4">Connect your wallet to view your player stats</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="win95-button"
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!playerStats) {
    return (
      <Card className={`win95-window p-0 ${className}`}>
        <CardHeader className="win95-title-bar p-2">
          <CardTitle className="text-white text-sm">Your Player Card</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-center mb-4">No player stats yet. Start playing to earn your stats!</p>
          {showActions && (
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => window.location.href = '/growroom'}
                className="win95-button w-full"
              >
                Start Growing
              </Button>
              <Button 
                onClick={() => window.location.href = '/game'}
                className="win95-button w-full"
              >
                Play Game
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`win95-window p-0 ${className}`}>
      <CardHeader className="win95-title-bar p-2">
        <CardTitle className="text-white text-sm">Your Player Card</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-3">
        {/* Player rank */}
        <div className="win95-panel p-2 mb-2 flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500 mr-1`} />
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold`}>Your Rank</span>
          </div>
          <div className="win95-inset px-2 py-1">
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold`}>
              {playerRank > 0 ? `#${playerRank}` : 'Unranked'}
            </span>
          </div>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* THC Produced */}
          <div className="win95-panel p-1 flex flex-col items-center">
            <div className="text-[10px] text-center mb-1">THC Produced</div>
            <div className="text-md font-bold">
              {formatTHC(playerStats.totalThcProduced)}
            </div>
          </div>
          
          {/* Plants Grown */}
          <div className="win95-panel p-1 flex flex-col items-center">
            <div className="text-[10px] text-center mb-1">Plants Grown</div>
            <div className="text-md font-bold">
              {playerStats.totalPlantsGrown}
            </div>
          </div>
          
          {/* Fastest Grow */}
          <div className="win95-panel p-1 flex flex-col items-center">
            <div className="text-[10px] text-center mb-1">Fastest Grow</div>
            <div className="text-sm font-bold">
              {formatGrowTime(playerStats.fastestGrowTime)}
            </div>
          </div>
          
          {/* Highest Quality */}
          <div className="win95-panel p-1 flex flex-col items-center">
            <div className="text-[10px] text-center mb-1">Best Quality</div>
            <div className="text-md font-bold">
              {playerStats.highestQualityPlant.toFixed(1)}
            </div>
          </div>
        </div>
        
        {/* Game stats if available */}
        <div className="win95-panel p-2 mb-2">
          <div className="text-[10px] font-bold mb-1">Game Stats</div>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-1 text-yellow-500" />
              <span className="text-[10px]">High Score:</span>
              <span className="text-[10px] ml-1 font-bold">
                {localStorage.getItem('reptilian-high-score') || '0'}
              </span>
            </div>
            <div className="flex items-center">
              <Timer className="h-3 w-3 mr-1 text-blue-500" />
              <span className="text-[10px]">Best Time:</span>
              <span className="text-[10px] ml-1 font-bold">
                {localStorage.getItem('reptilian-best-time') || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Equipment levels overview */}
        {playerStats.equipment && (
          <div className="win95-panel p-2">
            <div className="text-[10px] font-bold mb-1">Equipment Levels</div>
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(playerStats.equipment).map(([type, equipment]) => (
                <div key={type} className="relative h-4 bg-gray-200 rounded-sm overflow-hidden">
                  <div 
                    className="absolute h-full bg-purple-500"
                    style={{ width: `${(equipment.level / 5) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-black">
                      {type.substring(0, 3)}: {equipment.level}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        {showActions && (
          <div className="flex justify-center gap-2 mt-2">
            <Button 
              onClick={() => window.location.href = '/leaderboard'}
              className="win95-button text-xs py-1"
              size="sm"
            >
              Leaderboard
            </Button>
            <Button 
              onClick={() => window.location.href = '/game'}
              className="win95-button text-xs py-1"
              size="sm"
            >
              Play Game
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
