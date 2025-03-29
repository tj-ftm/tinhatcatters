
import React from 'react';
import { Trophy, Cannabis, TrendingUp, Clock } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistance } from 'date-fns';
import { StatCard } from './StatCard';

export const AnalyticsOverviewTab = () => {
  const { getSortedLeaderboard, getAggregateStats } = useLeaderboard();
  const stats = getAggregateStats();
  
  // Helper function to shorten wallet address
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Helper function to format growth time
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
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Players"
          value={stats.totalPlayers.toString()}
          description="Active growers"
          icon={<Trophy />}
        />
        <StatCard 
          title="Total Plants"
          value={stats.totalPlantsGrown.toString()}
          description="Plants harvested"
          icon={<Cannabis />}
        />
        <StatCard 
          title="Total THC"
          value={stats.totalThcProduced.toFixed(0)}
          description="THC produced"
          icon={<TrendingUp />}
        />
        <StatCard 
          title="Avg. per Player"
          value={stats.averagePlantsPerPlayer.toFixed(1)}
          description="Plants per grower"
          icon={<Clock />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Producers</CardTitle>
            <CardDescription>Players with highest THC production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getSortedLeaderboard('totalThcProduced').slice(0, 5).map((player, index) => (
                <div key={player.walletAddress} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{shortenAddress(player.walletAddress)}</p>
                    <p className="text-sm text-gray-500">
                      Last active {formatDistance(player.lastActive, new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{player.totalThcProduced.toFixed(0)}</p>
                    <p className="text-sm text-gray-500">THC</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fastest Growers</CardTitle>
            <CardDescription>Players with fastest growing times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getSortedLeaderboard('fastestGrowTime').slice(0, 5).map((player, index) => (
                <div key={player.walletAddress} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{shortenAddress(player.walletAddress)}</p>
                    <p className="text-sm text-gray-500">
                      {player.totalPlantsGrown} plants grown
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatGrowTime(player.fastestGrowTime)}</p>
                    <p className="text-sm text-gray-500">Fastest time</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
