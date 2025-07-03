import WebSocket from 'ws';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';

interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  x: number;
  y: number;
  direction: number;
  score: number;
  alive: boolean;
  tournamentId: string;
}

interface Tournament {
  id: string;
  name: string;
  players: Map<string, Player>;
  startTime: number;
  duration: number;
  status: 'waiting' | 'active' | 'finished';
  prizePool: number;
  maxPlayers: number;
}

class GameServer {
  private tournaments = new Map<string, Tournament>();
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocket.Server({ server: this.server });

  constructor() {
    this.setupExpress();
    this.setupWebSocket();
    this.createDemoTournaments();
    this.startGameLoop();
  }

  private setupExpress() {
    this.app.use(cors());
    this.app.use(express.json());

    // Tournament API endpoints
    this.app.get('/tournaments', (req, res) => {
      const tournamentList = Array.from(this.tournaments.values()).map(t => ({
        id: t.id,
        name: t.name,
        currentPlayers: t.players.size,
        maxPlayers: t.maxPlayers,
        prizePool: t.prizePool,
        status: t.status,
        startTime: t.startTime
      }));
      res.json(tournamentList);
    });

    this.app.post('/tournaments', (req, res) => {
      const tournament = this.createTournament(req.body);
      res.json(tournament);
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const tournamentId = url.searchParams.get('tournament') || 'casual';
      
      console.log(`Player connecting to tournament: ${tournamentId}`);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message, tournamentId);
        } catch (error) {
          console.error('Invalid message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws, tournamentId);
      });

      // Send initial tournament state
      this.sendTournamentState(ws, tournamentId);
    });
  }

  private handleMessage(ws: WebSocket, message: any, tournamentId: string) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    switch (message.type) {
      case 'player_join':
        this.addPlayer(ws, message.data, tournamentId);
        break;
      case 'player_move':
        this.updatePlayerPosition(message.playerId, message.data);
        break;
      case 'player_boost':
        this.updatePlayerBoost(message.playerId, message.data.boosting);
        break;
      case 'orb_collected':
        this.handleOrbCollection(message.playerId, message.data.orbId);
        break;
    }
  }

  private addPlayer(ws: WebSocket, playerData: any, tournamentId: string) {
    let tournament = this.tournaments.get(tournamentId);
    
    if (!tournament) {
      tournament = this.createTournament({ 
        id: tournamentId,
        name: `Tournament ${tournamentId}`,
        maxPlayers: 50 
      });
    }

    if (tournament.players.size >= tournament.maxPlayers) {
      ws.send(JSON.stringify({ type: 'error', message: 'Tournament is full' }));
      return;
    }

    const player: Player = {
      id: playerData.id,
      name: playerData.name,
      ws,
      x: Math.random() * 4000,
      y: Math.random() * 4000,
      direction: 0,
      score: 0,
      alive: true,
      tournamentId
    };

    tournament.players.set(player.id, player);

    // Broadcast player join to all players in tournament
    this.broadcastToTournament(tournamentId, {
      type: 'player_join',
      playerId: player.id,
      data: {
        playerId: player.id,
        player: {
          id: player.id,
          name: player.name,
          x: player.x,
          y: player.y,
          score: player.score,
          alive: player.alive
        }
      }
    });

    console.log(`Player ${player.name} joined tournament ${tournamentId} (${tournament.players.size}/${tournament.maxPlayers})`);

    // Start tournament if enough players
    if (tournament.players.size >= 5 && tournament.status === 'waiting') {
      this.startTournament(tournamentId);
    }
  }

  private updatePlayerPosition(playerId: string, data: any) {
    // Find player across all tournaments
    for (const tournament of this.tournaments.values()) {
      const player = tournament.players.get(playerId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.direction = data.direction;
        
        // Broadcast position update
        this.broadcastToTournament(tournament.id, {
          type: 'player_move',
          playerId,
          data: { x: player.x, y: player.y, direction: player.direction }
        }, playerId);
        break;
      }
    }
  }

  private updatePlayerBoost(playerId: string, boosting: boolean) {
    // Similar to position update but for boost state
    console.log(`Player ${playerId} boost: ${boosting}`);
  }

  private handleOrbCollection(playerId: string, orbId: string) {
    // Find player and update score
    for (const tournament of this.tournaments.values()) {
      const player = tournament.players.get(playerId);
      if (player) {
        player.score += 10;
        
        // Broadcast score update
        this.broadcastToTournament(tournament.id, {
          type: 'orb_collected',
          playerId,
          data: { orbId, newScore: player.score }
        });
        break;
      }
    }
  }

  private handleDisconnect(ws: WebSocket, tournamentId: string) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    // Find and remove player
    for (const [playerId, player] of tournament.players) {
      if (player.ws === ws) {
        tournament.players.delete(playerId);
        
        // Broadcast player left
        this.broadcastToTournament(tournamentId, {
          type: 'player_left',
          playerId,
          data: {}
        });
        
        console.log(`Player ${player.name} left tournament ${tournamentId}`);
        break;
      }
    }
  }

  private sendTournamentState(ws: WebSocket, tournamentId: string) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const players = Array.from(tournament.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y,
      score: p.score,
      alive: p.alive
    }));

    ws.send(JSON.stringify({
      type: 'tournament_state',
      data: {
        tournamentId,
        players,
        status: tournament.status,
        startTime: tournament.startTime
      }
    }));
  }

  private broadcastToTournament(tournamentId: string, message: any, excludePlayerId?: string) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const messageStr = JSON.stringify(message);
    
    tournament.players.forEach((player, playerId) => {
      if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(messageStr);
      }
    });
  }

  private createTournament(config: any): Tournament {
    const tournament: Tournament = {
      id: config.id || Math.random().toString(36).substr(2, 9),
      name: config.name || 'New Tournament',
      players: new Map(),
      startTime: Date.now() + (config.delayMinutes || 2) * 60000,
      duration: config.duration || 10,
      status: 'waiting',
      prizePool: config.prizePool || 1.0,
      maxPlayers: config.maxPlayers || 50
    };

    this.tournaments.set(tournament.id, tournament);
    console.log(`Created tournament: ${tournament.name} (${tournament.id})`);
    
    return tournament;
  }

  private createDemoTournaments() {
    // Create some demo tournaments
    this.createTournament({
      id: 'speed-dash-1',
      name: '⚡ Speed Dash Championship',
      prizePool: 0.8,
      maxPlayers: 50,
      delayMinutes: 2
    });

    this.createTournament({
      id: 'mega-battle-1', 
      name: '🏆 Mega Battle Royale',
      prizePool: 2.5,
      maxPlayers: 100,
      delayMinutes: 5
    });
  }

  private startTournament(tournamentId: string) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    tournament.status = 'active';
    tournament.startTime = Date.now();

    console.log(`Starting tournament ${tournament.name} with ${tournament.players.size} players`);

    // Broadcast tournament start
    this.broadcastToTournament(tournamentId, {
      type: 'tournament_start',
      data: { startTime: tournament.startTime }
    });

    // Schedule tournament end
    setTimeout(() => {
      this.endTournament(tournamentId);
    }, tournament.duration * 60000);
  }

  private endTournament(tournamentId: string) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    tournament.status = 'finished';
    
    // Calculate winners
    const players = Array.from(tournament.players.values())
      .filter(p => p.alive)
      .sort((a, b) => b.score - a.score);

    const winners = players.slice(0, 3);
    
    console.log(`Tournament ${tournament.name} ended. Winners:`, winners.map(w => w.name));

    // Broadcast results
    this.broadcastToTournament(tournamentId, {
      type: 'tournament_end',
      data: { 
        winners: winners.map(w => ({ id: w.id, name: w.name, score: w.score })),
        prizeDistribution: this.calculatePrizes(tournament.prizePool, winners.length)
      }
    });

    // Clean up tournament after 5 minutes
    setTimeout(() => {
      this.tournaments.delete(tournamentId);
    }, 5 * 60000);
  }

  private calculatePrizes(totalPrize: number, winnerCount: number) {
    const prizes = [];
    if (winnerCount >= 1) prizes.push(totalPrize * 0.5);  // 50% for 1st
    if (winnerCount >= 2) prizes.push(totalPrize * 0.3);  // 30% for 2nd  
    if (winnerCount >= 3) prizes.push(totalPrize * 0.2);  // 20% for 3rd
    return prizes;
  }

  private startGameLoop() {
    // Game state update loop - 20 FPS
    setInterval(() => {
      this.updateGameState();
    }, 50);
  }

  private updateGameState() {
    // Update each active tournament
    this.tournaments.forEach((tournament) => {
      if (tournament.status === 'active') {
        // Game logic updates here (collisions, orbs, etc.)
        this.broadcastGameUpdate(tournament.id);
      }
    });
  }

  private broadcastGameUpdate(tournamentId: string) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    // Create game state snapshot
    const gameState = {
      players: Array.from(tournament.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        x: p.x,
        y: p.y,
        direction: p.direction,
        score: p.score,
        alive: p.alive
      })),
      timestamp: Date.now()
    };

    this.broadcastToTournament(tournamentId, {
      type: 'game_update',
      data: gameState
    });
  }

  public start(port: number = 8080) {
    this.server.listen(port, () => {
      console.log(`🚀 Game server running on port ${port}`);
      console.log(`📊 WebSocket: ws://localhost:${port}/ws`);
      console.log(`🌐 API: http://localhost:${port}/tournaments`);
    });
  }
}

// Start the server
const gameServer = new GameServer();
gameServer.start();

export default GameServer;
