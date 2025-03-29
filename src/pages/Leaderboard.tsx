
import React, { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trophy } from 'lucide-react';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { StatCard } from '@/components/leaderboard/StatCard';
import { TopPerformers } from '@/components/leaderboard/TopPerformers';
import { AnalyticsTab } from '@/components/leaderboard/AnalyticsTab';
import { PersonalStatsTab } from '@/components/leaderboard/PersonalStatsTab';

const Leaderboard = () => {
  const { 
    getSortedLeaderboard, 
    getCurrentPlayerStats, 
    getAggregateStats, 
    isLoading,
  } = useLeaderboard();
  const [sortBy, setSortBy] = useState<'totalThcProduced' | 'totalPlantsGrown' | 'fastestGrowTime' | 'highestQualityPlant'>('totalThcProduced');
  
  // Get leaderboard data
  const leaderboard = getSortedLeaderboard(sortBy);
  const aggregateStats = getAggregateStats();

  // Check if we have any actual data
  const hasData = leaderboard && leaderboard.length > 0;

  // If there's no data, show a coming soon message
  if (!hasData && !isLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-6 items-center justify-center">
        <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-center">THC Grow Room Leaderboard</h1>
        
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Coming Soon!</AlertTitle>
          <AlertDescription>
            The leaderboard will be available once players start growing plants and harvesting.
            Be the first to appear on the leaderboard by starting your grow operation!
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
            {Object.values(aggregateStats).map((stat, index) => (
              <StatCard 
                key={index}
                title={Object.keys(aggregateStats)[index]} 
                value={typeof stat === 'number' ? stat.toString() : stat} 
                index={index}
              />
            ))}
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
              <LeaderboardTable leaderboard={leaderboard} />
              
              {/* Top Performers Quick View */}
              <TopPerformers getSortedLeaderboard={getSortedLeaderboard} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTab hasData={hasData} />
            </TabsContent>

            {/* Personal Stats Tab */}
            <TabsContent value="personal" className="space-y-6">
              <PersonalStatsTab />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
