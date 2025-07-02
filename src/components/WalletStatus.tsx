import { Wallet, AlertCircle, LogOut } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

export default function WalletStatus() {
  const { connected, balance, transactions, disconnectWallet } = useWeb3();

  if (!connected) return null;

  const recentTransaction = transactions[0];

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="absolute top-4 right-72 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10 min-w-48">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm font-medium">Wallet</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/20"
          title="Disconnect Wallet"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
      
      {balance !== null && (
        <div className="text-white text-sm mb-1">
          <span className="text-gray-300">Balance: </span>
          <span className="font-bold">{balance.toFixed(4)} GOR</span>
        </div>
      )}

      {recentTransaction && (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          {recentTransaction.status === 'failed' && (
            <AlertCircle className="w-3 h-3 text-red-400" />
          )}
          <span className={`capitalize ${
            recentTransaction.status === 'confirmed' ? 'text-green-400' : 
            recentTransaction.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {recentTransaction.type.replace('_', ' ')}: {recentTransaction.status}
          </span>
        </div>
      )}
    </div>
  );
}
