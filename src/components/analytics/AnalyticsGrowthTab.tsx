
import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AnalyticsGrowthTab = () => {
  return (
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
  );
};
