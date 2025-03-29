
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { PlayerStats, LeaderboardState, PlantStats } from '@/types/leaderboard';
import { Plant, Equipment, EquipmentType } from '@/types/growRoom';

export const useLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardState>({
    players: {},
    lastUpdated: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useWeb3();
  const { toast } = useToast();

  // Load leaderboard data
  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = () => {
    setIsLoading(true);
    try {
      const savedData = localStorage.getItem('thc-growroom-leaderboard');
      if (savedData) {
        const parsedData = JSON.parse(savedData) as LeaderboardState;
        setLeaderboardData(parsedData);
      }
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
      toast({
        title: "Leaderboard Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save leaderboard data
  const saveLeaderboardData = (data: LeaderboardState) => {
    try {
      localStorage.setItem('thc-growroom-leaderboard', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save leaderboard data:', error);
    }
  };

  // Update player stats for the current user
  const updatePlayerStats = (
    plantStats: PlantStats[],
    totalThcProduced: number,
    equipment: Record<EquipmentType, Equipment>
  ) => {
    if (!address) return;

    setLeaderboardData(prevData => {
      // Get existing player data or create new entry
      const existingPlayer = prevData.players[address] || {
        walletAddress: address,
        totalPlantsGrown: 0,
        totalThcProduced: 0,
        fastestGrowTime: Number.MAX_SAFE_INTEGER,
        highestQualityPlant: 0,
        lastActive: Date.now(),
        plantStats: [],
        equipment: equipment
      };

      // Calculate total plants grown
      const totalPlantsGrown = existingPlayer.totalPlantsGrown + plantStats.length;

      // Calculate fastest grow time
      const fastestGrowTime = Math.min(
        existingPlayer.fastestGrowTime,
        ...plantStats.map(plant => plant.totalGrowTime)
      );

      // Calculate highest quality plant
      const highestQualityPlant = Math.max(
        existingPlayer.highestQualityPlant,
        ...plantStats.map(plant => plant.quality)
      );

      // Update the player stats
      const updatedPlayer: PlayerStats = {
        ...existingPlayer,
        totalPlantsGrown,
        totalThcProduced: existingPlayer.totalThcProduced + totalThcProduced,
        fastestGrowTime: fastestGrowTime === Number.MAX_SAFE_INTEGER && plantStats.length === 0 
          ? 0 : fastestGrowTime,
        highestQualityPlant,
        lastActive: Date.now(),
        plantStats: [...existingPlayer.plantStats, ...plantStats],
        equipment
      };

      // Update the leaderboard
      const updatedData = {
        players: {
          ...prevData.players,
          [address]: updatedPlayer
        },
        lastUpdated: Date.now()
      };

      // Save to localStorage
      saveLeaderboardData(updatedData);

      return updatedData;
    });
  };

  // Record a new plant harvest
  const recordPlantHarvest = (
    plant: Plant,
    thcProduced: number,
    equipment: Record<EquipmentType, Equipment>
  ) => {
    if (!address || !plant.lastUpdateTime) return;

    const now = Date.now();
    const totalGrowTime = now - plant.lastUpdateTime;

    const plantStat: PlantStats = {
      id: plant.id,
      seedTime: plant.lastUpdateTime,
      harvestTime: now,
      totalGrowTime,
      quality: plant.quality,
      thcProduced
    };

    updatePlayerStats([plantStat], thcProduced, equipment);
  };

  // Get sorted leaderboard based on different metrics
  const getSortedLeaderboard = (
    sortBy: 'totalThcProduced' | 'totalPlantsGrown' | 'fastestGrowTime' | 'highestQualityPlant' = 'totalThcProduced'
  ): PlayerStats[] => {
    const players = Object.values(leaderboardData.players);
    
    if (sortBy === 'fastestGrowTime') {
      // For fastest grow time, we want non-zero values first (ascending), then zeros
      return [...players].sort((a, b) => {
        if (a.fastestGrowTime === 0 && b.fastestGrowTime > 0) return 1;
        if (b.fastestGrowTime === 0 && a.fastestGrowTime > 0) return -1;
        if (a.fastestGrowTime === 0 && b.fastestGrowTime === 0) return 0;
        return a.fastestGrowTime - b.fastestGrowTime;
      });
    }
    
    return [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  };

  // Get current player stats
  const getCurrentPlayerStats = (): PlayerStats | null => {
    if (!address) return null;
    return leaderboardData.players[address] || null;
  };

  // Get player stats by address
  const getPlayerStats = (playerAddress: string): PlayerStats | null => {
    return leaderboardData.players[playerAddress] || null;
  };

  // Calculate aggregate statistics
  const getAggregateStats = () => {
    const players = Object.values(leaderboardData.players);
    
    return {
      totalPlayers: players.length,
      totalPlantsGrown: players.reduce((sum, player) => sum + player.totalPlantsGrown, 0),
      totalThcProduced: players.reduce((sum, player) => sum + player.totalThcProduced, 0),
      averagePlantsPerPlayer: players.length ? 
        players.reduce((sum, player) => sum + player.totalPlantsGrown, 0) / players.length : 0,
      averageThcPerPlayer: players.length ? 
        players.reduce((sum, player) => sum + player.totalThcProduced, 0) / players.length : 0,
    };
  };

  return {
    leaderboardData,
    isLoading,
    recordPlantHarvest,
    getSortedLeaderboard,
    getCurrentPlayerStats,
    getPlayerStats,
    getAggregateStats,
    loadLeaderboardData
  };
};
