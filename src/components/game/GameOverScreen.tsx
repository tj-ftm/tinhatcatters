
import React from 'react';
import { Button } from '@/components/ui/button';
import { useReptilianLeaderboard } from '@/hooks/useReptilianLeaderboard';
import { useWeb3 } from '@/contexts/Web3Context';
import { useNickname } from '@/hooks/useNickname';
import { Trophy, Medal, Award } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  pointsEarned: number;
  onPlayAgain: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  pointsEarned,
  onPlayAgain
}) => {
  const { leaderboard, getPlayerRank } = useReptilianLeaderboard();
  const { address } = useWeb3();
  const { getNickname } = useNickname();
  
  const playerRank = address ? getPlayerRank(address) : 0;
  const topPlayers = leaderboard.slice(0, 5);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg border-2 border-gray-600 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
          <div className="space-y-2">
            <div className="text-xl">Score: <span className="text-green-400">{score}</span></div>
            <div className="text-lg">Points Earned: <span className="text-yellow-400">{Math.floor(pointsEarned)}</span></div>
            {address && playerRank > 0 && (
              <div className="text-lg">Your Rank: <span className="text-blue-400">#{playerRank}</span></div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Players
          </h3>
          <div className="space-y-2">
            {topPlayers.map((player, index) => (
              <div 
                key={player.walletAddress}
                className={`flex items-center justify-between p-2 rounded ${
                  player.walletAddress === address ? 'bg-yellow-900 bg-opacity-50' : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                  {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                  {index === 2 && <Award className="h-4 w-4 text-orange-500" />}
                  <span className="font-bold">#{index + 1}</span>
                  <span className="text-sm">{getNickname(player.walletAddress)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-green-400">{player.highestScore}</span> pts
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={onPlayAgain}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2"
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
