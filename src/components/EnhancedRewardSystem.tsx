import { useState, useEffect } from 'react';
import { Coins, Loader2, Trophy, Star, Crown, GamepadIcon } from 'lucide-react';
import { useRewardSystem } from '../hooks/useRewardSystem';
import { rewardService, GameReward, REWARD_TIERS } from '../services/rewardService';

interface EnhancedRewardSystemProps {
  score: number;
  rank: number;
  totalPlayers: number;
  gameLength: number;
  playerId: string;
  playerName: string;
  gameId: string;
  onRewardClaimed?: () => void;
}

export default function EnhancedRewardSystem({ 
  score, 
  rank, 
  totalPlayers, 
  gameLength,
  playerId,
  playerName,
  gameId,
  onRewardClaimed 
}: EnhancedRewardSystemProps) {
  const [claimingReward, setClaimingReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [gameReward, setGameReward] = useState<GameReward | null>(null);
  const [showRewardBreakdown, setShowRewardBreakdown] = useState(false);
  
  const { claimGameReward, claimingReward: isClaimingReward, connected } = useRewardSystem();

  useEffect(() => {
    // Calculate rewards for this game
    const players = [{ id: playerId, name: playerName, rank, score }];
    const rewards = rewardService.calculateGameRewards(players, gameLength, gameId);
    const playerReward = rewards.find(r => r.playerId === playerId);
    
    if (playerReward) {
      setGameReward(playerReward);
    }
  }, [score, rank, gameLength, playerId, playerName, gameId]);

  const handleClaimReward = async () => {
    if (!gameReward || !gameReward.eligibleForClaim || rewardClaimed || !connected) return;

    setClaimingReward(true);
    try {
      const success = await claimGameReward(gameReward);
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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'champion': return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'elite': return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'skilled': return <Star className="w-5 h-5 text-blue-400" />;
      default: return <GamepadIcon className="w-5 h-5 text-green-400" />;
    }
  };

  const getTierData = (tier: string) => {
    return REWARD_TIERS.find(t => t.name.toLowerCase() === tier) || REWARD_TIERS[3];
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

  if (!gameReward) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-300/20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Calculating rewards...</p>
        </div>
      </div>
    );
  }

  const tierData = getTierData(gameReward.rewardTier);

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-300/20">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getRankEmoji(rank)}</div>
        <h3 className="text-2xl font-bold text-white mb-2">Game Results</h3>
        <div className={`text-lg font-semibold ${getRankColor(rank)}`}>
          Rank #{rank} of {totalPlayers}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          {getTierIcon(gameReward.rewardTier)}
          <span className={`font-semibold ${tierData.color}`}>
            {tierData.name} Tier {tierData.emoji}
          </span>
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

      {gameReward.eligibleForClaim ? (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">Reward Earned!</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {gameReward.totalReward.toFixed(4)} GOR
              </div>
              <button
                onClick={() => setShowRewardBreakdown(!showRewardBreakdown)}
                className="text-green-300 text-sm hover:text-green-200 transition-colors"
              >
                {showRewardBreakdown ? 'Hide' : 'Show'} breakdown ▼
              </button>
              
              {showRewardBreakdown && (
                <div className="mt-3 p-3 bg-black/20 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Reward ({tierData.name}):</span>
                    <span className="text-yellow-400">{gameReward.baseReward.toFixed(4)} GOR</span>
                  </div>
                  {gameReward.bonusReward > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Performance Bonus:</span>
                      <span className="text-green-400">+{gameReward.bonusReward.toFixed(4)} GOR</span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-1 flex justify-between font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-yellow-400">{gameReward.totalReward.toFixed(4)} GOR</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!connected ? (
            <div className="w-full bg-orange-600/20 border border-orange-500/30 rounded-lg p-4 text-center">
              <div className="text-orange-300 mb-2">Connect Wallet to Claim</div>
              <div className="text-orange-400 text-sm">
                Your reward will be saved for 24 hours
              </div>
            </div>
          ) : !rewardClaimed ? (
            <button
              onClick={handleClaimReward}
              disabled={claimingReward || isClaimingReward}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {claimingReward || isClaimingReward ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Claiming Reward...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5" />
                  Claim {gameReward.totalReward.toFixed(4)} GOR
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
            Reach top 10 to earn GOR rewards!
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Minimum reward threshold: 0.0001 GOR
          </div>
        </div>
      )}

      {/* Reward Pool Info */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Reward Pool Distribution
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {REWARD_TIERS.map((tier, index) => (
            <div key={index} className="bg-white/5 rounded p-2">
              <div className={`font-semibold ${tier.color} mb-1`}>
                {tier.emoji} {tier.name}
              </div>
              <div className="text-gray-300">
                Rank {tier.minRank}{tier.maxRank > tier.minRank ? `-${tier.maxRank}` : ''}
              </div>
              <div className="text-gray-400">
                {tier.poolPercentage}% of pool
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
