
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
    <div className="absolute inset-0 bg-gray-600 bg-opacity-90 flex items-center justify-center z-50">
      <div className="win95-window max-w-md w-full mx-4">
        <div className="win95-title-bar">
          <span className="win95-title-text">Game Over</span>
        </div>
        
        <div className="win95-panel p-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-red-700 mb-3">GAME OVER</h2>
            <div className="space-y-2 text-sm">
              <div className="win95-inset p-2">
                <span className="font-bold">Final Score: </span>
                <span className="text-green-700 font-bold">{score.toLocaleString()}</span>
              </div>
              <div className="win95-inset p-2">
                <span className="font-bold">Points Earned: </span>
                <span className="text-yellow-600 font-bold">{Math.floor(pointsEarned)}</span>
              </div>
              {address && playerRank > 0 && (
                <div className="win95-inset p-2">
                  <span className="font-bold">Your Rank: </span>
                  <span className="text-blue-600 font-bold">#{playerRank}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="win95-panel p-2 mb-2">
              <h3 className="text-sm font-bold flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-600" />
                Top Players
              </h3>
            </div>
            
            <div className="win95-inset p-1 max-h-32 overflow-y-auto">
              {topPlayers.map((player, index) => (
                <div 
                  key={player.walletAddress}
                  className={`flex items-center justify-between p-1 text-xs ${
                    player.walletAddress === address ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {index === 0 && <Trophy className="h-3 w-3 text-yellow-600" />}
                    {index === 1 && <Medal className="h-3 w-3 text-gray-500" />}
                    {index === 2 && <Award className="h-3 w-3 text-orange-500" />}
                    <span className="font-bold">#{index + 1}</span>
                    <span>{getNickname(player.walletAddress)}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-bold">{player.highestScore.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={onPlayAgain}
              className="win95-button text-sm px-4 py-1"
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
