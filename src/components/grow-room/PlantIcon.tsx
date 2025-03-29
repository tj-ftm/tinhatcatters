
import React from 'react';
import { Sprout, Leaf } from 'lucide-react';
import { GrowthStage } from '@/types/growRoom';

interface PlantIconProps {
  stage: GrowthStage;
  className?: string;
}

const PlantIcon: React.FC<PlantIconProps> = ({ stage, className = "w-10 h-10" }) => {
  switch (stage) {
    case GrowthStage.Seed:
      return <div className={`${className} bg-brown-600 rounded-full flex items-center justify-center`}>🌱</div>;
    case GrowthStage.Sprout:
      return <Sprout className={`${className} text-green-400`} />;
    case GrowthStage.Vegetative:
      return <Leaf className={`${className} text-green-600`} />;
    case GrowthStage.Flowering:
      return <div className={`${className} text-purple-500 flex items-center justify-center`}>🌿</div>;
    case GrowthStage.Harvest:
      return <div className={`${className} text-pink-600 flex items-center justify-center`}>☘️</div>;
    default:
      return <Sprout className={className} />;
  }
};

export default PlantIcon;
