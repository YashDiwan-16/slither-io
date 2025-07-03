# Multiplayer Slither.io Server

A real-time WebSocket server for multiplayer snake game tournaments.

## Quick Setup

```bash
npm init -y
npm install ws express cors
npm install -D @types/node @types/ws typescript ts-node
```

## Usage

```bash
npm run dev
```

Server runs on `ws://localhost:8080/ws`

## Features

- **Real-time multiplayer**: Up to 100 players per tournament
- **Tournament system**: Automated tournament creation and management  
- **Live leaderboards**: Real-time score updates
- **Anti-cheat**: Server-side game state validation
- **Spectator mode**: Watch ongoing games
- **Scalable architecture**: Redis for multi-instance scaling

## Tournament Flow

1. **Join Tournament**: Players connect and pay entry fee
2. **Waiting Room**: Show countdown and player list  
3. **Game Start**: Synchronized game start for all players
4. **Live Updates**: Real-time position and score sync
5. **End Game**: Calculate winners and distribute prizes

## API Endpoints

- `GET /tournaments` - List active tournaments
- `POST /tournaments` - Create new tournament  
- `GET /tournaments/:id/stats` - Tournament statistics
- `WS /ws?tournament=:id` - Join tournament WebSocket

## Prize Distribution

- 🥇 1st Place: 50% of prize pool
- 🥈 2nd Place: 30% of prize pool  
- 🥉 3rd Place: 20% of prize pool

Automatic Solana payouts to winners!
