import { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import FaucetInfo from './FaucetInfo';
import TreasuryInfo from './TreasuryInfo';
import WalletManager from './WalletManager';

interface StartScreenProps {
  onStart: (playerName: string) => void;
  onShowTournament?: () => void;
}

export default function StartScreen({ onStart, onShowTournament }: StartScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [paymentMade, setPaymentMade] = useState(false);
  const [isPayingFee, setIsPayingFee] = useState(false);
  
  const { 
    connected, 
    balance, 
    payEntryFee, 
    payingEntryFee,
    refreshBalance 
  } = useWeb3();

  // Entry fee in GOR (Gorbagana tokens)
  const ENTRY_FEE = 0.01; // 0.01 GOR

  useEffect(() => {
    if (connected) {
      refreshBalance();
    }
  }, [connected, refreshBalance]);

  const handlePayFee = async () => {
    if (!connected) return;
    
    setIsPayingFee(true);
    try {
      const success = await payEntryFee(ENTRY_FEE);
      if (success) {
        setPaymentMade(true);
      } else {
        // Handle payment failure
        console.error('Payment failed');
      }
    } catch (error) {
      console.error('Error during payment:', error);
    } finally {
      setIsPayingFee(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMade) return;
    const name = playerName.trim() || 'Anonymous Snake';
    onStart(name);
  };

  const canPlay = connected && paymentMade;
  const hasInsufficientBalance = connected && balance !== null && balance < ENTRY_FEE;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-black overflow-hidden">
      {/* Floating top nav bar */}
      {/* <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex gap-6 bg-blue-800/80 rounded-full px-8 py-3 shadow-lg backdrop-blur-md border border-blue-300/30">
        <a href="#game" className="text-white font-semibold hover:text-yellow-300 transition">Game</a>
        <a href="#leaderboard" className="text-white font-semibold hover:text-yellow-300 transition">Leaderboard</a>
        <a href="#connect" className="text-white font-semibold hover:text-yellow-300 transition">Connect</a>
        <a href="#about" className="text-white font-semibold hover:text-yellow-300 transition">About</a>
      </nav> */}
      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full pt-32 pb-16">
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white text-center mb-4 tracking-tight" style={{textShadow: '0 4px 32px #0008'}}>SnakeRush<span className="text-yellow-300">.io</span> Online</h1>
        <p className="text-xl md:text-2xl text-blue-100 text-center mb-10">Eat orbs. Grow your snake. Outsmart everyone.</p>
        {/* Hero visual: stylized snake SVG */}
        <div className="mb-12">
          <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M270 60 Q220 120 260 180 Q300 220 160 200 Q60 180 80 120 Q100 60 180 60 Q260 60 270 60" stroke="#ffe066" strokeWidth="18" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <ellipse cx="270" cy="60" rx="32" ry="32" fill="#ffe066" stroke="#fff" strokeWidth="6" />
            {/* Eyes */}
            <ellipse cx="260" cy="58" rx="7" ry="10" fill="#fff" />
            <ellipse cx="280" cy="62" rx="7" ry="10" fill="#fff" />
            <ellipse cx="260" cy="58" rx="3.5" ry="4" fill="#222" />
            <ellipse cx="280" cy="62" rx="3.5" ry="4" fill="#222" />
            {/* Tongue */}
            <rect x="268" y="90" width="4" height="18" fill="#f87171" rx="2" />
            <ellipse cx="270" cy="104" rx="10" ry="5" fill="#f87171" />
          </svg>
        </div>
        {/* Pay to Play Section */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs mb-8">
          <div className="w-full bg-blue-900/70 border border-blue-300/30 rounded-xl px-5 py-4 mb-2 text-center">
            <p className="text-blue-100 mb-3 text-base">Connect wallet and pay entry fee to play!</p>
            
            {!connected ? (
              <WalletManager showDisconnect={false} />
            ) : !paymentMade ? (
              <div className="space-y-3">
                <WalletManager />
                {hasInsufficientBalance ? (
                  <div className="text-red-400 text-sm mb-3">
                    Insufficient balance! You need at least {ENTRY_FEE} GOR to play.
                  </div>
                ) : (
                  <button
                    className={`w-full bg-yellow-300 hover:bg-yellow-200 text-blue-900 font-bold py-2 rounded-full transition-all duration-150 ${
                      payingEntryFee || isPayingFee ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handlePayFee}
                    disabled={payingEntryFee || isPayingFee}
                    type="button"
                  >
                    {payingEntryFee || isPayingFee ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `Pay Entry Fee (${ENTRY_FEE} GOR)`
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full bg-green-500 text-white font-bold py-2 rounded-full mb-2">
                ✅ Payment Complete!
              </div>
            )}
          </div>
          <TreasuryInfo />
          {/* Name input below headline, minimal style */}
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your snake name..."
              maxLength={20}
              className="w-full px-5 py-3 rounded-full bg-blue-900/70 border border-blue-300/30 text-white text-lg text-center focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent placeholder-blue-200"
              disabled={!canPlay}
            />
            <button
              type="submit"
              className={`w-full bg-yellow-300 hover:bg-yellow-200 text-blue-900 font-bold text-lg py-3 rounded-full transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 ${!canPlay ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canPlay}
            >
              <Play className="w-5 h-5 inline-block mr-2" />
              Start Playing
            </button>
            
            {/* Tournament Button */}
            {connected && onShowTournament && (
              <button
                type="button"
                onClick={onShowTournament}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg py-3 rounded-full transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                🏆 Join Live Tournament
              </button>
            )}
          </form>
        </div>
      </div>
      {/* Minimal custom style for nav shadow */}
      <style>{`
        body { background: linear-gradient(to bottom, #2563eb 0%, #000 100%) !important; }
      `}</style>
      <FaucetInfo />
    </div>
  );
}