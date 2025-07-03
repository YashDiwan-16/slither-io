import { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import MiniMap from './components/MiniMap';
import GameUI from './components/GameUI';
import StartScreen from './components/StartScreen';
import DeathScreen from './components/DeathScreen';
import WalletStatus from './components/WalletStatus';
import LiveTournament from './components/LiveTournament';
import { useGameLoop } from './hooks/useGameLoop';
import { GameState, Snake, Player, Orb } from './types/game';
import {
  createSnake,
  createOrb,
  updateSnakeMovement,
  checkSnakeOrbCollision,
  checkSnakeCollisions,
  createParticles,
  updateParticles,
  WORLD_SIZE
} from './utils/gameUtils';

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

function App() {
  const [gameState, setGameState] = useState<GameState>({
    snakes: [],
    orbs: [],
    particles: [],
    camera: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 },
    worldSize: WORLD_SIZE,
    playerId: ''
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [showTournament, setShowTournament] = useState(false);
  const [currentTournamentId, setCurrentTournamentId] = useState<string | null>(null);
  const [deathStats, setDeathStats] = useState({ 
    score: 0, 
    length: 0, 
    rank: 1, 
    gameStartTime: 0,
    gameLength: 0
  });
  const [players, setPlayers] = useState<Player[]>([]);

  // FIXED: Better mouse direction tracking
  const mouseDirection = useRef({ x: 0, y: 0, angle: 0 });
  const boosting = useRef(false);
  const gameStartTime = useRef(0);

  // Initialize game
  const initializeGame = useCallback((playerName: string) => {
    const playerId = Math.random().toString(36).substr(2, 9);
    const startX = WORLD_SIZE / 2 + (Math.random() - 0.5) * 500;
    const startY = WORLD_SIZE / 2 + (Math.random() - 0.5) * 500;
    
    const playerSnake = createSnake(playerId, playerName, startX, startY);
    
    // Create AI snakes
    const aiSnakes: Snake[] = [];
    for (let i = 0; i < 8; i++) {
      const aiX = Math.random() * WORLD_SIZE;
      const aiY = Math.random() * WORLD_SIZE;
      const aiSnake = createSnake(
        `ai_${i}`,
        `Bot ${i + 1}`,
        aiX,
        aiY
      );
      // Give AI snakes some initial score
      aiSnake.score = Math.floor(Math.random() * 50) + 10;
      aiSnakes.push(aiSnake);
    }

    // Create orbs
    const orbs = [];
    for (let i = 0; i < 300; i++) {
      orbs.push(createOrb());
    }

    setGameState({
      snakes: [playerSnake, ...aiSnakes],
      orbs,
      particles: [],
      camera: { x: startX, y: startY },
      worldSize: WORLD_SIZE,
      playerId
    });

    setGameStarted(true);
    setShowDeathScreen(false);
    gameStartTime.current = Date.now();
  }, []);

  // FIXED: Improved mouse movement handling
  const handleMouseMove = useCallback((deltaX: number, deltaY: number) => {
    // Calculate angle from center to mouse position
    const angle = Math.atan2(deltaY, deltaX);
    mouseDirection.current = { 
      x: deltaX, 
      y: deltaY, 
      angle: angle 
    };
  }, []);

  // FIXED: Better boost handling
  const handleBoost = useCallback((isBoosting: boolean) => {
    boosting.current = isBoosting;
  }, []);

  // Game loop
  const gameLoop = useCallback((deltaTime: number) => {
    if (!gameStarted || showDeathScreen) return;

    setGameState(prevState => {
      const newState = { ...prevState };

      // Update player snake
      const playerSnake = newState.snakes.find(s => s.id === newState.playerId);
      if (playerSnake && playerSnake.alive) {
        // FIXED: Use calculated angle for smoother movement
        if (mouseDirection.current.x !== 0 || mouseDirection.current.y !== 0) {
          updateSnakeMovement(playerSnake, mouseDirection.current.angle, deltaTime);
        }
        
        playerSnake.boost = boosting.current && playerSnake.boostEnergy > 0;

        // Update camera to follow player smoothly
        const head = playerSnake.segments[0];
        const lerpFactor = Math.min(deltaTime * 5, 1); // Smooth camera following
        newState.camera.x += (head.x - newState.camera.x) * lerpFactor;
        newState.camera.y += (head.y - newState.camera.y) * lerpFactor;
      }

      // Update AI snakes with improved movement
      newState.snakes.forEach(snake => {
        if (snake.id !== newState.playerId && snake.alive) {
          const head = snake.segments[0];
          let targetDirection = snake.direction + (Math.random() - 0.5) * 0.3;

          // Find nearest orb with better AI logic
          let nearestOrb: Orb | null = null;
          let nearestDistance = Infinity;
          for (const orb of newState.orbs) {
            const distance = Math.sqrt((orb.x - head.x) ** 2 + (orb.y - head.y) ** 2);
            if (distance < nearestDistance && distance < 150) {
              nearestDistance = distance;
              nearestOrb = orb;
            }
          }

          if (nearestOrb) {
            targetDirection = Math.atan2(nearestOrb.y - head.y, nearestOrb.x - head.x);
          }

          // Avoid other snakes
          newState.snakes.forEach(otherSnake => {
            if (otherSnake.id === snake.id || !otherSnake.alive) return;
            
            otherSnake.segments.forEach(segment => {
              const distance = Math.sqrt((segment.x - head.x) ** 2 + (segment.y - head.y) ** 2);
              if (distance < 80) {
                const avoidAngle = Math.atan2(head.y - segment.y, head.x - segment.x);
                targetDirection = avoidAngle;
              }
            });
          });

          updateSnakeMovement(snake, targetDirection, deltaTime);
          
          // AI boost logic
          snake.boost = Math.random() < 0.1 && snake.boostEnergy > 50;
        }
      });

      // Check orb collisions
      newState.snakes.forEach(snake => {
        if (!snake.alive) return;
        
        const collectedOrbs = checkSnakeOrbCollision(snake, newState.orbs);
        collectedOrbs.forEach(orb => {
          // Remove collected orb
          const orbIndex = newState.orbs.findIndex(o => o.id === orb.id);
          if (orbIndex !== -1) {
            newState.orbs.splice(orbIndex, 1);
            
            // Create new orb elsewhere
            newState.orbs.push(createOrb());

            // Create particles
            newState.particles.push(...createParticles(orb.x, orb.y, orb.color));
          }
        });
      });

      // Check snake collisions
      const deadSnakes = checkSnakeCollisions(newState.snakes);
      deadSnakes.forEach(snake => {
        // Create orbs from dead snake
        snake.segments.forEach((segment, index) => {
          if (index % 2 === 0) { // Only create orbs for every other segment
            newState.orbs.push(createOrb(segment.x, segment.y));
          }
          // Create death particles
          newState.particles.push(...createParticles(segment.x, segment.y, snake.color, 3));
        });

        // Check if player died
        if (snake.id === newState.playerId) {
          const rank = newState.snakes.filter(s => s.alive && s.score > snake.score).length + 1;
          const gameLength = (Date.now() - gameStartTime.current) / 1000;
          setDeathStats({
            score: snake.score,
            length: snake.segments.length,
            rank,
            gameStartTime: gameStartTime.current,
            gameLength
          });
          setShowDeathScreen(true);
        }
      });

      // Update particles
      updateParticles(newState.particles, deltaTime);
      newState.particles = newState.particles.filter(p => p.life > 0);

      // Update leaderboard
      const playerList: Player[] = newState.snakes
        .filter(s => s.alive)
        .map(s => ({
          id: s.id,
          name: s.name,
          score: s.score,
          rank: 0
        }))
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({ ...p, rank: index + 1 }));

      setPlayers(playerList);

      return newState;
    });
  }, [gameStarted, showDeathScreen]);

  useGameLoop(gameLoop, gameStarted && !showDeathScreen);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render on resize
      setGameState(prev => ({ ...prev }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRestart = useCallback(() => {
    setShowDeathScreen(false);
    setGameStarted(false);
    // Reset mouse direction
    mouseDirection.current = { x: 0, y: 0, angle: 0 };
    boosting.current = false;
    gameStartTime.current = 0;
  }, []);

  // Tournament handler
  const handleJoinTournament = useCallback((tournamentId: string) => {
    setCurrentTournamentId(tournamentId);
    setShowTournament(false);
    // Start game in tournament mode
    initializeGame('Tournament Player');
  }, [initializeGame]);

  const currentPlayer = gameState.snakes.find(s => s.id === gameState.playerId);

  // Show tournament screen
  if (showTournament) {
    return <LiveTournament onJoinTournament={handleJoinTournament} />;
  }

  if (!gameStarted) {
    return <StartScreen onStart={initializeGame} onShowTournament={() => setShowTournament(true)} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <GameCanvas
        gameState={gameState}
        onMouseMove={handleMouseMove}
        onBoost={handleBoost}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      
      <GameUI
        playerSnake={currentPlayer || null}
        onShowChat={() => {}}
        onShowSettings={() => {}}
      />
      
      <Leaderboard players={players} currentPlayerId={gameState.playerId} />
      <MiniMap gameState={gameState} />
      <WalletStatus />

      {showDeathScreen && (
        <DeathScreen
          score={deathStats.score}
          length={deathStats.length}
          rank={deathStats.rank}
          totalPlayers={players.length}
          gameLength={deathStats.gameLength}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;