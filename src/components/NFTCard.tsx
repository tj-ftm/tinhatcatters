
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
  disabled?: boolean;
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
  className,
  disabled = false
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
        selected ? "ring-2 ring-[#FFFF00]" : "",
        disabled ? "opacity-75" : "",
        className
      )}
    >
      <div className="win95-title-bar mb-0 text-xs">
        <span className="truncate max-w-24">{name}</span>
      </div>
      
      <div className="p-2 flex flex-col items-center">
        {/* NFT Image */}
        <div className="win95-inset w-full aspect-square flex items-center justify-center mb-2 overflow-hidden">
          {image ? (
            <div className="w-full h-full">
              <AspectRatio ratio={1/1} className="h-full">
                <img 
                  src={image} 
                  alt={name} 
                  className="w-full h-full object-contain pixel-art"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="hotpink"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" text-anchor="middle" fill="white">Image Error</text></svg>';
                  }}
                />
              </AspectRatio>
            </div>
          ) : (
            <div className="w-full h-full bg-[#FF69B4] flex items-center justify-center">
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>
        
        {/* Boost Info */}
        {boost && (
          <div className="w-full text-center mb-2">
            <div className="win95-inset p-1 text-[10px] font-bold">
              {getBoostText()}
            </div>
          </div>
        )}
        
        {/* Price (for shop items) */}
        {price !== undefined && (
          <div className="w-full text-center mb-2">
            <div className="win95-inset p-1 text-[10px] font-bold">
              {price} $THC
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="w-full flex gap-1">
          {onSelect && (
            <Button 
              className="win95-button flex-1 text-[10px] py-0.5 h-6" 
              onClick={onSelect}
              disabled={disabled}
            >
              Select
            </Button>
          )}
          
          {onUse && (
            <Button 
              className="win95-button flex-1 text-[10px] py-0.5 h-6" 
              onClick={onUse}
              disabled={disabled}
            >
              Use
            </Button>
          )}
          
          {onPurchase && (
            <Button 
              className={cn(
                "win95-button flex-1 text-[10px] py-0.5 h-6",
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              )}
              onClick={onPurchase}
              disabled={disabled}
              title={disabled ? "Connect wallet to purchase" : "Buy this item"}
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
