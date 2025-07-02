import { useState } from 'react';
import { Wallet, LogOut, Copy, ExternalLink, Check } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3 } from '../hooks/useWeb3';

interface WalletManagerProps {
  showDisconnect?: boolean;
}

export default function WalletManager({ showDisconnect = true }: WalletManagerProps) {
  const { publicKey } = useWallet();
  const { connected, balance, disconnectWallet } = useWeb3();
  const [copied, setCopied] = useState(false);

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const handleCopyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewOnExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.gorbagana.wtf/account/${publicKey.toString()}`, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <div className="space-y-3">
        <WalletMultiButton className="!w-full !bg-blue-500 hover:!bg-blue-400 !text-white !font-bold !py-2 !rounded-full !transition-all !duration-150" />
        <p className="text-blue-200 text-sm text-center">Connect your Solana wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-green-400 text-sm mb-2 text-center">
        ✅ Wallet Connected
      </div>
      
      {/* Wallet Info Card */}
      <div className="bg-blue-800/40 rounded-lg p-3 space-y-2">
        {publicKey && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-300" />
              <span className="text-blue-100 text-sm font-mono">
                {formatAddress(publicKey.toString())}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyAddress}
                className="text-blue-300 hover:text-blue-100 transition-colors p-1 rounded hover:bg-blue-500/20"
                title="Copy Address"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={handleViewOnExplorer}
                className="text-blue-300 hover:text-blue-100 transition-colors p-1 rounded hover:bg-blue-500/20"
                title="View on Explorer"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
              {showDisconnect && (
                <button
                  onClick={handleDisconnect}
                  className="text-red-300 hover:text-red-100 transition-colors p-1 rounded hover:bg-red-500/20 ml-1"
                  title="Disconnect"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {balance !== null && (
          <div className="text-blue-200 text-sm">
            <span className="text-gray-300">Balance: </span>
            <span className="font-bold text-yellow-300">{balance.toFixed(4)} GOR</span>
          </div>
        )}
      </div>
    </div>
  );
}
