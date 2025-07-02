import React, { useState } from 'react';
import { Play, Gamepad2 } from 'lucide-react';

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim() || 'Anonymous Snake';
    onStart(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-full">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Slither<span className="text-purple-400">.io</span>
          </h1>
          <p className="text-gray-300">
            Grow your snake by eating orbs and become the biggest on the server!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
              Your Snake Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Playing
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <h3 className="font-semibold text-white mb-2">Controls:</h3>
              <p>• Mouse: Steer your snake</p>
              <p>• Click/Space: Boost speed</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Goal:</h3>
              <p>• Eat glowing orbs to grow</p>
              <p>• Avoid other snakes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}