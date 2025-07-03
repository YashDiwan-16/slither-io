import { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Clock, Target, Users, Sparkles, Crown, Medal, Award } from 'lucide-react';
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
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    // Staggered animation entrance
    const timeouts = [
      setTimeout(() => setAnimationStage(1), 100),
      setTimeout(() => setAnimationStage(2), 300),
      setTimeout(() => setAnimationStage(3), 500),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const getRankData = () => {
    if (rank === 1) return { 
      icon: <Crown className="w-12 h-12 text-yellow-400" />, 
      title: "VICTORY!", 
      subtitle: "Champion Snake!",
      bgGradient: "from-yellow-500/20 via-orange-500/20 to-red-500/20",
      borderColor: "border-yellow-400/50",
      emoji: "👑"
    };
    if (rank === 2) return { 
      icon: <Medal className="w-12 h-12 text-gray-300" />, 
      title: "EXCELLENT!", 
      subtitle: "Silver Serpent!",
      bgGradient: "from-gray-400/20 via-gray-500/20 to-gray-600/20",
      borderColor: "border-gray-400/50",
      emoji: "🥈"
    };
    if (rank === 3) return { 
      icon: <Award className="w-12 h-12 text-amber-600" />, 
      title: "GREAT JOB!", 
      subtitle: "Bronze Beast!",
      bgGradient: "from-amber-600/20 via-amber-700/20 to-amber-800/20",
      borderColor: "border-amber-600/50",
      emoji: "🥉"
    };
    if (rank <= 10) return { 
      icon: <Trophy className="w-12 h-12 text-blue-400" />, 
      title: "WELL PLAYED!", 
      subtitle: "Top 10 Finisher!",
      bgGradient: "from-blue-500/20 via-purple-500/20 to-indigo-500/20",
      borderColor: "border-blue-400/50",
      emoji: "🏆"
    };
    return { 
      icon: <Target className="w-12 h-12 text-green-400" />, 
      title: "GOOD EFFORT!", 
      subtitle: "Keep Slithering!",
      bgGradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
      borderColor: "border-green-400/50",
      emoji: "🎯"
    };
  };

  const rankData = getRankData();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceStats = () => {
    const survivalRate = Math.min((gameLength / 180) * 100, 100); // Max 3 minutes
    const rankPercentile = ((totalPlayers - rank + 1) / totalPlayers) * 100;
    
    return { survivalRate, rankPercentile };
  };

  const { survivalRate, rankPercentile } = getPerformanceStats();

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-white/20" />
          </div>
        ))}
      </div>

      <div className={`relative bg-gradient-to-br ${rankData.bgGradient} backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg border-2 ${rankData.borderColor} shadow-2xl transform transition-all duration-1000 ${animationStage >= 1 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Header Section */}
        <div className={`text-center mb-8 transform transition-all duration-700 delay-200 ${animationStage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"></div>
            <div className="text-8xl mb-2 animate-bounce">{rankData.emoji}</div>
          </div>
          
          <h2 className="text-4xl font-black text-white mb-2 tracking-wider">
            {rankData.title}
          </h2>
          <p className="text-xl text-gray-200 font-semibold">{rankData.subtitle}</p>
          
          {/* Rank Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-black/30 rounded-full border border-white/20">
            {rankData.icon}
            <span className="text-2xl font-bold text-white">
              #{rank} of {totalPlayers}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-3 gap-4 mb-8 transform transition-all duration-700 delay-400 ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-xs text-gray-300">Score</div>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
            <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(gameLength)}</div>
            <div className="text-xs text-gray-300">Survived</div>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{length}</div>
            <div className="text-xs text-gray-300">Length</div>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="mb-8 space-y-3">
          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Ranking Percentile</span>
              <span>{rankPercentile.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000 delay-500"
                style={{ width: `${rankPercentile}%` }}
              />
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Survival Rate</span>
              <span>{survivalRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000 delay-700"
                style={{ width: `${survivalRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        {showRewards ? (
          <div className="mb-6">
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
        ) : (
          <div className="bg-gradient-to-r from-black/30 to-black/20 rounded-2xl p-6 mb-6 border border-white/10">
            <div className="text-center">
              <div className="text-green-400 text-lg font-semibold mb-2">✅ Rewards Processed</div>
              <div className="text-gray-300 text-sm">Thank you for playing!</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 border border-white/20"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="text-lg">Play Again</span>
        </button>

        {/* Quick Stats Footer */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-400">
            Game ID: {gameId.slice(-8).toUpperCase()} • Player: {playerName}
          </div>
        </div>
      </div>
    </div>
  );
}
