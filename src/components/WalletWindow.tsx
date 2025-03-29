
import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, X, MinusIcon, Maximize2 } from 'lucide-react';
import WalletSelectDialog from './WalletSelectDialog';

interface WalletWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

const WalletWindow: React.FC<WalletWindowProps> = ({ onClose, onMinimize }) => {
  const { address, balance, thcBalance, connecting, connect } = useWeb3();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState<Size>({ width: 280, height: 200 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState<{ position: Position, size: Size } | null>(null);
  
  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizeStartSize = useRef<Size | null>(null);
  
  // Format address for display
  const displayAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      if (resizeStartPos.current && resizeStartSize.current) {
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;
        
        let newPos = { ...position };
        let newSize = { ...resizeStartSize.current };
        
        // Handle resize based on direction
        if (isResizing.includes('n')) {
          newPos.y = position.y + deltaY;
          newSize.height = resizeStartSize.current.height - deltaY;
        }
        if (isResizing.includes('s')) {
          newSize.height = resizeStartSize.current.height + deltaY;
        }
        if (isResizing.includes('w')) {
          newPos.x = position.x + deltaX;
          newSize.width = resizeStartSize.current.width - deltaX;
        }
        if (isResizing.includes('e')) {
          newSize.width = resizeStartSize.current.width + deltaX;
        }
        
        // Ensure minimum size
        const minSize = 200;
        if (newSize.width < minSize) {
          newSize.width = minSize;
          if (isResizing.includes('w')) {
            newPos.x = position.x + (resizeStartSize.current.width - minSize);
          }
        }
        if (newSize.height < minSize) {
          newSize.height = minSize;
          if (isResizing.includes('n')) {
            newPos.y = position.y + (resizeStartSize.current.height - minSize);
          }
        }
        
        setPosition(newPos);
        setSize(newSize);
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
    resizeStartPos.current = null;
    resizeStartSize.current = null;
  };
  
  const startResize = (direction: ResizeDirection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMaximized) return;
    
    setIsResizing(direction);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { ...size };
  };
  
  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous state
      if (preMaximizeState) {
        setPosition(preMaximizeState.position);
        setSize(preMaximizeState.size);
      }
    } else {
      // Save current state
      setPreMaximizeState({ position, size });
      
      // Maximize
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight - 40 // 40px for taskbar
      });
    }
    
    setIsMaximized(!isMaximized);
  };
  
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);
  
  const handleConnectClick = () => {
    setShowWalletDialog(true);
  };
  
  const handleSelectWallet = (walletId: string) => {
    connect(walletId);
  };
  
  return (
    <div 
      className="win95-window absolute z-40" 
      style={{ 
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isResizing ? `${isResizing}-resize` : 'default'
      }}
    >
      <div 
        className="win95-title-bar flex items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <Wallet className="h-4 w-4 mr-2" />
        <span className="flex-grow">Wallet</span>
        <button 
          className="text-white h-5 w-5 flex items-center justify-center hover:bg-blue-800 mr-1"
          onClick={onMinimize}
        >
          <MinusIcon className="h-3 w-3" />
        </button>
        <button 
          className="text-white h-5 w-5 flex items-center justify-center hover:bg-blue-800 mr-1"
          onClick={toggleMaximize}
        >
          <Maximize2 className="h-3 w-3" />
        </button>
        <button 
          className="text-white h-5 w-5 flex items-center justify-center hover:bg-red-800"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      <div className="p-4 h-[calc(100%-24px)] overflow-auto">
        {!address ? (
          <div className="flex flex-col items-center">
            <p className="mb-3 text-sm">Connect your wallet to view balance</p>
            <button 
              className="win95-button py-1 px-3 flex items-center"
              onClick={handleConnectClick}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
              <Wallet className="ml-2 h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold mb-1">Address:</p>
              <p className="text-xs win95-inset p-1 break-all overflow-hidden">{address}</p>
            </div>
            <div className="flex space-x-3">
              <div className="flex-1">
                <p className="text-xs font-bold mb-1">S Balance:</p>
                <p className="text-xs win95-inset p-1">{parseFloat(balance).toFixed(4)} S</p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1">THC Balance:</p>
                <p className="text-xs win95-inset p-1">{thcBalance || '0'} THC</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Resize handles (only visible when not maximized) */}
      {!isMaximized && (
        <>
          {/* Corner resize handles */}
          <div className="absolute w-2 h-2 top-0 left-0 cursor-nw-resize" 
                onMouseDown={(e) => startResize('nw', e)} />
          <div className="absolute w-2 h-2 top-0 right-0 cursor-ne-resize" 
                onMouseDown={(e) => startResize('ne', e)} />
          <div className="absolute w-2 h-2 bottom-0 left-0 cursor-sw-resize" 
                onMouseDown={(e) => startResize('sw', e)} />
          <div className="absolute w-2 h-2 bottom-0 right-0 cursor-se-resize" 
                onMouseDown={(e) => startResize('se', e)} />
          
          {/* Edge resize handles */}
          <div className="absolute h-1 left-2 right-2 top-0 cursor-n-resize" 
                onMouseDown={(e) => startResize('n', e)} />
          <div className="absolute h-1 left-2 right-2 bottom-0 cursor-s-resize" 
                onMouseDown={(e) => startResize('s', e)} />
          <div className="absolute w-1 top-2 bottom-2 left-0 cursor-w-resize" 
                onMouseDown={(e) => startResize('w', e)} />
          <div className="absolute w-1 top-2 bottom-2 right-0 cursor-e-resize" 
                onMouseDown={(e) => startResize('e', e)} />
          
          {/* Bottom-right resize handle icon - make this much smaller */}
          <div className="absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center cursor-se-resize"
                onMouseDown={(e) => startResize('se', e)}>
            <svg width="5" height="5" viewBox="0 0 8 8" className="fill-current text-gray-700">
              <path d="M0,6 h2 v2 h-2 z M3,3 h2 v2 h-2 z M6,0 h2 v2 h-2 z" />
            </svg>
          </div>
        </>
      )}
      
      <WalletSelectDialog 
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onSelectWallet={handleSelectWallet}
      />
    </div>
  );
};

export default WalletWindow;
