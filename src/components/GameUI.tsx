import React from 'react';
import { Zap, MessageCircle, Settings } from 'lucide-react';
import { Snake } from '../types/game';

interface GameUIProps {
  playerSnake: Snake | null;
  onShowChat: () => void;
  onShowSettings: () => void;
}

export default function GameUI({ playerSnake, onShowChat, onShowSettings }: GameUIProps) {
  if (!playerSnake) return null;

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-4">
        {/* Score */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
          <div className="text-white font-bold text-xl">
            Score: {playerSnake.score}
          </div>
          <div className="text-gray-300 text-sm">
            Length: {playerSnake.segments.length}
          </div>
        </div>

        {/* Boost Energy */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Boost</span>
          </div>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                playerSnake.boostEnergy > 30 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${playerSnake.boostEnergy}%` }}
            />
          </div>
          <div className="text-gray-300 text-xs mt-1">
            {Math.round(playerSnake.boostEnergy)}%
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={onShowChat}
          className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-white hover:bg-white/10 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button
          onClick={onShowSettings}
          className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-white hover:bg-white/10 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Controls help */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
        <div className="text-white text-sm text-center">
          <span className="font-medium">Mouse:</span> Steer • <span className="font-medium">Click/Space:</span> Boost
        </div>
      </div>
    </>
  );
}