
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  actionType: string | null;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, actionType }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Transaction In Progress</h3>
        <p className="text-gray-300 mb-4">{actionType}...</p>
        <p className="text-sm text-gray-400">Please confirm the transaction in your wallet and wait for blockchain confirmation.</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
