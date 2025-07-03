import { useState, useContext } from 'react';
import { Settings, X, Wallet, Volume2, VolumeX, Info } from 'lucide-react';
import WalletManager from './WalletManager';
import { MusicContext } from '../providers/MusicProvider';

interface GameSettingsProps {
  onClose: () => void;
  difficulty: 'easy' | 'hard';
  setDifficulty: (d: 'easy' | 'hard') => void;
}

export default function GameSettings({ onClose, difficulty, setDifficulty }: GameSettingsProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'audio' | 'about'>('wallet');
  const music = useContext(MusicContext);

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'wallet'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Wallet className="w-4 h-4 inline-block mr-1" />
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'audio'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-4 h-4 inline-block mr-1" />
            Audio
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Info className="w-4 h-4 inline-block mr-1" />
            About
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'wallet' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Wallet Management</h3>
              <WalletManager />
            </div>
          )}

          {activeTab === 'audio' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Audio Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sound Effects</span>
                  <button className="flex items-center gap-2 text-green-400" disabled>
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">On</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Background Music</span>
                  <button
                    className={`flex items-center gap-2 ${music.playing ? 'text-green-400' : 'text-red-400'}`}
                    onClick={music.toggle}
                  >
                    {music.playing ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span className="text-sm">{music.playing ? 'On' : 'Off'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-300">Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={music.volume}
                    onChange={e => music.setVolume(Number(e.target.value))}
                    className="w-32 accent-blue-500"
                  />
                  <span className="text-gray-300 text-xs">{Math.round(music.volume * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h3 className="text-white font-semibold mb-3">About Slither.io</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  A blockchain-powered snake game built on the Gorbagana network.
                </p>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white font-medium mb-1">Game Features:</div>
                  <ul className="text-xs space-y-1">
                    <li>• Pay-to-play with GOR tokens</li>
                    <li>• Performance-based rewards</li>
                    <li>• Decentralized treasury</li>
                    <li>• Real-time multiplayer (AI bots)</li>
                  </ul>
                </div>
                <div className="text-xs text-blue-300">
                  Built with React, TypeScript, and Solana Web3.js
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Game Difficulty</h3>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg font-bold transition-all duration-150 ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setDifficulty('easy')}
                  >
                    Easy
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-bold transition-all duration-150 ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setDifficulty('hard')}
                  >
                    Hard
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Easy: Bots are slower, make mistakes, and boost less. Hard: Bots are more challenging.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-150"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
