import { useState } from 'react';
import { RotateCcw, Trophy, Target, Users, Clock } from 'lucide-react';
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
  onRestart,
}: DeathScreenProps) {
  const [showRewards, setShowRewards] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto mx-2 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 flex flex-col items-center text-center" style={{minWidth: '320px'}}>
        {/* Game Over Icon & Title */}
        <div className="flex flex-col items-center mb-4">
          <div className="text-5xl mb-2 select-none" aria-label="Game Over">💀</div>
          <h2 className="text-2xl font-extrabold text-white mb-1 tracking-wide">Game Over</h2>
          <p className="text-gray-300 text-xs">Better luck next time!</p>
        </div>

        {/* Stats */}
        <div className="w-full flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2">
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Target className="w-4 h-4" />Score</span>
            <span className="text-white font-semibold text-sm">{score}</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2">
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Users className="w-4 h-4" />Length</span>
            <span className="text-white font-semibold text-sm">{length}</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2">
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Trophy className="w-4 h-4" />Rank</span>
            <span className="text-yellow-400 font-semibold text-sm">#{rank} / {totalPlayers}</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2">
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Clock className="w-4 h-4" />Time</span>
            <span className="text-white font-semibold text-sm">{Math.floor(gameLength)}s</span>
          </div>
        </div>

        {/* Reward System */}
        {showRewards && (
          <div className="w-full mb-4">
            <EnhancedRewardSystem
              score={score}
              rank={rank}
              totalPlayers={totalPlayers}
              gameLength={gameLength}
              playerId={playerId}
              playerName={playerName}
              gameId={gameId}
              onRewardClaimed={() => setShowRewards(false)}
            />
          </div>
        )}

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
      </div>
    </div>
  );
}
