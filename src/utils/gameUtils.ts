import { Vector2D, Snake, Orb, SnakeSegment, Particle } from '../types/game';

export const WORLD_SIZE = 4000;
export const MIN_SEGMENT_SIZE = 8;
export const MAX_SEGMENT_SIZE = 20;
// FIXED: Increased speed values for better gameplay
export const BOOST_SPEED_MULTIPLIER = 2.0; // Increased from 1.5
export const BASE_SPEED = 120; // Increased from 2.5 (pixels per second)
export const TURN_SPEED = 3.5; // Increased from 0.08 (radians per second)

export function distance(a: Vector2D, b: Vector2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function lerpAngle(from: number, to: number, t: number): number {
  const diff = normalizeAngle(to - from);
  return from + diff * t;
}

export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7DBDD'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function createSnake(id: string, name: string, x: number, y: number): Snake {
  const segments: SnakeSegment[] = [];
  const color = generateRandomColor();
  
  // Create initial segments
  for (let i = 0; i < 5; i++) {
    segments.push({
      x: x - i * 12,
      y: y,
      size: MIN_SEGMENT_SIZE + (4 - i) * 2
    });
  }

  return {
    id,
    name,
    segments,
    direction: 0,
    speed: BASE_SPEED,
    color,
    score: 0,
    alive: true,
    boost: false,
    boostEnergy: 100
  };
}

export function createOrb(x?: number, y?: number): Orb {
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: x ?? Math.random() * WORLD_SIZE,
    y: y ?? Math.random() * WORLD_SIZE,
    size: 3 + Math.random() * 5,
    color: generateRandomColor(),
    value: 1
  };
}

// FIXED: Improved movement system with better responsiveness
export function updateSnakeMovement(snake: Snake, targetDirection: number, deltaTime: number): void {
  if (!snake.alive) return;

  // FIXED: More responsive direction changes
  const angleDiff = normalizeAngle(targetDirection - snake.direction);
  const maxTurnRate = TURN_SPEED * deltaTime;
  
  if (Math.abs(angleDiff) > maxTurnRate) {
    snake.direction = normalizeAngle(
      snake.direction + Math.sign(angleDiff) * maxTurnRate
    );
  } else {
    snake.direction = targetDirection;
  }

  // FIXED: Improved speed calculation
  const currentSpeed = snake.boost ? snake.speed * BOOST_SPEED_MULTIPLIER : snake.speed;
  const moveDistance = currentSpeed * deltaTime;
  
  // Move head
  const head = snake.segments[0];
  head.x += Math.cos(snake.direction) * moveDistance;
  head.y += Math.sin(snake.direction) * moveDistance;

  // Keep within world bounds
  head.x = Math.max(20, Math.min(WORLD_SIZE - 20, head.x));
  head.y = Math.max(20, Math.min(WORLD_SIZE - 20, head.y));

  // FIXED: Better segment following with smoother movement
  for (let i = 1; i < snake.segments.length; i++) {
    const current = snake.segments[i];
    const target = snake.segments[i - 1];
    const dist = distance(current, target);
    const desiredDistance = 12;

    if (dist > desiredDistance) {
      const angle = Math.atan2(target.y - current.y, target.x - current.x);
      const moveAmount = Math.min(dist - desiredDistance, moveDistance);
      current.x += Math.cos(angle) * moveAmount;
      current.y += Math.sin(angle) * moveAmount;
    }
  }

  // FIXED: Improved boost energy management
  if (snake.boost && snake.boostEnergy > 0) {
    snake.boostEnergy -= 50 * deltaTime; // Faster energy consumption
    if (snake.boostEnergy <= 0) {
      snake.boost = false;
      snake.boostEnergy = 0;
    }
  } else if (!snake.boost && snake.boostEnergy < 100) {
    snake.boostEnergy += 25 * deltaTime; // Faster energy regeneration
    snake.boostEnergy = Math.min(100, snake.boostEnergy);
  }
}

export function checkSnakeOrbCollision(snake: Snake, orbs: Orb[]): Orb[] {
  const collectedOrbs: Orb[] = [];
  const head = snake.segments[0];

  orbs.forEach(orb => {
    if (distance(head, orb) < head.size + orb.size) {
      collectedOrbs.push(orb);
      
      // Grow snake
      const tail = snake.segments[snake.segments.length - 1];
      const newSegment: SnakeSegment = {
        x: tail.x,
        y: tail.y,
        size: MIN_SEGMENT_SIZE
      };
      snake.segments.push(newSegment);
      
      // Increase score and head size
      snake.score += orb.value;
      if (head.size < MAX_SEGMENT_SIZE) {
        head.size += 0.2;
      }
    }
  });

  return collectedOrbs;
}

export function checkSnakeCollisions(snakes: Snake[]): Snake[] {
  const deadSnakes: Snake[] = [];

  snakes.forEach(snake => {
    if (!snake.alive) return;

    const head = snake.segments[0];

    // Check collision with other snakes
    snakes.forEach(otherSnake => {
      if (snake.id === otherSnake.id || !otherSnake.alive) return;

      // Skip head-to-head collisions for the larger snake
      otherSnake.segments.forEach((segment, index) => {
        if (index === 0 && head.size > segment.size) return;

        if (distance(head, segment) < head.size + segment.size - 5) {
          snake.alive = false;
          deadSnakes.push(snake);
        }
      });
    });
  });

  return deadSnakes;
}

export function createParticles(x: number, y: number, color: string, count: number = 5): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100,
      life: 1,
      maxLife: 1,
      size: 2 + Math.random() * 4,
      color
    });
  }
  
  return particles;
}

export function updateParticles(particles: Particle[], deltaTime: number): void {
  particles.forEach(particle => {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.life -= deltaTime;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
  });
}