
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

export const StatCard = ({ title, value, description, icon }: StatCardProps) => {
  // Format numeric values to 2 decimal places if they're numbers
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{formattedValue}</p>
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
