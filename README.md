Slither.io Blockchain Edition
A modern, blockchain-powered version of Slither.io with real Solana (GOR) token rewards, beautiful UI, and smooth gameplay.
🚀 Features
Play-to-Earn: Compete against AI bots and earn real GOR tokens based on your performance.
Blockchain Integration: Secure, real Solana transactions for entry fees and rewards.
Tiered Reward System: Champion, Elite, Skilled, and Participant tiers with performance bonuses.
Achievements: Unlock and track achievements with animated notifications.
Modern UI: Responsive, animated interface with beautiful effects and smooth controls.
Background Music: Immersive in-game music with user controls.
Difficulty Settings: Choose between Easy and Hard bot AI for a tailored experience.

🕹️ How to Play
Connect your Solana wallet (BackPack).
Pay the entry fee (0.01 GOR) to join a game.
Enter your player name and start playing.
Control your snake with the mouse (steer) and click/spacebar (boost).
Outsmart AI bots and collect orbs to grow and score points.
Claim your rewards after the game ends, directly to your wallet.
🎵 Audio
Background music is enabled by default.
Use the settings (gear icon) to toggle music and adjust volume.

⚙️ Settings
Difficulty: Switch between Easy and Hard bots in the settings modal (About tab).
Audio: Control background music in the Audio tab.

🏗️ Project Structure
/src
  /components      # UI components (GameCanvas, Leaderboard, Settings, etc.)
  /hooks           # Custom React hooks (game loop, rewards, web3)
  /providers       # Context providers (Wallet, Web3, Music)
  /services        # Blockchain reward logic
  /types           # TypeScript types
  /utils           # Game logic utilities
/public/assets     # Static assets (bg-sound.mp3)


🛠️ Setup & Development
npm i
npm run dev


🔒 Environment Variables
Create a .env file based on .env.example and set:
VITE_RPC_ENDPOINT
VITE_VAULT_PRIVATE_KEY
VITE_ENTRY_FEE
VITE_HOUSE_EDGE
🪙 Blockchain & Rewards
Entry fees are collected and distributed via Solana transactions.
Rewards are calculated based on rank, score, and survival time.
Claim rewards directly from the death screen.
