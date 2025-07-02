import React from 'react';
import { RotateCcw, Trophy } from 'lucide-react';

interface DeathScreenProps {
  score: number;
  length: number;
  rank: number;
  onRestart: () => void;
}

export default function DeathScreen({ score, length, rank, onRestart }: DeathScreenProps) {
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
          <p className="text-gray-300">Your snake has been eliminated</p>
        </div>

        <div className="bg-white/5 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Final Score:</span>
            <span className="text-white font-bold text-xl">{score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Length:</span>
            <span className="text-white font-bold">{length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Rank:</span>
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              #{rank}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
      </div>
    </div>
  );
}