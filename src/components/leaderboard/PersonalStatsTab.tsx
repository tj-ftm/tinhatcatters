
import React from 'react';
import { formatDistance } from 'date-fns';
import { History, Settings } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useWeb3 } from '@/contexts/Web3Context';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EquipmentType } from '@/types/growRoom';

export const PersonalStatsTab = () => {
  const { getCurrentPlayerStats, getAggregateStats } = useLeaderboard();
  const { address } = useWeb3();
  
  const currentPlayer = getCurrentPlayerStats();
  const aggregateStats = getAggregateStats();

  // Find current player rank
  const leaderboard = useLeaderboard().getSortedLeaderboard();
  const currentPlayerRank = leaderboard.findIndex(
    player => player.walletAddress === address
  ) + 1;

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

  // Format value for tooltips
  const formatTooltipValue = (value: any, name: string, props: any) => {
    if (typeof value === 'number') {
      return [value.toFixed(1), name];
    }
    return [value, name];
  };

  if (!currentPlayer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Growing Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Settings className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl mb-2">No Personal Stats Yet</h3>
          <p className="text-gray-500 mb-6">
            Start growing plants to see your personal statistics and performance metrics.
          </p>
          <button 
            onClick={() => window.location.href = '/growroom'}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Start Growing
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Player Summary */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Your Growing Summary</CardTitle>
          <CardDescription>Personal statistics and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <h3 className="text-sm text-gray-500">Total Plants</h3>
              <p className="text-2xl font-bold">{currentPlayer.totalPlantsGrown}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <h3 className="text-sm text-gray-500">Total THC</h3>
              <p className="text-2xl font-bold">{currentPlayer.totalThcProduced.toFixed(0)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <h3 className="text-sm text-gray-500">Fastest Grow</h3>
              <p className="text-2xl font-bold">{formatGrowTime(currentPlayer.fastestGrowTime)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <h3 className="text-sm text-gray-500">Highest Quality</h3>
              <p className="text-2xl font-bold">{currentPlayer.highestQualityPlant.toFixed(1)}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-sm mb-2">Your Rank Position</h3>
            <div className="bg-gray-100 h-8 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full flex items-center justify-center text-white text-xs"
                style={{ width: `${Math.min(100, (currentPlayerRank / aggregateStats.totalPlayers) * 100)}%` }}
              >
                {currentPlayerRank ? `#${currentPlayerRank} of ${aggregateStats.totalPlayers}` : 'Not Ranked'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Growth History */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            Your Growth History
          </CardTitle>
          <CardDescription>
            Stats from your last {Math.min(10, currentPlayer.plantStats.length)} plants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentPlayer.plantStats.slice(-10).map((stat, idx) => ({
                  name: `Plant ${idx + 1}`,
                  thc: stat.thcProduced,
                  quality: stat.quality,
                  time: stat.totalGrowTime / 60000, // Convert to minutes
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <YAxis yAxisId="time" orientation="right" />
                <Tooltip formatter={formatTooltipValue} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="thc"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="THC Produced"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="quality"
                  stroke="#82ca9d"
                  name="Plant Quality"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="time"
                  type="monotone"
                  dataKey="time"
                  stroke="#ffc658"
                  name="Growth Time (min)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Equipment Levels */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Your Equipment Levels</CardTitle>
          <CardDescription>Current equipment setup and levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(currentPlayer.equipment).map(([type, equipment]) => (
              <div key={type} className="border rounded-md p-4">
                <h3 className="font-medium capitalize">{type}</h3>
                <div className="mt-2 flex items-center">
                  <div className="relative w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-purple-500"
                      style={{ width: `${(equipment.level / 5) * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 font-bold">{equipment.level}/5</span>
                </div>
                <p className="text-xs mt-1">
                  Speed Boost: +{equipment.effect.speedBoost}%<br />
                  Quality Boost: +{equipment.effect.qualityBoost}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Harvests */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Recent Harvests</CardTitle>
          <CardDescription>Your most recent plant harvests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plant #</TableHead>
                <TableHead>Harvest Time</TableHead>
                <TableHead>Growth Time</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead className="text-right">THC Produced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPlayer.plantStats.length > 0 ? (
                currentPlayer.plantStats.slice(-5).reverse().map((stat, index) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.id}</TableCell>
                    <TableCell>{new Date(stat.harvestTime).toLocaleString()}</TableCell>
                    <TableCell>{formatGrowTime(stat.totalGrowTime)}</TableCell>
                    <TableCell>{stat.quality.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{stat.thcProduced.toFixed(1)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No harvest records yet. Start growing some plants!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};
