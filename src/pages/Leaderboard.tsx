
import React, { useState } from 'react';
import { useReptilianLeaderboard } from '@/hooks/useReptilianLeaderboard';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistance } from 'date-fns';
import { useWeb3 } from '@/contexts/Web3Context';
import { useNickname } from '@/hooks/useNickname';

const Leaderboard = () => {
  const { 
    leaderboard, 
    isLoading,
    loadLeaderboard,
    getPlayerRank,
    getTotalPlayers
  } = useReptilianLeaderboard();
  
  const { address } = useWeb3();
  const { nickname, getNickname } = useNickname();
  const [sortBy, setSortBy] = useState<'highestScore' | 'totalGames' | 'totalPoints' | 'averageScore'>('highestScore');
  
  // Sort leaderboard based on selected criteria
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === 'highestScore') return b.highestScore - a.highestScore;
    if (sortBy === 'totalGames') return b.totalGames - a.totalGames;
    if (sortBy === 'totalPoints') return b.totalPoints - a.totalPoints;
    if (sortBy === 'averageScore') return b.averageScore - a.averageScore;
    return 0;
  });

  // Check if we have any actual data
  const hasData = leaderboard && leaderboard.length > 0;

  // If there's no data, show a coming soon message
  if (!hasData && !isLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-6 items-center justify-center">
        <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-center">Reptilian Run Leaderboard</h1>
        
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ready to Play!</AlertTitle>
          <AlertDescription>
            The leaderboard will show real scores once players start playing.
            Be the first to appear on the leaderboard by playing Reptilian Run!
          </AlertDescription>
        </Alert>
        
        <button 
          onClick={() => window.location.href = '/game'}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Play Reptilian Run
        </button>
      </div>
    );
  }

  const playerRank = address ? getPlayerRank(address) : 0;

  return (
    <div className="flex flex-col h-full p-4 overflow-auto">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
          <h1 className="text-2xl font-bold">Reptilian Run Leaderboard</h1>
        </div>
        <Button 
          onClick={loadLeaderboard}
          className="win95-button flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading leaderboard data...</p>
        </div>
      ) : (
        <>
          {/* Player Stats if connected */}
          {address && playerRank > 0 && (
            <div className="win95-panel p-4 mb-6">
              <h3 className="font-bold mb-2">Your Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-bold">Rank:</span> #{playerRank} of {getTotalPlayers()}
                </div>
                <div>
                  <span className="font-bold">Nickname:</span> {nickname || getNickname(address)}
                </div>
                <div>
                  <span className="font-bold">Best Score:</span> {leaderboard.find(p => p.walletAddress === address)?.highestScore || 0}
                </div>
                <div>
                  <span className="font-bold">Total Games:</span> {leaderboard.find(p => p.walletAddress === address)?.totalGames || 0}
                </div>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              className={`px-3 py-1 rounded ${sortBy === 'highestScore' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSortBy('highestScore')}
            >
              Highest Score
            </button>
            <button 
              className={`px-3 py-1 rounded ${sortBy === 'totalGames' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSortBy('totalGames')}
            >
              Most Games
            </button>
            <button 
              className={`px-3 py-1 rounded ${sortBy === 'totalPoints' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSortBy('totalPoints')}
            >
              Total Points
            </button>
            <button 
              className={`px-3 py-1 rounded ${sortBy === 'averageScore' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSortBy('averageScore')}
            >
              Average Score
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="win95-panel flex-1">
            <div className="overflow-auto h-full">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-200">
                  <tr>
                    <th className="text-left p-2 border-b">Rank</th>
                    <th className="text-left p-2 border-b">Player</th>
                    <th className="text-right p-2 border-b">Best Score</th>
                    <th className="text-right p-2 border-b">Games</th>
                    <th className="text-right p-2 border-b">Total Points</th>
                    <th className="text-right p-2 border-b">Avg Score</th>
                    <th className="text-right p-2 border-b">Last Played</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((entry, index) => (
                    <tr 
                      key={entry.walletAddress}
                      className={`${entry.walletAddress === address ? 'bg-yellow-100' : ''} hover:bg-gray-50`}
                    >
                      <td className="p-2 font-bold">
                        {index + 1}
                        {index === 0 && <Trophy className="inline h-4 w-4 text-yellow-500 ml-1" />}
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{entry.nickname}</div>
                        <div className="text-xs text-gray-500">
                          {entry.walletAddress.substring(0, 6)}...{entry.walletAddress.substring(entry.walletAddress.length - 4)}
                        </div>
                      </td>
                      <td className="p-2 text-right font-bold text-green-600">{entry.highestScore.toLocaleString()}</td>
                      <td className="p-2 text-right">{entry.totalGames}</td>
                      <td className="p-2 text-right text-yellow-600">{entry.totalPoints}</td>
                      <td className="p-2 text-right">{entry.averageScore}</td>
                      <td className="p-2 text-right text-sm text-gray-500">
                        {formatDistance(new Date(entry.lastPlayed), new Date(), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
