import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Snake, Orb, Particle } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
  onMouseMove: (x: number, y: number) => void;
  onBoost: (boosting: boolean) => void;
  width: number;
  height: number;
}

export default function GameCanvas({ gameState, onMouseMove, onBoost, width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const isBoostingRef = useRef(false);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, camera: { x: number; y: number }) => {
    // Dark space background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    const offsetX = camera.x % gridSize;
    const offsetY = camera.y % gridSize;

    for (let x = -offsetX; x < width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = -offsetY; y < height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [width, height]);

  const drawSnake = useCallback((ctx: CanvasRenderingContext2D, snake: Snake, camera: { x: number; y: number }) => {
    if (!snake.alive) return;

    snake.segments.forEach((segment, index) => {
      const screenX = segment.x - camera.x + width / 2;
      const screenY = segment.y - camera.y + height / 2;

      if (screenX < -50 || screenX > width + 50 || screenY < -50 || screenY > height + 50) return;

      // Glow effect
      const glowSize = segment.size + 8;
      const glowGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowSize);
      glowGradient.addColorStop(0, snake.color + '40');
      glowGradient.addColorStop(1, snake.color + '00');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Main segment
      const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, segment.size);
      gradient.addColorStop(0, snake.color);
      gradient.addColorStop(0.7, snake.color + 'CC');
      gradient.addColorStop(1, snake.color + '88');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, segment.size, 0, Math.PI * 2);
      ctx.fill();

      // Head details
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        const eyeSize = 3;
        const eyeDistance = segment.size * 0.6;
        
        const eyeX1 = screenX + Math.cos(snake.direction - 0.5) * eyeDistance;
        const eyeY1 = screenY + Math.sin(snake.direction - 0.5) * eyeDistance;
        const eyeX2 = screenX + Math.cos(snake.direction + 0.5) * eyeDistance;
        const eyeY2 = screenY + Math.sin(snake.direction + 0.5) * eyeDistance;

        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Name label
    if (snake.segments.length > 0) {
      const head = snake.segments[0];
      const screenX = head.x - camera.x + width / 2;
      const screenY = head.y - camera.y + height / 2;

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(snake.name, screenX, screenY - head.size - 15);
    }
  }, [width, height]);

  const drawOrb = useCallback((ctx: CanvasRenderingContext2D, orb: Orb, camera: { x: number; y: number }) => {
    const screenX = orb.x - camera.x + width / 2;
    const screenY = orb.y - camera.y + height / 2;

    if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) return;

    // Glow effect
    const glowSize = orb.size + 6;
    const glowGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowSize);
    glowGradient.addColorStop(0, orb.color + '60');
    glowGradient.addColorStop(1, orb.color + '00');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Main orb
    const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, orb.size);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, orb.color);
    gradient.addColorStop(1, orb.color + 'AA');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, orb.size, 0, Math.PI * 2);
    ctx.fill();
  }, [width, height]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, camera: { x: number; y: number }) => {
    const screenX = particle.x - camera.x + width / 2;
    const screenY = particle.y - camera.y + height / 2;

    if (screenX < -10 || screenX > width + 10 || screenY < -10 || screenY > height + 10) return;

    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(screenX, screenY, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }, [width, height]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    drawBackground(ctx, gameState.camera);

    // Draw orbs
    gameState.orbs.forEach(orb => drawOrb(ctx, orb, gameState.camera));

    // Draw particles
    gameState.particles.forEach(particle => drawParticle(ctx, particle, gameState.camera));

    // Draw snakes
    gameState.snakes.forEach(snake => drawSnake(ctx, snake, gameState.camera));
  }, [gameState, drawBackground, drawOrb, drawParticle, drawSnake]);

  useEffect(() => {
    draw();
  }, [draw]);

  // FIXED: Improved mouse movement handling
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    mousePos.current = { x: mouseX, y: mouseY };

    // Calculate relative direction from center of screen
    const centerX = width / 2;
    const centerY = height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    // Only update direction if mouse moved significantly
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      onMouseMove(deltaX, deltaY);
    }
  }, [onMouseMove, width, height]);

  // FIXED: Mouse boost controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isBoostingRef.current = true;
    onBoost(true);
  }, [onBoost]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isBoostingRef.current = false;
    onBoost(false);
  }, [onBoost]);

  // FIXED: Keyboard controls with proper event handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default behavior for game controls
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!isBoostingRef.current) {
        isBoostingRef.current = true;
        onBoost(true);
      }
    }
  }, [onBoost]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      isBoostingRef.current = false;
      onBoost(false);
    }
  }, [onBoost]);

  // FIXED: Proper event listener setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Focus canvas to receive keyboard events
    canvas.focus();
    canvas.setAttribute('tabindex', '0');

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Prevent context menu on right click
    const handleContextMenu = (e: Event) => e.preventDefault();
    canvas.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleKeyDown, handleKeyUp]);

  // FIXED: Handle mouse leave to stop boosting
  const handleMouseLeave = useCallback(() => {
    if (isBoostingRef.current) {
      isBoostingRef.current = false;
      onBoost(false);
    }
  }, [onBoost]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="cursor-none bg-black focus:outline-none"
      style={{ touchAction: 'none' }}
      tabIndex={0}
    />
  );
}