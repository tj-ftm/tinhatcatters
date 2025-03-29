
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useToast } from '@/hooks/use-toast';
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
  ComposedChart,
  Scatter
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  PieChart as PieChartIcon,
  Activity, 
  Calendar, 
  FileClock, 
  Award, 
  Sprout, 
  Cannabis, 
  Leaf,
  Zap,
  Star,
  Timer,
  RefreshCw,
  Users,
  Download
} from 'lucide-react';
import { format, subDays, formatDistance } from 'date-fns';
import { Plant, EquipmentType } from '@/types/growRoom';
import { PlayerStats } from '@/types/leaderboard';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF66B2', '#00E396', '#775DD0'];
const EQUIPMENT_COLORS = {
  [EquipmentType.Light]: '#FFD700',      // Gold for Light
  [EquipmentType.Pot]: '#8B4513',        // Brown for Pot
  [EquipmentType.Nutrients]: '#32CD32',  // Green for Nutrients
  [EquipmentType.Ventilation]: '#87CEEB', // Blue for Ventilation
  [EquipmentType.Automation]: '#FF6347'  // Red-orange for Automation
};

const Analytics = () => {
  const { address } = useWeb3();
  const { getCurrentPlayerStats, getSortedLeaderboard, getAggregateStats, leaderboardData } = useLeaderboard();
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = useState<'all' | 'month' | 'week' | 'day'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Get current player data
  const currentPlayer = getCurrentPlayerStats();
  const aggregateStats = getAggregateStats();

  // Find player rank
  const leaderboard = getSortedLeaderboard('totalThcProduced');
  const currentPlayerRank = leaderboard.findIndex(player => player.walletAddress === address) + 1;

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Analytics Refreshed",
      description: "Your analytics data has been updated.",
    });
  };

  // Handle report generation
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: "Report Generated",
        description: "Your analytics report has been generated and is ready for download.",
      });
    }, 1500);
  };

  // Calculate time-filtered data
  const getTimeFilteredData = () => {
    if (!currentPlayer) return [];
    
    const now = Date.now();
    let cutoffTime: number;
    
    switch (timePeriod) {
      case 'day':
        cutoffTime = now - (24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = 0;
    }
    
    return currentPlayer.plantStats.filter(stat => stat.harvestTime > cutoffTime);
  };

  // Prepare data for different charts
  
  // Growth over time chart data
  const growthOverTimeData = React.useMemo(() => {
    if (!currentPlayer) return [];
    
    const filteredStats = getTimeFilteredData();
    const dataMap = new Map<string, {date: string, plants: number, thc: number, quality: number}>();
    
    // Initialize dates
    let startDate = timePeriod === 'all' ? currentPlayer.plantStats[0]?.seedTime || Date.now() : 
                   (timePeriod === 'day' ? subDays(new Date(), 1).getTime() :
                    timePeriod === 'week' ? subDays(new Date(), 7).getTime() :
                    subDays(new Date(), 30).getTime());
    
    const endDate = Date.now();
    let currentDate = startDate;
    
    // Generate date entries
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'MM/dd/yyyy');
      dataMap.set(dateStr, { date: dateStr, plants: 0, thc: 0, quality: 0 });
      
      // Increment by day
      currentDate += 24 * 60 * 60 * 1000;
    }
    
    // Fill with actual data
    filteredStats.forEach(stat => {
      const dateStr = format(stat.harvestTime, 'MM/dd/yyyy');
      const existing = dataMap.get(dateStr) || { date: dateStr, plants: 0, thc: 0, quality: 0 };
      
      dataMap.set(dateStr, {
        ...existing,
        plants: existing.plants + 1,
        thc: existing.thc + stat.thcProduced,
        quality: existing.quality + stat.quality
      });
    });
    
    // Convert to array and sort
    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        quality: item.plants > 0 ? item.quality / item.plants : 0
      }));
  }, [currentPlayer, timePeriod, refreshKey]);

  // Quality vs growth time scatter data
  const qualityVsTimeData = React.useMemo(() => {
    if (!currentPlayer) return [];
    
    return getTimeFilteredData().map(stat => ({
      id: stat.id,
      growTime: stat.totalGrowTime / 60000, // Convert to minutes
      quality: stat.quality,
      thc: stat.thcProduced
    }));
  }, [currentPlayer, timePeriod, refreshKey]);

  // Equipment efficiency data
  const equipmentEfficiencyData = React.useMemo(() => {
    if (!currentPlayer) return [];
    
    return Object.entries(currentPlayer.equipment).map(([type, equipment]) => ({
      name: type,
      level: equipment.level,
      speedBoost: equipment.effect.speedBoost,
      qualityBoost: equipment.effect.qualityBoost,
      fill: EQUIPMENT_COLORS[type as EquipmentType] || '#cccccc'
    }));
  }, [currentPlayer, refreshKey]);

  // Community comparison data
  const communityComparisonData = React.useMemo(() => {
    if (!currentPlayer) return [];
    
    // Get top 5 players excluding current player
    const topPlayers = getSortedLeaderboard('totalThcProduced')
      .filter(player => player.walletAddress !== address)
      .slice(0, 5);
    
    const data = [
      {
        category: 'THC Produced',
        You: currentPlayer.totalThcProduced,
        'Avg Top 5': topPlayers.reduce((sum, player) => sum + player.totalThcProduced, 0) / Math.max(1, topPlayers.length),
        'Community Avg': aggregateStats.totalThcProduced / Math.max(1, aggregateStats.totalPlayers)
      },
      {
        category: 'Plants Grown',
        You: currentPlayer.totalPlantsGrown,
        'Avg Top 5': topPlayers.reduce((sum, player) => sum + player.totalPlantsGrown, 0) / Math.max(1, topPlayers.length),
        'Community Avg': aggregateStats.totalPlantsGrown / Math.max(1, aggregateStats.totalPlayers)
      },
      {
        category: 'Grow Speed',
        You: currentPlayer.fastestGrowTime > 0 ? 100 - (currentPlayer.fastestGrowTime / 60000) : 0,
        'Avg Top 5': topPlayers.filter(p => p.fastestGrowTime > 0).length > 0 ? 
          100 - (topPlayers.filter(p => p.fastestGrowTime > 0)
            .reduce((sum, player) => sum + player.fastestGrowTime, 0) / 
            Math.max(1, topPlayers.filter(p => p.fastestGrowTime > 0).length) / 60000) : 0,
        'Community Avg': 0 // Placeholder, would need more complex calculation
      },
      {
        category: 'Quality',
        You: currentPlayer.highestQualityPlant,
        'Avg Top 5': topPlayers.reduce((sum, player) => sum + player.highestQualityPlant, 0) / Math.max(1, topPlayers.length),
        'Community Avg': leaderboard.reduce((sum, player) => sum + player.highestQualityPlant, 0) / Math.max(1, leaderboard.length)
      }
    ];
    
    return data;
  }, [currentPlayer, address, getSortedLeaderboard, aggregateStats, refreshKey]);

  // Growth distribution data
  const growthDistributionData = React.useMemo(() => {
    if (!currentPlayer) return [];
    
    const qualityRanges = {
      'Poor (0-2)': 0,
      'Average (2-4)': 0,
      'Good (4-6)': 0,
      'Great (6-8)': 0,
      'Excellent (8-10)': 0
    };
    
    getTimeFilteredData().forEach(stat => {
      if (stat.quality < 2) qualityRanges['Poor (0-2)']++;
      else if (stat.quality < 4) qualityRanges['Average (2-4)']++;
      else if (stat.quality < 6) qualityRanges['Good (4-6)']++;
      else if (stat.quality < 8) qualityRanges['Great (6-8)']++;
      else qualityRanges['Excellent (8-10)']++;
    });
    
    return Object.entries(qualityRanges).map(([name, value]) => ({
      name,
      value
    }));
  }, [currentPlayer, timePeriod, refreshKey]);

  // Yield trends data
  const yieldTrendsData = React.useMemo(() => {
    if (!currentPlayer) return [];
    
    const filteredStats = getTimeFilteredData();
    if (filteredStats.length < 2) return [];
    
    // Calculate moving average (window of 3 or less if not enough data)
    const movingAverages = [];
    
    for (let i = 0; i < filteredStats.length; i++) {
      const windowStart = Math.max(0, i - 2);
      const windowEnd = i;
      const windowSize = windowEnd - windowStart + 1;
      
      const sum = filteredStats.slice(windowStart, windowEnd + 1)
        .reduce((acc, stat) => acc + stat.thcProduced, 0);
      
      movingAverages.push({
        id: filteredStats[i].id,
        actual: filteredStats[i].thcProduced,
        average: sum / windowSize,
        time: new Date(filteredStats[i].harvestTime).getTime()
      });
    }
    
    return movingAverages.sort((a, b) => a.time - b.time);
  }, [currentPlayer, timePeriod, refreshKey]);

  // Format times for display
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

  // Display conditional message if not logged in or no data
  if (!address) {
    return (
      <div className="flex flex-col h-full p-6 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Analytics Dashboard</CardTitle>
            <CardDescription className="text-center">
              Connect your wallet to view your growing analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <TrendingUp className="h-24 w-24 text-muted-foreground opacity-50" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentPlayer || currentPlayer.plantStats.length === 0) {
    return (
      <div className="flex flex-col h-full p-6 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Growing Data</CardTitle>
            <CardDescription className="text-center">
              Start growing plants in the THC Grow Room to see analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Sprout className="h-24 w-24 text-muted-foreground opacity-50" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/growroom'}
            >
              Go to Grow Room
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-auto gap-4">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">THC Grow Analytics</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={timePeriod} 
            onValueChange={(value) => setTimePeriod(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            className="animate-pulse-on-hover"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 animate-fade-in">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mb-3">
              <Cannabis className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-3xl font-bold">{currentPlayer.totalThcProduced.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Total THC Produced</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 animate-fade-in delay-100">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-3">
              <Sprout className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold">{currentPlayer.totalPlantsGrown}</div>
            <p className="text-sm text-muted-foreground">Plants Grown</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 animate-fade-in delay-200">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 mb-3">
              <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-bold">{currentPlayer.highestQualityPlant.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Highest Quality Plant</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 animate-fade-in delay-300">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-3">
              <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold">#{currentPlayerRank || 'N/A'}</div>
            <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="w-full animate-fade-in">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" /> Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Trends
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-1">
            <Zap className="h-4 w-4" /> Equipment
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> Community
          </TabsTrigger>
        </TabsList>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-2 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Growing Activity Over Time
                </CardTitle>
                <CardDescription>
                  Your plant growing activity and THC production over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={growthOverTimeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (timePeriod === 'day') {
                          // For day view, show hours
                          return format(new Date(value), 'HH:mm');
                        }
                        return format(new Date(value), 'MM/dd');
                      }}
                      label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      label={{ value: 'Plants', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      label={{ value: 'THC', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'quality') return [`${Number(value).toFixed(1)}`, 'Quality'];
                        if (name === 'thc') return [`${Number(value).toFixed(1)}`, 'THC Produced'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="plants" 
                      fill="#8884d8" 
                      name="Plants Harvested"
                      barSize={20}
                      className="animate-grow"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="thc" 
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="THC Produced"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      className="animate-draw"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="quality" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Average Quality"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      className="animate-draw delay-100"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in delay-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Quality vs. Growth Time
                </CardTitle>
                <CardDescription>
                  Relationship between plant quality and growth time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="growTime" 
                      name="Growth Time" 
                      unit=" min" 
                      label={{ value: 'Growth Time (minutes)', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="quality" 
                      name="Quality" 
                      label={{ value: 'Plant Quality', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => {
                        if (name === 'growTime') return [`${Number(value).toFixed(1)} min`, 'Growth Time'];
                        if (name === 'quality') return [`${Number(value).toFixed(1)}`, 'Quality'];
                        if (name === 'thc') return [`${Number(value).toFixed(1)}`, 'THC Produced'];
                        return [value, name];
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded p-2 shadow">
                              <p className="font-semibold">Plant #{data.id}</p>
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
                      className="animate-fade-in"
                    >
                      {qualityVsTimeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          className="animate-pop"
                          style={{ animationDelay: `${index * 50}ms` }}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Quality Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of plant qualities in your harvests
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={growthDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      className="animate-spin-slow"
                    >
                      {growthDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          className="animate-pop"
                          style={{ animationDelay: `${index * 100}ms` }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} plants`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-2 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  THC Yield Trends
                </CardTitle>
                <CardDescription>
                  Your THC production over time with trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={yieldTrendsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="id" 
                      label={{ value: 'Plant ID', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis 
                      label={{ value: 'THC Produced', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'actual') return [`${Number(value).toFixed(1)}`, 'Actual THC'];
                        if (name === 'average') return [`${Number(value).toFixed(1)}`, 'Moving Average (3)'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="Actual THC Yield"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      className="animate-draw"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#8884d8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Trend (3-Plant Moving Avg)"
                      dot={{ r: 3 }}
                      className="animate-draw delay-300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in delay-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Growth Efficiency
                </CardTitle>
                <CardDescription>
                  THC yield relative to growth time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTimeFilteredData().map((stat, index) => ({
                      id: stat.id,
                      efficiency: stat.thcProduced / (stat.totalGrowTime / 60000), // THC per minute
                      thc: stat.thcProduced,
                      time: stat.totalGrowTime / 60000
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="id" 
                      label={{ value: 'Plant ID', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis 
                      label={{ value: 'THC per Minute', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'efficiency') return [`${Number(value).toFixed(2)} THC/min`, 'Efficiency'];
                        if (name === 'thc') return [`${Number(value).toFixed(1)}`, 'Total THC'];
                        if (name === 'time') return [`${Number(value).toFixed(1)} min`, 'Growth Time'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="efficiency" 
                      fill="#8884d8"
                      name="Efficiency (THC/min)"
                      className="animate-grow"
                    >
                      {getTimeFilteredData().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          className="animate-pop"
                          style={{ animationDelay: `${index * 100}ms` }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Seasonal Patterns
                </CardTitle>
                <CardDescription>
                  Average yield by time of day/week
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    outerRadius={90} 
                    data={(() => {
                      // Generate hourly distribution data
                      const hours = Array.from({ length: 8 }, (_, i) => {
                        const hour = i * 3; // 0, 3, 6, 9, 12, 15, 18, 21
                        const hourStr = `${hour}:00-${hour+3}:00`;
                        
                        // Get all harvests in this time range
                        const harvests = currentPlayer.plantStats.filter(stat => {
                          const harvestHour = new Date(stat.harvestTime).getHours();
                          return harvestHour >= hour && harvestHour < hour + 3;
                        });
                        
                        return {
                          hour: hourStr,
                          count: harvests.length,
                          avgYield: harvests.length > 0 
                            ? harvests.reduce((sum, h) => sum + h.thcProduced, 0) / harvests.length 
                            : 0,
                          totalYield: harvests.reduce((sum, h) => sum + h.thcProduced, 0)
                        };
                      });
                      
                      return hours;
                    })()}
                  >
                    <PolarGrid className="animate-spin-slow" />
                    <PolarAngleAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    <Radar 
                      name="Plant Count" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                      className="animate-pulse-slow"
                    />
                    <Radar 
                      name="Avg Yield" 
                      dataKey="avgYield" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                      className="animate-pulse-slow delay-300"
                    />
                    <Legend />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'avgYield') return [`${Number(value).toFixed(1)} THC`, 'Avg Yield per Plant'];
                        if (name === 'count') return [`${value}`, 'Plants Harvested'];
                        return [value, name];
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="animate-fade-in delay-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileClock className="h-5 w-5 mr-2" />
                Recent Harvests Timeline
              </CardTitle>
              <CardDescription>
                Your most recent harvest results in chronological order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-muted-foreground/20" />
                
                {getTimeFilteredData().slice(-5).reverse().map((plant, index) => (
                  <div 
                    key={plant.id} 
                    className="relative pl-8 pb-6 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute left-0 rounded-full h-[30px] w-[30px] bg-muted-foreground/20 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <h4 className="font-semibold">Plant #{plant.id} Harvested</h4>
                        <span className="ml-auto text-sm text-muted-foreground">
                          {formatDistance(plant.harvestTime, new Date(), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm mt-1">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          <div className="p-2 bg-muted rounded-md flex flex-col items-center">
                            <Cannabis className="h-4 w-4 mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">THC Yield</p>
                            <p className="font-medium">{plant.thcProduced.toFixed(1)}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-md flex flex-col items-center">
                            <Star className="h-4 w-4 mb-1 text-amber-500" />
                            <p className="text-xs text-muted-foreground">Quality</p>
                            <p className="font-medium">{plant.quality.toFixed(1)}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-md flex flex-col items-center">
                            <Timer className="h-4 w-4 mb-1 text-blue-500" />
                            <p className="text-xs text-muted-foreground">Growth Time</p>
                            <p className="font-medium">{formatGrowTime(plant.totalGrowTime)}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-md flex flex-col items-center">
                            <Activity className="h-4 w-4 mb-1 text-green-500" />
                            <p className="text-xs text-muted-foreground">Efficiency</p>
                            <p className="font-medium">
                              {(plant.thcProduced / (plant.totalGrowTime / 60000)).toFixed(2)}
                              <span className="text-xs"> THC/min</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getTimeFilteredData().length === 0 && (
                  <div className="py-10 text-center text-muted-foreground">
                    No harvest data available for the selected time period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Equipment Impact Analysis
                </CardTitle>
                <CardDescription>
                  How your equipment affects growing speed and quality
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={equipmentEfficiencyData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 14 }}
                      tickFormatter={(value) => {
                        // Capitalize and format equipment names
                        return value.charAt(0).toUpperCase() + value.slice(1);
                      }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'speedBoost') return [`+${value}%`, 'Speed Boost'];
                        if (name === 'qualityBoost') return [`+${value}%`, 'Quality Boost'];
                        if (name === 'level') return [`Level ${value}`, 'Equipment Level'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="speedBoost" 
                      name="Speed Boost" 
                      fill="#8884d8"
                      className="animate-grow"
                    />
                    <Bar 
                      dataKey="qualityBoost" 
                      name="Quality Boost" 
                      fill="#82ca9d"
                      className="animate-grow delay-200"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in delay-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2" />
                  Equipment Levels
                </CardTitle>
                <CardDescription>
                  Your current equipment setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(currentPlayer.equipment).map(([type, equipment], index) => (
                    <div 
                      key={type} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium capitalize">{type}</p>
                        <p className="text-sm font-semibold">Level {equipment.level}/5</p>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full animate-grow-x"
                          style={{ 
                            width: `${(equipment.level / 5) * 100}%`,
                            backgroundColor: EQUIPMENT_COLORS[type as EquipmentType] || '#cccccc'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{equipment.name}</span>
                        {equipment.nextLevel && <span>Next: {equipment.nextLevel.name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/growroom'}
                >
                  Upgrade Equipment
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="lg:col-span-3 animate-fade-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Equipment Performance Analysis
                </CardTitle>
                <CardDescription>
                  Effects of equipment on THC yield and growing efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={(() => {
                      // Generate simulated data showing effect of equipment on plant performance
                      const simulatedData = [];
                      
                      // Get stats of most recent 15 plants (or fewer if not available)
                      const recentPlants = currentPlayer.plantStats.slice(-15);
                      
                      for (let i = 0; i < recentPlants.length; i++) {
                        const plant = recentPlants[i];
                        // Calculate approximate equipment levels at time of harvest
                        // For simulation purposes, we estimate equipment progression over time
                        const equipmentProgressEstimate = Math.min(1, i / 10); // 0 to 1 based on plant order
                        
                        simulatedData.push({
                          id: plant.id,
                          thc: plant.thcProduced,
                          quality: plant.quality,
                          growTime: plant.totalGrowTime / 60000, // minutes
                          efficiency: plant.thcProduced / (plant.totalGrowTime / 60000),
                          equipmentImpact: ((plant.quality * plant.thcProduced) / 
                            (plant.totalGrowTime / 60000)) * (1 + equipmentProgressEstimate)
                        });
                      }
                      
                      return simulatedData;
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="id" 
                      label={{ value: 'Plant ID (Chronological)', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ value: 'THC & Quality', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ value: 'Efficiency', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'thc') return [`${Number(value).toFixed(1)}`, 'THC Yield'];
                        if (name === 'quality') return [`${Number(value).toFixed(1)}`, 'Plant Quality'];
                        if (name === 'efficiency') return [`${Number(value).toFixed(2)} THC/min`, 'Growing Efficiency'];
                        if (name === 'equipmentImpact') return [`${Number(value).toFixed(2)}`, 'Equipment Performance'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="thc" 
                      stroke="#8884d8"
                      name="THC Yield"
                      strokeWidth={2}
                      className="animate-draw"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="quality" 
                      stroke="#82ca9d"
                      name="Plant Quality"
                      strokeWidth={2}
                      className="animate-draw delay-200"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#ffc658"
                      name="Growing Efficiency"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      className="animate-draw delay-300"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="equipmentImpact" 
                      stroke="#ff7300"
                      name="Equipment Performance Score"
                      strokeWidth={3}
                      className="animate-draw delay-400"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Community Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Performance vs. Community
                </CardTitle>
                <CardDescription>
                  How your growing stats compare to the community
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={communityComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="category" 
                      type="category"
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Community Avg') return [`${Number(value).toFixed(1)}`, 'Community Average'];
                        if (name === 'Avg Top 5') return [`${Number(value).toFixed(1)}`, 'Top 5 Players Avg'];
                        return [`${Number(value).toFixed(1)}`, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="You" 
                      name="Your Stats" 
                      fill="#8884d8"
                      className="animate-grow"
                    />
                    <Bar 
                      dataKey="Avg Top 5" 
                      name="Top 5 Players Avg" 
                      fill="#82ca9d"
                      className="animate-grow delay-200"
                    />
                    <Bar 
                      dataKey="Community Avg" 
                      name="Community Average" 
                      fill="#ffc658"
                      className="animate-grow delay-300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 animate-fade-in delay-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Leaderboard Position
                </CardTitle>
                <CardDescription>
                  Your rank in the global leaderboard
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary animate-pulse-slow">
                        #{currentPlayerRank || 'N/A'}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Out of {aggregateStats.totalPlayers} players
                      </p>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Above You', value: Math.max(0, currentPlayerRank - 1) },
                          { name: 'You', value: 1 },
                          { name: 'Below You', value: Math.max(0, aggregateStats.totalPlayers - currentPlayerRank) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        className="animate-spin-slow"
                      >
                        <Cell fill="#f1f5f9" className="animate-fade-in" />
                        <Cell fill="#8884d8" className="animate-pulse-slow animate-fade-in delay-300" />
                        <Cell fill="#d1d5db" className="animate-fade-in delay-150" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex gap-8 mt-4">
                  <div className="text-center animate-fade-in delay-200">
                    <p className="text-sm text-muted-foreground">THC per Plant</p>
                    <p className="text-xl font-semibold">
                      {currentPlayer.plantStats.length > 0 ? 
                        (currentPlayer.totalThcProduced / currentPlayer.totalPlantsGrown).toFixed(1) : 
                        '0'}
                    </p>
                  </div>
                  <div className="text-center animate-fade-in delay-300">
                    <p className="text-sm text-muted-foreground">Growth Speed</p>
                    <p className="text-xl font-semibold">
                      {currentPlayer.fastestGrowTime > 0 ? 
                        formatGrowTime(currentPlayer.fastestGrowTime) : 
                        'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/leaderboard'}
                >
                  View Full Leaderboard
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-2 animate-fade-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Equipment Comparison
                </CardTitle>
                <CardDescription>
                  Your equipment levels compared to top players
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    outerRadius={90} 
                    data={Object.values(EquipmentType).map(equipType => {
                      // Get top 3 players (excluding current player)
                      const topPlayers = getSortedLeaderboard('totalThcProduced')
                        .filter(player => player.walletAddress !== address)
                        .slice(0, 3);
                      
                      // Create data point for this equipment type
                      const dataPoint: Record<string, any> = {
                        type: equipType,
                        You: currentPlayer.equipment[equipType].level
                      };
                      
                      // Add data for top players
                      topPlayers.forEach((player, index) => {
                        const shortAddr = `#${index + 1} Player`;
                        dataPoint[shortAddr] = player.equipment[equipType].level;
                      });
                      
                      return dataPoint;
                    })}
                  >
                    <PolarGrid className="animate-spin-slow" />
                    <PolarAngleAxis 
                      dataKey="type" 
                      tickFormatter={(value) => {
                        // Capitalize equipment type
                        return value.charAt(0).toUpperCase() + value.slice(1);
                      }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Radar 
                      name="You" 
                      dataKey="You" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                      className="animate-pulse-slow"
                    />
                    <Radar 
                      name="#1 Player" 
                      dataKey="#1 Player" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                      className="animate-pulse-slow delay-100"
                    />
                    <Radar 
                      name="#2 Player" 
                      dataKey="#2 Player" 
                      stroke="#ffc658" 
                      fill="#ffc658" 
                      fillOpacity={0.6}
                      className="animate-pulse-slow delay-200"
                    />
                    <Radar 
                      name="#3 Player" 
                      dataKey="#3 Player" 
                      stroke="#ff8042" 
                      fill="#ff8042" 
                      fillOpacity={0.6}
                      className="animate-pulse-slow delay-300"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
