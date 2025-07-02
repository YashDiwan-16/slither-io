import React, { useState } from 'react';
import { Play } from 'lucide-react';

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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-black overflow-hidden">
      {/* Floating top nav bar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex gap-6 bg-blue-800/80 rounded-full px-8 py-3 shadow-lg backdrop-blur-md border border-blue-300/30">
        <a href="#game" className="text-white font-semibold hover:text-yellow-300 transition">Game</a>
        <a href="#leaderboard" className="text-white font-semibold hover:text-yellow-300 transition">Leaderboard</a>
        <a href="#connect" className="text-white font-semibold hover:text-yellow-300 transition">Connect</a>
        <a href="#about" className="text-white font-semibold hover:text-yellow-300 transition">About</a>
      </nav>
      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full pt-32 pb-16">
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white text-center mb-4 tracking-tight" style={{textShadow: '0 4px 32px #0008'}}>Play Slither<span className="text-yellow-300">.io</span> Online</h1>
        <p className="text-xl md:text-2xl text-blue-100 text-center mb-10">Eat orbs. Grow your snake. Outsmart everyone.</p>
        {/* Hero visual: stylized snake SVG */}
        <div className="mb-12">
          <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M270 60 Q220 120 260 180 Q300 220 160 200 Q60 180 80 120 Q100 60 180 60 Q260 60 270 60" stroke="#ffe066" strokeWidth="18" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <ellipse cx="270" cy="60" rx="32" ry="32" fill="#ffe066" stroke="#fff" strokeWidth="6" />
            {/* Eyes */}
            <ellipse cx="260" cy="58" rx="7" ry="10" fill="#fff" />
            <ellipse cx="280" cy="62" rx="7" ry="10" fill="#fff" />
            <ellipse cx="260" cy="58" rx="3.5" ry="4" fill="#222" />
            <ellipse cx="280" cy="62" rx="3.5" ry="4" fill="#222" />
            {/* Tongue */}
            <rect x="268" y="90" width="4" height="18" fill="#f87171" rx="2" />
            <ellipse cx="270" cy="104" rx="10" ry="5" fill="#f87171" />
          </svg>
        </div>
        {/* Name input below headline, minimal style */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs mb-8">
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your snake name..."
            maxLength={20}
            className="w-full px-5 py-3 rounded-full bg-blue-900/70 border border-blue-300/30 text-white text-lg text-center focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent placeholder-blue-200"
          />
          <button
            type="submit"
            className="w-full bg-yellow-300 hover:bg-yellow-200 text-blue-900 font-bold text-lg py-3 rounded-full transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <Play className="w-5 h-5 inline-block mr-2" />
            Start Playing
          </button>
        </form>
      </div>
      {/* Minimal custom style for nav shadow */}
      <style>{`
        body { background: linear-gradient(to bottom, #2563eb 0%, #000 100%) !important; }
      `}</style>
    </div>
  );
}