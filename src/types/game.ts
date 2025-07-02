export interface Vector2D {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
  size: number;
}

export interface Snake {
  id: string;
  name: string;
  segments: SnakeSegment[];
  direction: number;
  speed: number;
  color: string;
  score: number;
  alive: boolean;
  boost: boolean;
  boostEnergy: number;
}

export interface Orb {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  value: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface GameState {
  snakes: Snake[];
  orbs: Orb[];
  particles: Particle[];
  camera: Vector2D;
  worldSize: number;
  playerId: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  rank: number;
}