
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

export const useNickname = () => {
  const { address } = useWeb3();
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load nickname when address changes
  useEffect(() => {
    if (address) {
      const savedNickname = localStorage.getItem(`nickname-${address}`);
      setNickname(savedNickname || '');
    } else {
      setNickname('');
    }
  }, [address]);

  const saveNickname = async (newNickname: string) => {
    if (!address) return false;
    
    setIsLoading(true);
    try {
      localStorage.setItem(`nickname-${address}`, newNickname);
      setNickname(newNickname);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error saving nickname:', error);
      setIsLoading(false);
      return false;
    }
  };

  const getNickname = (walletAddress: string): string => {
    return localStorage.getItem(`nickname-${walletAddress}`) || 
           `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
  };

  return {
    nickname,
    saveNickname,
    getNickname,
    isLoading,
    hasNickname: nickname.length > 0
  };
};
