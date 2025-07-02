import React from 'react';
import { GameState } from '../types/game';
import { WORLD_SIZE } from '../utils/gameUtils';

interface MiniMapProps {
  gameState: GameState;
}

export default function MiniMap({ gameState }: MiniMapProps) {
  const mapSize = 150;
  const scale = mapSize / WORLD_SIZE;

  return (
    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
      <div 
        className="relative bg-gray-900 rounded border border-gray-700"
        style={{ width: mapSize, height: mapSize }}
      >
        {/* Player snake */}
        {gameState.snakes.map(snake => {
          if (!snake.alive || !snake.segments.length) return null;
          
          const head = snake.segments[0];
          const x = head.x * scale;
          const y = head.y * scale;
          
          const isPlayer = snake.id === gameState.playerId;
          
          return (
            <div
              key={snake.id}
              className={`absolute w-2 h-2 rounded-full ${
                isPlayer ? 'bg-blue-400' : 'bg-red-400'
              }`}
              style={{
                left: Math.max(0, Math.min(mapSize - 8, x - 4)),
                top: Math.max(0, Math.min(mapSize - 8, y - 4))
              }}
            />
          );
        })}

        {/* Camera viewport indicator */}
        <div
          className="absolute border border-white/30 pointer-events-none"
          style={{
            left: Math.max(0, Math.min(mapSize - 30, gameState.camera.x * scale - 15)),
            top: Math.max(0, Math.min(mapSize - 30, gameState.camera.y * scale - 15)),
            width: 30,
            height: 30
          }}
        />
      </div>
      <div className="text-white text-xs mt-2 text-center opacity-70">Mini Map</div>
    </div>
  );
}