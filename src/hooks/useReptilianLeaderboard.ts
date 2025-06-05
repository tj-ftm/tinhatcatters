
import { useState, useEffect } from 'react';
import { useNickname } from '@/hooks/useNickname';

export interface GameResult {
  walletAddress: string;
  score: number;
  pointsEarned: number;
  timestamp: number;
  upgrades: {
    speed: number;
    fireRate: number;
    health: number;
  };
}

export interface LeaderboardEntry {
  walletAddress: string;
  nickname: string;
  highestScore: number;
  totalGames: number;
  totalPoints: number;
  averageScore: number;
  lastPlayed: number;
}

export const useReptilianLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getNickname } = useNickname();

  const loadLeaderboard = () => {
    setIsLoading(true);
    try {
      const savedResults = localStorage.getItem('reptilian-leaderboard') || '[]';
      const results: GameResult[] = JSON.parse(savedResults);
      
      // Group results by wallet address
      const playerStats: Record<string, LeaderboardEntry> = {};
      
      results.forEach(result => {
        if (!playerStats[result.walletAddress]) {
          playerStats[result.walletAddress] = {
            walletAddress: result.walletAddress,
            nickname: getNickname(result.walletAddress),
            highestScore: result.score,
            totalGames: 1,
            totalPoints: result.pointsEarned,
            averageScore: result.score,
            lastPlayed: result.timestamp
          };
        } else {
          const stats = playerStats[result.walletAddress];
          stats.highestScore = Math.max(stats.highestScore, result.score);
          stats.totalGames += 1;
          stats.totalPoints += result.pointsEarned;
          stats.averageScore = Math.round((stats.averageScore * (stats.totalGames - 1) + result.score) / stats.totalGames);
          stats.lastPlayed = Math.max(stats.lastPlayed, result.timestamp);
        }
      });

      // Convert to array and sort by highest score
      const sortedLeaderboard = Object.values(playerStats).sort((a, b) => b.highestScore - a.highestScore);
      
      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
    
    // Set up interval to refresh leaderboard every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getPlayerRank = (walletAddress: string): number => {
    return leaderboard.findIndex(entry => entry.walletAddress === walletAddress) + 1;
  };

  const getTotalPlayers = (): number => {
    return leaderboard.length;
  };

  return {
    leaderboard,
    isLoading,
    loadLeaderboard,
    getPlayerRank,
    getTotalPlayers
  };
};
