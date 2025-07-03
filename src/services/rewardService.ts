import { PublicKey, Connection, Transaction, LAMPORTS_PER_SOL, SystemProgram, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export interface GameReward {
  id: string;
  playerId: string;
  playerName: string;
  rank: number;
  totalPlayers: number;
  score: number;
  gameLength: number;
  baseReward: number;
  bonusReward: number;
  totalReward: number;
  rewardTier: 'champion' | 'elite' | 'skilled' | 'participant';
  eligibleForClaim: boolean;
  claimed: boolean;
  claimedAt?: number;
  gameEndTime: number;
}

export interface RewardPool {
  totalPool: number;
  entryFeePerPlayer: number;
  activeGames: number;
  totalCollected: number;
  distributedRewards: number;
  houseEdge: number; // Percentage kept by the house (5%)
}

export interface RewardTier {
  name: string;
  minRank: number;
  maxRank: number;
  poolPercentage: number;
  multiplier: number;
  color: string;
  emoji: string;
}

export const REWARD_TIERS: RewardTier[] = [
  {
    name: 'Champion',
    minRank: 1,
    maxRank: 1,
    poolPercentage: 40, // 40% of pool
    multiplier: 5.0,
    color: 'text-yellow-400',
    emoji: '🏆'
  },
  {
    name: 'Elite',
    minRank: 2,
    maxRank: 3,
    poolPercentage: 30, // 30% of pool split between 2nd-3rd
    multiplier: 2.5,
    color: 'text-purple-400',
    emoji: '💎'
  },
  {
    name: 'Skilled',
    minRank: 4,
    maxRank: 10,
    poolPercentage: 20, // 20% of pool split between 4th-10th
    multiplier: 1.2,
    color: 'text-blue-400',
    emoji: '⭐'
  },
  {
    name: 'Participant',
    minRank: 11,
    maxRank: 999,
    poolPercentage: 5, // 5% of pool for participation
    multiplier: 0.5,
    color: 'text-green-400',
    emoji: '🎮'
  }
];

export class RewardService {
  private static instance: RewardService;
  private rewardPool: RewardPool;
  private pendingRewards: Map<string, GameReward> = new Map();
  
  private constructor() {
    this.rewardPool = {
      totalPool: 0,
      entryFeePerPlayer: 0.01, // 0.01 GOR entry fee
      activeGames: 0,
      totalCollected: 0,
      distributedRewards: 0,
      houseEdge: 5 // 5% house edge
    };
  }

  static getInstance(): RewardService {
    if (!RewardService.instance) {
      RewardService.instance = new RewardService();
    }
    return RewardService.instance;
  }

  // Add entry fee to the reward pool
  addToPool(amount: number): void {
    this.rewardPool.totalPool += amount * (100 - this.rewardPool.houseEdge) / 100;
    this.rewardPool.totalCollected += amount;
  }

  // Calculate rewards for a completed game
  calculateGameRewards(
    players: Array<{
      id: string;
      name: string;
      rank: number;
      score: number;
    }>,
    gameLength: number,
    gameId: string
  ): GameReward[] {
    const totalPlayers = players.length;
    const gamePoolSize = this.rewardPool.entryFeePerPlayer * totalPlayers * (100 - this.rewardPool.houseEdge) / 100;
    
    const rewards: GameReward[] = [];

    players.forEach(player => {
      const tier = this.getRewardTier(player.rank);
      
      // Base reward calculation
      let baseReward = 0;
      let bonusReward = 0;
      
      if (tier) {
        // Calculate tier-based reward
        const tierPlayersInRange = players.filter(p => 
          p.rank >= tier.minRank && p.rank <= tier.maxRank
        ).length;
        
        const tierPoolShare = (gamePoolSize * tier.poolPercentage) / 100;
        baseReward = tierPoolShare / Math.max(tierPlayersInRange, 1);
        
        // Performance bonuses
        const scoreBonus = Math.min(player.score / 1000, 1) * 0.002; // Max 0.002 GOR for high score
        const survivalBonus = gameLength > 120 ? 0.001 : 0; // Bonus for 2+ minute survival
        const rankBonus = player.rank === 1 ? 0.005 : 0; // Extra winner bonus
        
        bonusReward = scoreBonus + survivalBonus + rankBonus;
      }

      const totalReward = baseReward + bonusReward;
      const eligibleForClaim = totalReward > 0.0001; // Minimum claim threshold

      const reward: GameReward = {
        id: `${gameId}_${player.id}`,
        playerId: player.id,
        playerName: player.name,
        rank: player.rank,
        totalPlayers,
        score: player.score,
        gameLength,
        baseReward,
        bonusReward,
        totalReward,
        rewardTier: (tier?.name.toLowerCase() as 'champion' | 'elite' | 'skilled' | 'participant') || 'participant',
        eligibleForClaim,
        claimed: false,
        gameEndTime: Date.now()
      };

      if (eligibleForClaim) {
        this.pendingRewards.set(reward.id, reward);
      }
      
      rewards.push(reward);
    });

    return rewards;
  }

  private getRewardTier(rank: number): RewardTier | null {
    return REWARD_TIERS.find(tier => rank >= tier.minRank && rank <= tier.maxRank) || null;
  }

  // Get pending rewards for a player
  getPendingRewards(playerId: string): GameReward[] {
    return Array.from(this.pendingRewards.values())
      .filter(reward => reward.playerId === playerId && !reward.claimed);
  }

  // Check if player can claim a specific reward
  canClaimReward(rewardId: string): { canClaim: boolean; reason?: string } {
    const reward = this.pendingRewards.get(rewardId);
    
    if (!reward) {
      return { canClaim: false, reason: 'Reward not found' };
    }
    
    if (reward.claimed) {
      return { canClaim: false, reason: 'Reward already claimed' };
    }
    
    if (!reward.eligibleForClaim) {
      return { canClaim: false, reason: 'Not eligible for reward' };
    }
    
    // Check if reward is expired (24 hours)
    const isExpired = Date.now() - reward.gameEndTime > 24 * 60 * 60 * 1000;
    if (isExpired) {
      return { canClaim: false, reason: 'Reward expired' };
    }
    
    return { canClaim: true };
  }

  // Real blockchain reward claim implementation
  async claimReward(
    rewardId: string,
    playerWallet: PublicKey,
    connection: Connection
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    const reward = this.pendingRewards.get(rewardId);
    
    if (!reward) {
      return { success: false, error: 'Reward not found' };
    }

    const eligibilityCheck = this.canClaimReward(rewardId);
    if (!eligibilityCheck.canClaim) {
      return { success: false, error: eligibilityCheck.reason };
    }

    try {
      // Mark as claimed immediately to prevent double claims
      reward.claimed = true;
      reward.claimedAt = Date.now();

      // Get vault private key from environment
      const vaultPrivateKeyBase58 = import.meta.env.VITE_VAULT_PRIVATE_KEY || process.env.VITE_VAULT_PRIVATE_KEY;
      if (!vaultPrivateKeyBase58) {
        throw new Error('Vault private key not configured');
      }

      // Create vault keypair from private key
      const vaultKeypair = Keypair.fromSecretKey(bs58.decode(vaultPrivateKeyBase58));
      
      // Calculate lamports to transfer
      const lamports = Math.floor(reward.totalReward * LAMPORTS_PER_SOL);
      
      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: vaultKeypair.publicKey,
          toPubkey: playerWallet,
          lamports
        })
      );

      // Set fee payer and get recent blockhash
      transaction.feePayer = vaultKeypair.publicKey;
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;

      // Sign transaction with vault keypair
      transaction.sign(vaultKeypair);

      // Send raw transaction
      const rawTx = transaction.serialize();
      const signature = await connection.sendRawTransaction(rawTx, { 
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      // Update pool statistics
      this.rewardPool.distributedRewards += reward.totalReward;
      this.rewardPool.totalPool -= reward.totalReward;
      
      console.log(`Reward claimed successfully: ${signature}`);
      return { success: true, signature };
      
    } catch (error) {
      // Rollback claim status on error
      reward.claimed = false;
      reward.claimedAt = undefined;
      
      console.error('Reward claim failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Get reward pool status
  getPoolStatus(): RewardPool {
    return { ...this.rewardPool };
  }

  // Get reward statistics
  getRewardStats() {
    const allRewards = Array.from(this.pendingRewards.values());
    const claimedRewards = allRewards.filter(r => r.claimed);
    const unclaimedRewards = allRewards.filter(r => !r.claimed && r.eligibleForClaim);
    
    return {
      totalRewards: allRewards.length,
      claimedCount: claimedRewards.length,
      unclaimedCount: unclaimedRewards.length,
      totalValueClaimed: claimedRewards.reduce((sum, r) => sum + r.totalReward, 0),
      totalValueUnclaimed: unclaimedRewards.reduce((sum, r) => sum + r.totalReward, 0),
      poolStatus: this.getPoolStatus()
    };
  }
}

export const rewardService = RewardService.getInstance();
