
import React from 'react';
import { Trophy, Users, Sprout, Cannabis } from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useWeb3 } from '@/contexts/Web3Context';

interface StatCardProps {
  title: string;
  value: string;
  index: number;
  highlight?: boolean;
}

export const StatCard = ({ title, value, index, highlight = false }: StatCardProps) => {
  const { address } = useWeb3();
  
  // Format title for display
  const formatTitle = (title: string) => {
    switch (title) {
      case 'totalPlayers':
        return 'Total Players';
      case 'totalPlantsGrown':
        return 'Total Plants Grown';
      case 'totalThcProduced':
        return 'Total THC Produced';
      case 'averagePlantsPerPlayer':
        return 'Avg Plants/Player';
      case 'averageThcPerPlayer':
        return 'Avg THC/Player';
      default:
        return title;
    }
  };

  // Select icon based on index
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Users className="h-4 w-4" />;
      case 1:
        return <Sprout className="h-4 w-4" />;
      case 2:
        return <Cannabis className="h-4 w-4" />;
      case 3:
        return <Trophy className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className={highlight ? 'border-purple-500' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{formatTitle(title)}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
          </div>
          <div className="bg-purple-100 p-2 rounded-full">
            {getIcon(index)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
