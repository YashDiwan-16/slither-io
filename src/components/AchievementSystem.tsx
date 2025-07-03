import { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Crown } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementSystemProps {
  score: number;
  rank: number;
  gameLength: number;
  gamesPlayed: number;
}

export default function AchievementSystem({ score, rank, gameLength, gamesPlayed }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

  useEffect(() => {
    const createAchievements = (): Achievement[] => [
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Win your first game',
        icon: <Crown className="w-5 h-5" />,
        unlocked: rank === 1,
        progress: rank === 1 ? 1 : 0,
        maxProgress: 1,
        reward: 0.005,
        rarity: 'common'
      },
      {
        id: 'score_hunter',
        name: 'Score Hunter',
        description: 'Reach 100 points in a single game',
        icon: <Target className="w-5 h-5" />,
        unlocked: score >= 100,
        progress: Math.min(score, 100),
        maxProgress: 100,
        reward: 0.003,
        rarity: 'common'
      },
      {
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive for 3 minutes',
        icon: <Zap className="w-5 h-5" />,
        unlocked: gameLength >= 180,
        progress: Math.min(gameLength, 180),
        maxProgress: 180,
        reward: 0.002,
        rarity: 'rare'
      },
      {
        id: 'champion',
        name: 'Champion',
        description: 'Win 5 games',
        icon: <Trophy className="w-5 h-5" />,
        unlocked: false, // Would need persistent storage
        progress: 0,
        maxProgress: 5,
        reward: 0.01,
        rarity: 'epic'
      },
      {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Reach 500 points in a single game',
        icon: <Star className="w-5 h-5" />,
        unlocked: score >= 500,
        progress: Math.min(score, 500),
        maxProgress: 500,
        reward: 0.008,
        rarity: 'legendary'
      }
    ];

    const newAchievements = createAchievements();
    
    // Only check for new unlocks if we have existing achievements to compare
    setAchievements(prevAchievements => {
      const newlyUnlocked = newAchievements.filter(achievement => 
        achievement.unlocked && 
        !prevAchievements.find(prev => prev.id === achievement.id && prev.unlocked)
      );
      
      if (newlyUnlocked.length > 0 && prevAchievements.length > 0) {
        setNewUnlocks(newlyUnlocked);
        // Auto-hide after 5 seconds
        setTimeout(() => setNewUnlocks([]), 5000);
      }
      
      return newAchievements;
    });
  }, [score, rank, gameLength, gamesPlayed]); // Remove 'achievements' from dependencies

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 text-gray-300';
      case 'rare': return 'border-blue-400 text-blue-300';
      case 'epic': return 'border-purple-400 text-purple-300';
      case 'legendary': return 'border-yellow-400 text-yellow-300';
      default: return 'border-gray-400 text-gray-300';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20';
      case 'rare': return 'bg-blue-500/20';
      case 'epic': return 'bg-purple-500/20';
      case 'legendary': return 'bg-yellow-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <>
      {/* Achievement Notifications */}
      {newUnlocks.length > 0 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          {newUnlocks.map((achievement) => (
            <div
              key={achievement.id}
              className={`${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)} border-2 rounded-xl p-6 mb-4 backdrop-blur-lg animate-pulse`}
            >
              <div className="text-center">
                <div className="mb-3">{achievement.icon}</div>
                <h3 className="text-xl font-bold mb-2">Achievement Unlocked!</h3>
                <div className="text-lg font-semibold mb-1">{achievement.name}</div>
                <div className="text-sm opacity-80 mb-3">{achievement.description}</div>
                <div className="text-yellow-400 font-bold">
                  +{achievement.reward.toFixed(3)} GOR Bonus!
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievement Panel Toggle */}
      <button
        onClick={() => setShowAchievements(!showAchievements)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-3 rounded-full transition-all duration-200 z-40"
      >
        <Trophy className="w-5 h-5" />
      </button>

      {/* Achievement Panel */}
      {showAchievements && (
        <div className="fixed bottom-16 right-4 z-40">
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg rounded-xl p-6 border border-yellow-300/20 w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Achievements
              </h3>
              <button
                onClick={() => setShowAchievements(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`${getRarityBg(achievement.rarity)} ${
                    achievement.unlocked ? getRarityColor(achievement.rarity) : 'border-gray-600 text-gray-400'
                  } border rounded-lg p-3 ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{achievement.name}</div>
                      <div className="text-sm opacity-80 mb-2">{achievement.description}</div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.unlocked ? 'bg-green-400' : 'bg-blue-400'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                        <span className="text-yellow-400">+{achievement.reward.toFixed(3)} GOR</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="text-center text-sm text-gray-400">
                {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
