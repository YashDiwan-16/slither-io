import { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram, 
  Transaction
} from '@solana/web3.js';

interface GameTransaction {
  id: string;
  type: 'entry_fee' | 'reward_payout';
  amount: number;
  timestamp: number;
  signature?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface Web3ContextType {
  // Wallet state
  connected: boolean;
  connecting: boolean;
  balance: number | null;
  
  // Game transactions
  transactions: GameTransaction[];
  payingEntryFee: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  payEntryFee: (amount: number) => Promise<boolean>;
  claimReward: (amount: number) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export { Web3Context };

interface Web3ProviderProps {
  children: ReactNode;
}

// Game treasury wallet (replace with actual treasury address)
const GAME_TREASURY = new PublicKey('62fw621KsHjW3oSU7yXjuwezU1Ssaxkj7qS8B4AAh69R');

export function Web3Provider({ children }: Web3ProviderProps) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected, connecting, connect, disconnect } = useWallet();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<GameTransaction[]>([]);
  const [payingEntryFee, setPayingEntryFee] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [connect]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setBalance(null);
    setTransactions([]);
  }, [disconnect]);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [connection, publicKey]);

  const payEntryFee = useCallback(async (amount: number): Promise<boolean> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setPayingEntryFee(true);
    const transactionId = Math.random().toString(36).substr(2, 9);

    // Add pending transaction
    const newTransaction: GameTransaction = {
      id: transactionId,
      type: 'entry_fee',
      amount,
      timestamp: Date.now(),
      status: 'pending'
    };
    setTransactions(prev => [newTransaction, ...prev]);

    try {
      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: GAME_TREASURY,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      // Create transaction
      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = publicKey;

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      // Update transaction status
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'confirmed' as const, signature }
            : tx
        )
      );

      // Refresh balance
      await refreshBalance();
      
      return true;
    } catch (error) {
      console.error('Failed to pay entry fee:', error);
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'failed' as const }
            : tx
        )
      );
      
      return false;
    } finally {
      setPayingEntryFee(false);
    }
  }, [publicKey, signTransaction, connection, refreshBalance]);

  const claimReward = useCallback(async (amount: number): Promise<boolean> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const transactionId = Math.random().toString(36).substr(2, 9);

    // Add pending transaction
    const newTransaction: GameTransaction = {
      id: transactionId,
      type: 'reward_payout',
      amount,
      timestamp: Date.now(),
      status: 'pending'
    };
    setTransactions(prev => [newTransaction, ...prev]);

    try {
      // In a real implementation, this would call a smart contract
      // or backend service to distribute rewards
      // For now, we'll simulate the reward claim
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'confirmed' as const, signature: 'simulated_reward_tx' }
            : tx
        )
      );

      // Refresh balance
      await refreshBalance();
      
      return true;
    } catch (error) {
      console.error('Failed to claim reward:', error);
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'failed' as const }
            : tx
        )
      );
      
      return false;
    }
  }, [publicKey, refreshBalance]);

  // Refresh balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    }
  }, [connected, publicKey, refreshBalance]);

  const value: Web3ContextType = {
    connected,
    connecting,
    balance,
    transactions,
    payingEntryFee,
    connectWallet,
    disconnectWallet,
    payEntryFee,
    claimReward,
    refreshBalance,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}
