import { useState } from 'react';
import { Coins, Loader2, ExternalLink } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

interface RewardSystemProps {
  score: number;
  rank: number;
  totalPlayers: number;
  gameLength: number; // in seconds
  onRewardClaimed?: () => void;
}

export default function RewardSystem({ 
  score, 
  rank, 
  totalPlayers, 
  gameLength,
  onRewardClaimed 
}: RewardSystemProps) {
  const [claimingReward, setClaimingReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const { claimReward, transactions } = useWeb3();

  // Calculate reward based on performance
  const calculateReward = () => {
    const baseReward = 0.001; // Base reward in GOR
    const scoreMultiplier = Math.min(score / 100, 5); // Max 5x multiplier
    const rankBonus = rank <= 3 ? (4 - rank) * 0.005 : 0; // Bonus for top 3
    const survivalBonus = gameLength > 60 ? 0.002 : 0; // Bonus for surviving 1+ minutes
    
    const totalReward = baseReward + (baseReward * scoreMultiplier) + rankBonus + survivalBonus;
    return Math.round(totalReward * 1000) / 1000; // Round to 3 decimal places
  };

  const rewardAmount = calculateReward();
  const shouldReceiveReward = score > 0; // Only reward if player scored

  const handleClaimReward = async () => {
    if (!shouldReceiveReward || rewardClaimed) return;

    setClaimingReward(true);
    try {
      const success = await claimReward(rewardAmount);
      if (success) {
        setRewardClaimed(true);
        onRewardClaimed?.();
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setClaimingReward(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-400';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏆';
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-300/20">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getRankEmoji(rank)}</div>
        <h3 className="text-2xl font-bold text-white mb-2">Game Results</h3>
        <div className={`text-lg font-semibold ${getRankColor(rank)}`}>
          Rank #{rank} of {totalPlayers}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-gray-300 text-sm">Score</div>
          <div className="text-white font-bold text-xl">{score}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-gray-300 text-sm">Survival Time</div>
          <div className="text-white font-bold text-xl">{Math.floor(gameLength)}s</div>
        </div>
      </div>

      {shouldReceiveReward ? (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">Reward Earned!</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {rewardAmount} GOR
              </div>
              <div className="text-green-300 text-sm">
                Base: {(0.001).toFixed(3)} + Score Bonus: {(rewardAmount - 0.001).toFixed(3)}
              </div>
            </div>
          </div>

          {!rewardClaimed ? (
            <button
              onClick={handleClaimReward}
              disabled={claimingReward}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {claimingReward ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Claiming Reward...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5" />
                  Claim {rewardAmount} GOR
                </div>
              )}
            </button>
          ) : (
            <div className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center">
              ✅ Reward Claimed Successfully!
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-600/20 border border-gray-500/30 rounded-lg p-4 text-center">
          <div className="text-gray-300 mb-2">No reward earned</div>
          <div className="text-gray-400 text-sm">
            Score some points to earn GOR rewards!
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Recent Transactions
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="bg-white/5 rounded-lg p-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">
                    {tx.type.replace('_', ' ')}
                  </span>
                  <span className={`font-semibold ${
                    tx.status === 'confirmed' ? 'text-green-400' : 
                    tx.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {tx.type === 'entry_fee' ? '-' : '+'}
                    {tx.amount.toFixed(3)} GOR
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(tx.timestamp).toLocaleTimeString()} • {tx.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
