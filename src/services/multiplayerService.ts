import { Snake, Orb } from '../types/game';

interface GameMessage {
  type: 'player_join' | 'player_move' | 'player_boost' | 'orb_collected' | 'snake_died' | 'game_update';
  playerId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface MultiplayerGameState {
  players: Map<string, Snake>;
  orbs: Orb[];
  gameStarted: boolean;
  tournamentId?: string;
}

class WebSocketGameService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private gameState: MultiplayerGameState = {
    players: new Map(),
    orbs: [],
    gameStarted: false
  };
  
  private messageHandlers: Map<string, (data: Record<string, unknown>) => void> = new Map();

  connect(tournamentId?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // In production, use your WebSocket server URL
        const wsUrl = process.env.NODE_ENV === 'production' 
          ? 'wss://your-game-server.com/ws'
          : 'ws://localhost:8080/ws';
        
        this.ws = new WebSocket(`${wsUrl}?tournament=${tournamentId || 'casual'}`);

        this.ws.onopen = () => {
          console.log('Connected to game server');
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: GameMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('Disconnected from game server:', event.code);
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(tournamentId);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(tournamentId?: string) {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(tournamentId);
    }, delay);
  }

  private handleMessage(message: GameMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    }

    switch (message.type) {
      case 'player_join':
        this.gameState.players.set(message.playerId, message.data as unknown as Snake);
        break;
      case 'game_update':
        // Update entire game state
        this.gameState = { ...this.gameState, ...message.data };
        break;
      case 'orb_collected':
        // Remove collected orb and add new one
        this.gameState.orbs = this.gameState.orbs.filter(orb => orb.id !== (message.data.orbId as string));
        if (message.data.newOrb) {
          this.gameState.orbs.push(message.data.newOrb as unknown as Orb);
        }
        break;
      case 'snake_died':
        this.gameState.players.delete(message.playerId);
        break;
    }
  }

  sendPlayerMove(x: number, y: number, direction: number) {
    this.sendMessage({
      type: 'player_move',
      playerId: this.getPlayerId(),
      data: { x, y, direction },
      timestamp: Date.now()
    });
  }

  sendPlayerBoost(boosting: boolean) {
    this.sendMessage({
      type: 'player_boost',
      playerId: this.getPlayerId(),
      data: { boosting },
      timestamp: Date.now()
    });
  }

  sendOrbCollected(orbId: string) {
    this.sendMessage({
      type: 'orb_collected',
      playerId: this.getPlayerId(),
      data: { orbId },
      timestamp: Date.now()
    });
  }

  private sendMessage(message: GameMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private getPlayerId(): string {
    // Get player ID from localStorage or generate new one
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
      playerId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('playerId', playerId);
    }
    return playerId;
  }

  onMessage(type: string, handler: (data: Record<string, unknown>) => void) {
    this.messageHandlers.set(type, handler);
  }

  getGameState(): MultiplayerGameState {
    return this.gameState;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const gameSocket = new WebSocketGameService();

// React hook for easy integration
import { useState, useEffect } from 'react';

export function useMultiplayer(tournamentId?: string) {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<MultiplayerGameState>({
    players: new Map(),
    orbs: [],
    gameStarted: false
  });

  useEffect(() => {
    const connectToGame = async () => {
      try {
        await gameSocket.connect(tournamentId);
        setConnected(true);
      } catch (error) {
        console.error('Failed to connect to game:', error);
        setConnected(false);
      }
    };

    // Set up message handlers
    gameSocket.onMessage('game_update', (data) => {
      setGameState(prevState => ({ ...prevState, ...data }));
    });

    gameSocket.onMessage('player_join', (data) => {
      setGameState(prevState => {
        const newPlayers = new Map(prevState.players);
        newPlayers.set(data.playerId as string, data.player as unknown as Snake);
        return { ...prevState, players: newPlayers };
      });
    });

    gameSocket.onMessage('snake_died', (data) => {
      setGameState(prevState => {
        const newPlayers = new Map(prevState.players);
        newPlayers.delete(data.playerId as string);
        return { ...prevState, players: newPlayers };
      });
    });

    connectToGame();

    return () => {
      gameSocket.disconnect();
      setConnected(false);
    };
  }, [tournamentId]);

  return {
    connected,
    gameState,
    sendMove: gameSocket.sendPlayerMove.bind(gameSocket),
    sendBoost: gameSocket.sendPlayerBoost.bind(gameSocket),
    sendOrbCollected: gameSocket.sendOrbCollected.bind(gameSocket)
  };
}
