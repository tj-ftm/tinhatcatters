
import React, { useState } from 'react';
import { AlertCircle, Settings, Activity } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface AnalyticsTabProps {
  hasData: boolean;
}

export const AnalyticsTab = ({ hasData }: AnalyticsTabProps) => {
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  // Format value for tooltips
  const formatTooltipValue = (value: any, name: string, props: any) => {
    if (typeof value === 'number') {
      return [value.toFixed(1), name];
    }
    return [value, name];
  };

  // Generate mock activity data for demo purposes
  const generateActivityData = () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      data.push({
        date: date.toLocaleDateString(),
        plants: Math.floor(Math.random() * 10),
        thc: Math.floor(Math.random() * 100)
      });
    }
    return data;
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Analytics Coming Soon</h2>
        <p className="text-gray-500 text-center max-w-md mb-6">
          We need more growing data to generate meaningful analytics. 
          Start growing plants to see detailed statistics and trends!
        </p>
        <button 
          onClick={() => window.location.href = '/growroom'}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Go to Grow Room
        </button>
      </div>
    );
  }

  return (
    <>
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
                data={generateActivityData()}
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
      
      {/* Additional charts would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
          <CardDescription>More detailed analytics will be available as more data is collected</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <div className="text-center">
            <Settings className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">More analytics features coming soon</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
