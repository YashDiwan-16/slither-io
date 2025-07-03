import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { rewardService, GameReward } from '../services/rewardService';

export function useRewardSystem() {
  const [claimingReward, setClaimingReward] = useState(false);
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const claimGameReward = useCallback(async (reward: GameReward): Promise<boolean> => {
    if (!connected || !publicKey || !reward.eligibleForClaim || reward.claimed) {
      return false;
    }

    setClaimingReward(true);
    try {
      // Use the blockchain-based claim reward functionality
      const result = await rewardService.claimReward(reward.id, publicKey, connection);
      
      if (result.success) {
        console.log(`Reward claimed with signature: ${result.signature}`);
        return true;
      } else {
        console.error('Reward claim failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      return false;
    } finally {
      setClaimingReward(false);
    }
  }, [connected, publicKey, connection]);

  const getPendingRewards = useCallback(() => {
    return rewardService.getRewardStats();
  }, []);

  const getPoolStatus = useCallback(() => {
    return rewardService.getPoolStatus();
  }, []);

  return {
    claimGameReward,
    claimingReward,
    getPendingRewards,
    getPoolStatus,
    connected
  };
}
