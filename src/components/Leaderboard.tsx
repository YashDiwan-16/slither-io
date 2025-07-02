import React from 'react';
import { Crown, Trophy, Medal } from 'lucide-react';
import { Player } from '../types/game';

interface LeaderboardProps {
  players: Player[];
  currentPlayerId: string;
}

export default function Leaderboard({ players, currentPlayerId }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const topPlayers = sortedPlayers.slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <Trophy className="w-4 h-4 text-gray-300" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-400">#{rank}</span>;
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 w-64 border border-white/10">
      <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        Leaderboard
      </h3>
      <div className="space-y-2">
        {topPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
              player.id === currentPlayerId
                ? 'bg-blue-500/30 border border-blue-400/50'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center w-6">
              {getRankIcon(index + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="text-blue-400 ml-1">(You)</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{player.score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}