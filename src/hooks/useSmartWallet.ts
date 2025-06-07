
import { useAddress, useDisconnect, useWallet } from '@thirdweb-dev/react';
import { useEffect, useState } from 'react';

export const useSmartWallet = () => {
  const address = useAddress();
  const wallet = useWallet();
  const disconnect = useDisconnect();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!address && !!wallet);
  }, [address, wallet]);

  const connectSmartWallet = async () => {
    // Connection is handled by the ConnectWallet component
    // This is just for consistency with other wallet hooks
    return address;
  };

  const disconnectSmartWallet = async () => {
    await disconnect();
  };

  return {
    address,
    wallet,
    isConnected,
    connect: connectSmartWallet,
    disconnect: disconnectSmartWallet,
  };
};
