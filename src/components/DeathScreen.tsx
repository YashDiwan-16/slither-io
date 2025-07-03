import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import EnhancedRewardSystem from './EnhancedRewardSystem';

interface DeathScreenProps {
  score: number;
  length: number;
  rank: number;
  totalPlayers?: number;
  gameLength?: number;
  playerId: string;
  playerName: string;
  gameId: string;
  onRestart: () => void;
}

export default function DeathScreen({ 
  score, 
  length, 
  rank, 
  totalPlayers = 10,
  gameLength = 60,
  playerId,
  playerName,
  gameId,
  onRestart 
}: DeathScreenProps) {
  const [showRewards, setShowRewards] = useState(true);

  const handleRewardClaimed = () => {
    toast.success('🎉 Reward claimed successfully!', {
      description: 'SOL has been transferred to your wallet',
      duration: 4000,
    });
    setShowRewards(false);
  };

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 z-50">
      <div className="bg-black/85 backdrop-blur-lg rounded-lg p-2 w-full max-w-[280px] border border-white/20 text-center">
        <div className="mb-2">
          <div className="text-2xl mb-1">💀</div>
          <h2 className="text-base font-bold text-white mb-0.5">Game Over!</h2>
          <p className="text-gray-400 text-xs">Snake eliminated</p>
        </div>

        <div className="mb-2 space-y-0.5 bg-white/5 rounded p-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Score</span>
            <span className="text-white font-semibold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Length</span>
            <span className="text-white font-semibold">{length}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Rank</span>
            <span className="text-yellow-400 font-semibold">#{rank}/{totalPlayers}</span>
          </div>
        </div>

        {showRewards && (
          <div className="mb-2">
            <EnhancedRewardSystem
              playerId={playerId}
              playerName={playerName}
              score={score}
              rank={rank}
              totalPlayers={totalPlayers}
              gameLength={gameLength}
              gameId={gameId}
              onRewardClaimed={handleRewardClaimed}
            />
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-1.5 px-3 rounded text-xs transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={12} />
          Play Again
        </button>
      </div>
    </div>
  );
}