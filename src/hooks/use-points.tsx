
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PointsContextType {
  points: Record<string, number>;
  addPoints: (walletAddress: string, amount: number) => void;
  getPoints: (walletAddress: string) => number;
}

const PointsContext = createContext<PointsContextType>({
  points: {},
  addPoints: () => {},
  getPoints: () => 0
});

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<Record<string, number>>({});
  
  // Load points from localStorage on mount
  useEffect(() => {
    const savedPoints = localStorage.getItem('userPoints');
    if (savedPoints) {
      try {
        setPoints(JSON.parse(savedPoints));
      } catch (error) {
        console.error('Failed to parse saved points:', error);
      }
    }
  }, []);
  
  // Save points to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPoints', JSON.stringify(points));
  }, [points]);
  
  const addPoints = (walletAddress: string, amount: number) => {
    setPoints(prev => ({
      ...prev,
      [walletAddress]: (prev[walletAddress] || 0) + amount
    }));
  };
  
  const getPoints = (walletAddress: string) => {
    return points[walletAddress] || 0;
  };
  
  return (
    <PointsContext.Provider value={{ points, addPoints, getPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
