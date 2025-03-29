
import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { PlayerStats } from '@/types/leaderboard';
import { formatDistance } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardTableProps {
  leaderboard: PlayerStats[];
}

export const LeaderboardTable = ({ leaderboard }: LeaderboardTableProps) => {
  const { address } = useWeb3();

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
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableCaption>THC Grow Room Leaderboard</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>THC Produced</TableHead>
            <TableHead>Plants Grown</TableHead>
            <TableHead>Fastest Grow</TableHead>
            <TableHead>Quality</TableHead>
            <TableHead className="text-right">Last Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => (
              <TableRow 
                key={player.walletAddress}
                className={player.walletAddress === address ? 'bg-purple-50' : ''}
              >
                <TableCell className="font-medium">
                  {index + 1}
                  {index < 3 && (
                    <span className="ml-1">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </span>
                  )}
                </TableCell>
                <TableCell>{shortenAddress(player.walletAddress)}</TableCell>
                <TableCell>{player.totalThcProduced.toFixed(0)}</TableCell>
                <TableCell>{player.totalPlantsGrown}</TableCell>
                <TableCell>{formatGrowTime(player.fastestGrowTime)}</TableCell>
                <TableCell>{player.highestQualityPlant.toFixed(1)}</TableCell>
                <TableCell className="text-right">
                  {player.lastActive 
                    ? formatDistance(player.lastActive, Date.now(), { addSuffix: true }) 
                    : 'Unknown'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-8 w-8 text-yellow-500 mb-2" />
                  <p className="text-lg font-medium">No players on the leaderboard yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start growing to be the first!</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
