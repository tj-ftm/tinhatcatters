import React, { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWeb3 } from '@/contexts/Web3Context';
import { Trophy, Sprout, Cannabis, Clock, TrendingUp, Users } from 'lucide-react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatDistance } from 'date-fns';
import { EquipmentType } from '@/types/growRoom';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Leaderboard = () => {
  const { 
    getSortedLeaderboard, 
    getCurrentPlayerStats, 
    getAggregateStats, 
    isLoading
  } = useLeaderboard();
  const { address } = useWeb3();
  const [sortBy, setSortBy] = useState<'totalThcProduced' | 'totalPlantsGrown' | 'fastestGrowTime' | 'highestQualityPlant'>('totalThcProduced');

  // Get leaderboard data
  const leaderboard = getSortedLeaderboard(sortBy);
  const currentPlayer = getCurrentPlayerStats();
  const aggregateStats = getAggregateStats();

  // Find current player rank
  const currentPlayerRank = leaderboard.findIndex(
    player => player.walletAddress === address
  ) + 1;

  // Prepare data for charts
  const topProducersData = getSortedLeaderboard('totalThcProduced')
    .slice(0, 5)
    .map(player => ({
      name: shortenAddress(player.walletAddress),
      value: player.totalThcProduced
    }));

  const topGrowersData = getSortedLeaderboard('totalPlantsGrown')
    .slice(0, 5)
    .map(player => ({
      name: shortenAddress(player.walletAddress),
      value: player.totalPlantsGrown
    }));

  const equipmentDistribution = leaderboard.reduce((acc, player) => {
    Object.entries(player.equipment).forEach(([type, equipment]) => {
      const equipType = type as EquipmentType;
      if (!acc[equipType]) {
        acc[equipType] = {};
      }
      
      const level = equipment.level.toString();
      acc[equipType][level] = (acc[equipType][level] || 0) + 1;
    });
    return acc;
  }, {} as Record<EquipmentType, Record<string, number>>);
  
  // Transform equipment data for charts
  const equipmentChartData = Object.entries(equipmentDistribution).map(([type, levels]) => {
    return {
      name: type,
      ...Object.entries(levels).reduce((acc, [level, count]) => {
        acc[`Level ${level}`] = count;
        return acc;
      }, {} as Record<string, number>)
    };
  });

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
    <div className="flex flex-col h-full p-4 overflow-auto">
      {/* Title */}
      <div className="flex items-center mb-6">
        <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
        <h1 className="text-2xl font-bold">THC Grow Room Leaderboard</h1>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading leaderboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Players" 
              value={aggregateStats.totalPlayers.toString()} 
              icon={<Users className="h-4 w-4" />} 
            />
            <StatCard 
              title="Total Plants Grown" 
              value={aggregateStats.totalPlantsGrown.toString()} 
              icon={<Sprout className="h-4 w-4" />} 
            />
            <StatCard 
              title="Total THC Produced" 
              value={aggregateStats.totalThcProduced.toFixed(0)} 
              icon={<Cannabis className="h-4 w-4" />} 
            />
            <StatCard 
              title="Your Rank" 
              value={currentPlayerRank ? `#${currentPlayerRank}` : 'Not Ranked'} 
              icon={<Trophy className="h-4 w-4" />}
              highlight={true}
            />
          </div>

          {/* Tabs for Different Views */}
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              {/* Sort Options */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  className={`px-3 py-1 rounded ${sortBy === 'totalThcProduced' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setSortBy('totalThcProduced')}
                >
                  THC Produced
                </button>
                <button 
                  className={`px-3 py-1 rounded ${sortBy === 'totalPlantsGrown' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setSortBy('totalPlantsGrown')}
                >
                  Plants Grown
                </button>
                <button 
                  className={`px-3 py-1 rounded ${sortBy === 'fastestGrowTime' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setSortBy('fastestGrowTime')}
                >
                  Fastest Grow
                </button>
                <button 
                  className={`px-3 py-1 rounded ${sortBy === 'highestQualityPlant' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setSortBy('highestQualityPlant')}
                >
                  Highest Quality
                </button>
              </div>

              {/* Leaderboard Table */}
              <div className="border rounded-md">
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
                    {leaderboard.map((player, index) => (
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
                    ))}
                    {leaderboard.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No players on the leaderboard yet. Start growing to be the first!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top THC Producers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cannabis className="h-4 w-4 mr-2" />
                      Top THC Producers
                    </CardTitle>
                    <CardDescription>Players with highest THC production</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducersData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${value} THC`, 'Produced']}
                          />
                          <Bar dataKey="value" fill="#8884d8" name="THC Produced" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Plant Growers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sprout className="h-4 w-4 mr-2" />
                      Top Plant Growers
                    </CardTitle>
                    <CardDescription>Players who have grown the most plants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topGrowersData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {topGrowersData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} Plants`, 'Grown']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Equipment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Equipment Level Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of equipment levels across all players</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={equipmentChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Level 1" fill="#8884d8" />
                        <Bar dataKey="Level 2" fill="#82ca9d" />
                        <Bar dataKey="Level 3" fill="#ffc658" />
                        <Bar dataKey="Level 4" fill="#ff8042" />
                        <Bar dataKey="Level 5" fill="#0088fe" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Player Stats */}
              {currentPlayer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Growing Statistics</CardTitle>
                    <CardDescription>Personal growing performance and records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-medium mb-1">THC Production History</h3>
                        <p className="text-sm text-gray-500 mb-2">Your last 10 harvests</p>
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={currentPlayer.plantStats.slice(-10).map((stat, idx) => ({
                                name: `Harvest ${idx + 1}`,
                                thc: stat.thcProduced,
                                quality: stat.quality
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Legend />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="thc"
                                stroke="#8884d8"
                                name="THC Produced"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="quality"
                                stroke="#82ca9d"
                                name="Plant Quality"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Growing Efficiency</h3>
                        <p className="text-sm text-gray-500 mb-2">Growth time for your last 10 plants</p>
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={currentPlayer.plantStats.slice(-10).map((stat, idx) => ({
                                name: `Plant ${idx + 1}`,
                                time: stat.totalGrowTime / 60000, // Convert to minutes
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)} minutes`, 'Growth Time']} />
                              <Line
                                type="monotone"
                                dataKey="time"
                                stroke="#ff8042"
                                name="Growth Time (minutes)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    
                    {/* Personal Records */}
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Your Personal Records</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Plants</p>
                          <p className="text-xl font-bold">{currentPlayer.totalPlantsGrown}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total THC</p>
                          <p className="text-xl font-bold">{currentPlayer.totalThcProduced.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fastest Grow</p>
                          <p className="text-xl font-bold">{formatGrowTime(currentPlayer.fastestGrowTime)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Highest Quality</p>
                          <p className="text-xl font-bold">{currentPlayer.highestQualityPlant.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!currentPlayer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Growing Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-center mb-4">You haven't grown any plants yet!</p>
                      <p className="text-center text-gray-500">
                        Start growing in the THC Grow Room to see your statistics here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

// Stats Card Component
const StatCard = ({ 
  title, 
  value, 
  icon,
  highlight = false
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  highlight?: boolean;
}) => {
  return (
    <Card className={highlight ? 'border-purple-300 bg-purple-50' : ''}>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className={`p-2 rounded-full ${highlight ? 'bg-purple-200' : 'bg-gray-100'} mb-2`}>
          {icon}
        </div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
