
import React from 'react';
import { formatDistance } from 'date-fns';
import { Cannabis, Sprout, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLeaderboard } from '@/hooks/useLeaderboard';

interface TopPerformersProps {
  getSortedLeaderboard: (sortBy?: 'totalThcProduced' | 'totalPlantsGrown' | 'fastestGrowTime' | 'highestQualityPlant') => any[];
}

export const TopPerformers = ({ getSortedLeaderboard }: TopPerformersProps) => {
  // Helper to format growth time
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

  // Helper to shorten wallet address
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Top THC Producers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Cannabis className="h-4 w-4 mr-1" />
            Top THC Producers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getSortedLeaderboard('totalThcProduced').length > 0 ? (
            <div>
              {getSortedLeaderboard('totalThcProduced').slice(0, 3).map((player, index) => (
                <div key={player.walletAddress} className="flex items-center justify-between py-1 border-b last:border-0">
                  <div className="flex items-center">
                    <span className="w-6 text-center font-bold">{index + 1}</span>
                    <span>{shortenAddress(player.walletAddress)}</span>
                  </div>
                  <span className="font-semibold">{player.totalThcProduced.toFixed(0)} THC</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Top Plant Growers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Sprout className="h-4 w-4 mr-1" />
            Top Plant Growers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getSortedLeaderboard('totalPlantsGrown').length > 0 ? (
            <div>
              {getSortedLeaderboard('totalPlantsGrown').slice(0, 3).map((player, index) => (
                <div key={player.walletAddress} className="flex items-center justify-between py-1 border-b last:border-0">
                  <div className="flex items-center">
                    <span className="w-6 text-center font-bold">{index + 1}</span>
                    <span>{shortenAddress(player.walletAddress)}</span>
                  </div>
                  <span className="font-semibold">{player.totalPlantsGrown} Plants</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Fastest Growers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Fastest Growers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getSortedLeaderboard('fastestGrowTime').length > 0 ? (
            <div>
              {getSortedLeaderboard('fastestGrowTime').slice(0, 3).map((player, index) => (
                <div key={player.walletAddress} className="flex items-center justify-between py-1 border-b last:border-0">
                  <div className="flex items-center">
                    <span className="w-6 text-center font-bold">{index + 1}</span>
                    <span>{shortenAddress(player.walletAddress)}</span>
                  </div>
                  <span className="font-semibold">{formatGrowTime(player.fastestGrowTime)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
