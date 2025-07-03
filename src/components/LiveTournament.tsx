import { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Coins, Zap } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

interface Tournament {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  startTime: number;
  duration: number; // in minutes
  status: 'waiting' | 'starting' | 'active' | 'finished';
  winners?: string[];
}

interface LiveTournamentProps {
  onJoinTournament: (tournamentId: string) => void;
}

export default function LiveTournament({ onJoinTournament }: LiveTournamentProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { connected, balance } = useWeb3();

  // Mock live tournaments - in real implementation, this would come from WebSocket
  useEffect(() => {
    const mockTournaments: Tournament[] = [
      {
        id: 'speed-dash-1',
        name: '⚡ Speed Dash Championship',
        entryFee: 0.05,
        prizePool: 0.8,
        maxPlayers: 50,
        currentPlayers: 23,
        startTime: Date.now() + 120000, // 2 minutes
        duration: 10,
        status: 'waiting'
      },
      {
        id: 'mega-battle-1',
        name: '🏆 Mega Battle Royale',
        entryFee: 0.1,
        prizePool: 2.5,
        maxPlayers: 100,
        currentPlayers: 67,
        startTime: Date.now() + 300000, // 5 minutes
        duration: 15,
        status: 'waiting'
      },
      {
        id: 'quick-play-1',
        name: '🚀 Quick Play Arena',
        entryFee: 0.01,
        prizePool: 0.3,
        maxPlayers: 20,
        currentPlayers: 8,
        startTime: Date.now() + 60000, // 1 minute
        duration: 5,
        status: 'waiting'
      }
    ];
    setTournaments(mockTournaments);

    // Simulate live updates
    const interval = setInterval(() => {
      setTournaments(prev => prev.map(t => ({
        ...t,
        currentPlayers: Math.min(t.maxPlayers, t.currentPlayers + Math.floor(Math.random() * 3))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTimeUntilStart = (startTime: number) => {
    const diff = startTime - Date.now();
    if (diff <= 0) return 'Starting...';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleJoinTournament = (tournament: Tournament) => {
    if (!connected) return;
    if (balance === null || balance < tournament.entryFee) return;
    
    onJoinTournament(tournament.id);
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-4xl border border-purple-500/30">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Live Tournaments
          </h1>
          <p className="text-gray-300">Compete with players worldwide for real rewards!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all group cursor-pointer"
              onClick={() => handleJoinTournament(tournament)}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                <div className="flex items-center justify-center gap-2 text-purple-300">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{getTimeUntilStart(tournament.startTime)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    Entry Fee:
                  </span>
                  <span className="text-yellow-400 font-bold">{tournament.entryFee} GOR</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Prize Pool:
                  </span>
                  <span className="text-green-400 font-bold">{tournament.prizePool} GOR</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Players:
                  </span>
                  <span className="text-blue-400 font-bold">
                    {tournament.currentPlayers}/{tournament.maxPlayers}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Duration:
                  </span>
                  <span className="text-orange-400 font-bold">{tournament.duration} min</span>
                </div>

                {/* Progress bar for players */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                  />
                </div>
              </div>

              <button
                className={`w-full mt-4 py-3 rounded-lg font-bold transition-all ${
                  connected && balance !== null && balance >= tournament.entryFee
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white group-hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!connected || balance === null || balance < tournament.entryFee}
              >
                {!connected ? 'Connect Wallet' : 
                 balance === null ? 'Loading...' :
                 balance < tournament.entryFee ? 'Insufficient Balance' :
                 'Join Tournament'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-black/30 rounded-lg p-4 inline-block">
            <h3 className="text-lg font-bold text-white mb-2">🎯 How It Works</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Pay entry fee to join tournament</p>
              <p>• Compete with other players in real-time</p>
              <p>• Top 3 players split the prize pool (50%, 30%, 20%)</p>
              <p>• Instant payouts to winners</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
