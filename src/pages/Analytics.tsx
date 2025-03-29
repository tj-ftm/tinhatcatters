
import React from 'react';
import { BarChart2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { AnalyticsOverviewTab } from '@/components/analytics/AnalyticsOverviewTab';
import { AnalyticsGrowthTab } from '@/components/analytics/AnalyticsGrowthTab';
import { AnalyticsProductionTab } from '@/components/analytics/AnalyticsProductionTab';

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
          <AnalyticsOverviewTab />
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <AnalyticsGrowthTab />
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <AnalyticsProductionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
