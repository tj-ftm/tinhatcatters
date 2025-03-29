
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, BarChart2, Cannabis, Clock, Settings, TrendingUp, Trophy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { formatDistance } from 'date-fns';

const Analytics = () => {
  const { getSortedLeaderboard, getAggregateStats, isLoading } = useLeaderboard();
  
  // Check if we have any data
  const leaderboard = getSortedLeaderboard();
  const hasData = leaderboard && leaderboard.length > 0;
  
  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading analytics data...</p>
      </div>
    );
  }
  
  // If no data, show coming soon message
  if (!hasData) {
    return (
      <div className="flex flex-col h-full p-8 space-y-6 items-center justify-center">
        <BarChart2 className="h-16 w-16 text-purple-500 mb-4" />
        <h1 className="text-2xl font-bold text-center">THC Grow Analytics</h1>
        
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analytics Coming Soon!</AlertTitle>
          <AlertDescription>
            Analytics will be available once players start growing plants and harvesting.
            Start growing to see detailed statistics and insights about your operation!
          </AlertDescription>
        </Alert>
        
        <button 
          onClick={() => window.location.href = '/growroom'}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Start Growing
        </button>
      </div>
    );
  }
  
  // Get aggregate stats
  const stats = getAggregateStats();
  
  // Helper function to shorten wallet address
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <BarChart2 className="h-6 w-6 text-purple-500 mr-2" />
        <h1 className="text-2xl font-bold">THC Grow Analytics</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>Detailed growth data will be available as more plants are grown</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium">Growth Analytics Coming Soon</p>
                <p className="text-gray-500 max-w-md mt-2">
                  More detailed analytics will be available as players grow more plants
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Analytics</CardTitle>
              <CardDescription>Detailed production data will be available as more THC is produced</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium">Production Analytics Coming Soon</p>
                <p className="text-gray-500 max-w-md mt-2">
                  More detailed analytics will be available as players produce more THC
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
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

// Stats Card Component
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string;
  icon: React.ReactNode 
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="bg-purple-100 p-2 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Analytics;
