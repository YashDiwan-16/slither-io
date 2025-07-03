import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Users, Award } from 'lucide-react';
import { useRewardSystem } from '../hooks/useRewardSystem';

export default function RewardPoolStatus() {
  const [showPool, setShowPool] = useState(false);
  const { getPoolStatus, getPendingRewards } = useRewardSystem();
  const [poolData, setPoolData] = useState({
    totalPool: 0,
    totalCollected: 0,
    distributedRewards: 0,
    activeGames: 0
  });
  const [rewardStats, setRewardStats] = useState({
    totalRewards: 0,
    claimedCount: 0,
    unclaimedCount: 0,
    totalValueClaimed: 0,
    totalValueUnclaimed: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const pool = getPoolStatus();
      const stats = getPendingRewards();
      setPoolData(pool);
      setRewardStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getPoolStatus, getPendingRewards]);

  if (!showPool) {
    return (
      <button
        onClick={() => setShowPool(true)}
        className="fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 z-40"
      >
        <Coins className="w-4 h-4" />
        <span className="font-medium">{poolData.totalPool.toFixed(3)} GOR</span>
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Reward Pool
          </h3>
          <button
            onClick={() => setShowPool(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Pool */}
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-200 font-medium">Active Pool</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {poolData.totalPool.toFixed(4)} GOR
            </div>
            <div className="text-yellow-200 text-sm mt-1">
              Available for rewards
            </div>
          </div>

          {/* Pool Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-gray-300 text-xs">Collected</span>
              </div>
              <div className="text-white font-bold text-sm">
                {poolData.totalCollected.toFixed(3)} GOR
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-3 h-3 text-purple-400" />
                <span className="text-gray-300 text-xs">Distributed</span>
              </div>
              <div className="text-white font-bold text-sm">
                {poolData.distributedRewards.toFixed(3)} GOR
              </div>
            </div>
          </div>

          {/* Reward Statistics */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Player Rewards
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Rewards:</span>
                <span className="text-white font-medium">{rewardStats.totalRewards}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Claimed:</span>
                <span className="text-green-400 font-medium">
                  {rewardStats.claimedCount} ({rewardStats.totalValueClaimed.toFixed(3)} GOR)
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Pending:</span>
                <span className="text-yellow-400 font-medium">
                  {rewardStats.unclaimedCount} ({rewardStats.totalValueUnclaimed.toFixed(3)} GOR)
                </span>
              </div>
            </div>
          </div>

          {/* House Edge Info */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
            <div className="text-blue-200 text-xs mb-1">System Info</div>
            <div className="text-blue-100 text-sm">
              5% house edge • 95% to players
            </div>
            <div className="text-blue-300 text-xs mt-1">
              Entry fee: 0.01 GOR per game
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
