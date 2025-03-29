
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NFTCardProps {
  id: string | number;
  name: string;
  image: string;
  boost?: {
    type: string;
    value: number;
    duration?: number;
  };
  price?: number;
  onSelect?: () => void;
  onUse?: () => void;
  onPurchase?: () => void;
  selected?: boolean;
  className?: string;
}

const NFTCard: React.FC<NFTCardProps> = ({
  id,
  name,
  image,
  boost,
  price,
  onSelect,
  onUse,
  onPurchase,
  selected = false,
  className
}) => {
  // Format boost text based on type
  const getBoostText = () => {
    if (!boost) return null;
    
    switch (boost.type) {
      case 'speed':
        return `+${boost.value}% Speed${boost.duration ? ` (${boost.duration}s)` : ''}`;
      case 'jump':
        return `+${boost.value}% Jump${boost.duration ? ` (${boost.duration}s)` : ''}`;
      default:
        return `+${boost.value}% ${boost.type}${boost.duration ? ` (${boost.duration}s)` : ''}`;
    }
  };
  
  return (
    <div 
      className={cn(
        "win95-window p-0 transition-transform hover:scale-105",
        selected ? "ring-4 ring-[#FFFF00]" : "",
        className
      )}
    >
      <div className="win95-title-bar mb-0">
        <span className="truncate max-w-40">{name}</span>
      </div>
      
      <div className="p-3 flex flex-col items-center">
        {/* NFT Image */}
        <div className="win95-inset w-full aspect-square flex items-center justify-center mb-3 overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-contain pixel-art"
            />
          ) : (
            <div className="w-full h-full bg-[#FF69B4] flex items-center justify-center">
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>
        
        {/* Boost Info */}
        {boost && (
          <div className="w-full text-center mb-3">
            <div className="win95-inset p-1 text-xs font-bold">
              {getBoostText()}
            </div>
          </div>
        )}
        
        {/* Price (for shop items) */}
        {price !== undefined && (
          <div className="w-full text-center mb-3">
            <div className="win95-inset p-1 text-xs font-bold">
              {price} S
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="w-full flex gap-2">
          {onSelect && (
            <Button 
              className="win95-button flex-1 text-xs py-1 h-8" 
              onClick={onSelect}
            >
              Select
            </Button>
          )}
          
          {onUse && (
            <Button 
              className="win95-button flex-1 text-xs py-1 h-8" 
              onClick={onUse}
            >
              Use
            </Button>
          )}
          
          {onPurchase && (
            <Button 
              className="win95-button flex-1 text-xs py-1 h-8" 
              onClick={onPurchase}
            >
              Buy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
