import { useState } from 'react';
import { Coins, ExternalLink, Loader2 } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

export default function FaucetInfo() {
  const { connected, balance, refreshBalance } = useWeb3();
  const [claiming, setClaiming] = useState(false);

  const handleFaucetClick = async () => {
    setClaiming(true);
    // Open faucet in new tab
    window.open('https://faucet.gorbagana.wtf/', '_blank');
    
    // Wait a bit and refresh balance
    setTimeout(async () => {
      await refreshBalance();
      setClaiming(false);
    }, 3000);
  };

  if (!connected) return null;

  const needsFunds = balance !== null && balance < 0.01;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      {needsFunds && (
        <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Need GOR Tokens?</span>
          </div>
          <p className="text-orange-100 text-sm mb-3">
            Get free GOR tokens from the official faucet to play the game!
          </p>
          <button
            onClick={handleFaucetClick}
            disabled={claiming}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {claiming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Check balance...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Get Free GOR
              </>
            )}
          </button>
          <div className="text-xs text-orange-200 mt-2 text-center">
            Official Gorbagana Faucet
          </div>
        </div>
      )}
    </div>
  );
}
