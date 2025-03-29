
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
import { 
  Trophy, 
  Sprout, 
  Cannabis, 
  Clock, 
  TrendingUp, 
  Users, 
  Activity, 
  History, 
  Award 
} from 'lucide-react';
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
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from 'recharts';
import { formatDistance, format } from 'date-fns';
import { EquipmentType } from '@/types/growRoom';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF66B2', '#00E396', '#775DD0'];

const Leaderboard = () => {
  const { 
    getSortedLeaderboard, 
    getCurrentPlayerStats, 
    getAggregateStats, 
    isLoading,
    leaderboardData
  } = useLeaderboard();
  const { address } = useWeb3();
  const [sortBy, setSortBy] = useState<'totalThcProduced' | 'totalPlantsGrown' | 'fastestGrowTime' | 'highestQualityPlant'>('totalThcProduced');
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all');

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

  // Prepare data for activity timeline (last 30 days)
  const generateActivityData = () => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    // Create a map for each day
    const activityMap: Record<string, { plants: number, thc: number, date: string }> = {};
    
    // Initialize all days
    for (let i = 0; i < 30; i++) {
      const date = now - (i * 24 * 60 * 60 * 1000);
      const dateStr = format(date, 'MM/dd');
      activityMap[dateStr] = { plants: 0, thc: 0, date: dateStr };
    }
    
    // Fill in data from all players
    Object.values(leaderboardData.players).forEach(player => {
      player.plantStats.forEach(stat => {
        if (stat.harvestTime > thirtyDaysAgo) {
          const dateStr = format(stat.harvestTime, 'MM/dd');
          if (activityMap[dateStr]) {
            activityMap[dateStr].plants += 1;
            activityMap[dateStr].thc += stat.thcProduced;
          }
        }
      });
    });
    
    // Convert to array and sort by date
    return Object.values(activityMap).sort((a, b) => {
      const [aMonth, aDay] = a.date.split('/').map(n => parseInt(n));
      const [bMonth, bDay] = b.date.split('/').map(n => parseInt(n));
      
      if (aMonth !== bMonth) return aMonth - bMonth;
      return aDay - bDay;
    });
  };
  
  const activityData = generateActivityData();

  // Prepare quality vs growth time scatter data
  const generateQualityVsTimeData = () => {
    const data: { quality: number, growTime: number, thc: number, id: string }[] = [];
    
    Object.values(leaderboardData.players).forEach(player => {
      player.plantStats.forEach((stat, idx) => {
        if (stat.totalGrowTime > 0) {
          data.push({
            quality: stat.quality,
            growTime: stat.totalGrowTime / 60000, // Convert to minutes
            thc: stat.thcProduced,
            id: `${player.walletAddress.substring(0, 6)}-${idx}`
          });
        }
      });
    });
    
    return data;
  };
  
  const qualityVsTimeData = generateQualityVsTimeData();

  // Prepare radar chart data for equipment comparisons
  const generateEquipmentComparisonData = () => {
    // Get top 3 players
    const topPlayers = getSortedLeaderboard('totalThcProduced').slice(0, 3);
    
    // Create radar chart data for each equipment type
    return Object.values(EquipmentType).map(type => {
      const dataPoint: any = { type };
      
      topPlayers.forEach(player => {
        const shortAddr = shortenAddress(player.walletAddress);
        dataPoint[shortAddr] = player.equipment[type].level;
      });
      
      if (currentPlayer && !topPlayers.some(p => p.walletAddress === currentPlayer.walletAddress)) {
        dataPoint['You'] = currentPlayer.equipment[type].level;
      }
      
      return dataPoint;
    });
  };
  
  const equipmentComparisonData = generateEquipmentComparisonData();

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

  // Format value for tooltips
  const formatTooltipValue = (value: any, name: string, props: any) => {
    if (typeof value === 'number') {
      return [value.toFixed(1), name];
    }
    return [value, name];
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="personal">Personal Stats</TabsTrigger>
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
              
              {/* Top Performers Quick View */}
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Time Range Filters */}
              <div className="flex justify-end mb-2">
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 text-sm rounded ${timeRange === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTimeRange('all')}
                  >
                    All Time
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm rounded ${timeRange === 'month' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTimeRange('month')}
                  >
                    This Month
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm rounded ${timeRange === 'week' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTimeRange('week')}
                  >
                    This Week
                  </button>
                </div>
              </div>
              
              {/* Activity Timeline */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Community Activity Timeline
                  </CardTitle>
                  <CardDescription>Growing activity across all players in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={activityData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorPlants" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorTHC" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={formatTooltipValue} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="plants" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorPlants)" 
                          yAxisId="left"
                          name="Plants Harvested"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="thc" 
                          stroke="#82ca9d" 
                          fillOpacity={1} 
                          fill="url(#colorTHC)"
                          yAxisId="right"
                          name="THC Produced"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quality vs Growth Time */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Quality vs Growth Time
                    </CardTitle>
                    <CardDescription>Relationship between plant quality and growth time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                          }}
                        >
                          <CartesianGrid />
                          <XAxis 
                            type="number" 
                            dataKey="growTime" 
                            name="Growth Time" 
                            unit="min" 
                            label={{ value: 'Growth Time (min)', position: 'insideBottomRight', offset: -10 }}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="quality" 
                            name="Quality" 
                            label={{ value: 'Quality', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            formatter={formatTooltipValue}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white border p-2 shadow-md">
                                    <p className="font-bold">{data.id}</p>
                                    <p>Quality: {data.quality.toFixed(1)}</p>
                                    <p>Growth Time: {data.growTime.toFixed(1)} min</p>
                                    <p>THC Produced: {data.thc.toFixed(1)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter 
                            name="Plants" 
                            data={qualityVsTimeData} 
                            fill="#8884d8"
                            fillOpacity={0.7}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Equipment Level Comparison */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Equipment Comparison
                    </CardTitle>
                    <CardDescription>Your equipment vs top players</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} data={equipmentComparisonData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="type" />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} />
                          <Tooltip formatter={formatTooltipValue} />
                          <Legend />
                          {Object.keys(equipmentComparisonData[0] || {})
                            .filter(key => key !== 'type')
                            .map((player, index) => (
                              <Radar
                                key={player}
                                name={player}
                                dataKey={player}
                                stroke={COLORS[index % COLORS.length]}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.3}
                              />
                            ))}
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Equipment Distribution */}
                <Card className="animate-fade-in">
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
                          <Tooltip formatter={formatTooltipValue} />
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
                
                {/* Top Producers Distribution */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cannabis className="h-4 w-4 mr-2" />
                      THC Production Distribution
                    </CardTitle>
                    <CardDescription>Top 5 producers by market share</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topProducersData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            animationDuration={1000}
                            animationBegin={200}
                          >
                            {topProducersData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={formatTooltipValue} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Personal Stats Tab */}
            <TabsContent value="personal" className="space-y-6">
              {currentPlayer ? (
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
                          {currentPlayer.plantStats.slice(-5).reverse().map((stat, index) => (
                            <TableRow key={stat.id}>
                              <TableCell className="font-medium">{stat.id}</TableCell>
                              <TableCell>{new Date(stat.harvestTime).toLocaleString()}</TableCell>
                              <TableCell>{formatGrowTime(stat.totalGrowTime)}</TableCell>
                              <TableCell>{stat.quality.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{stat.thcProduced.toFixed(1)}</TableCell>
                            </TableRow>
                          ))}
                          {currentPlayer.plantStats.length === 0 && (
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
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Growing Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-center mb-4">You haven't grown any plants yet!</p>
                      <p className="text-center text-gray-500 mb-6">
                        Start growing in the THC Grow Room to see your statistics here.
                      </p>
                      <button 
                        className="px-4 py-2 bg-purple-500 text-white rounded-md"
                        onClick={() => window.location.href = '/growroom'}
                      >
                        Go to Grow Room
                      </button>
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
