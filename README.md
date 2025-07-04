# 🐍 Slither.io Blockchain Edition

A modern, blockchain-powered reimagining of Slither.io—compete against AI bots, earn real Solana (GOR) token rewards, unlock achievements, and enjoy a beautiful, animated UI.

---

## 🚀 Features

- **Play-to-Earn:** Compete and earn real GOR tokens based on your performance.
- **Solana Blockchain Integration:** Secure, real Solana transactions for entry fees and rewards.
- **Tiered Reward System:** Champion, Elite, Skilled, and Participant tiers with performance bonuses.
- **Achievements:** Unlock and track animated achievements with rarity tiers and bonus rewards.
- **Modern UI:** Responsive, animated interface with beautiful effects and smooth controls.
- **Background Music:** Immersive in-game music with user controls.
- **Difficulty Settings:** Choose between Easy and Hard bot AI for a tailored experience.

---

## 🕹️ How to Play

1. **Connect your Solana wallet** (BackPack).
2. **Pay the entry fee** (0.01 GOR) to join a game.
3. **Enter your player name** and start playing.
4. **Control your snake** with the mouse (steer) and click/spacebar (boost).
5. **Outsmart AI bots** and collect orbs to grow and score points.
6. **Claim your rewards** after the game ends, directly to your wallet.

---

## 🪙 Blockchain & Rewards

- **Entry Fee:** 0.01 GOR per game (95% to pool, 5% house edge).
- **Reward Tiers:**
  - 👑 **Champion (1st):** 40% of pool, 5.0x multiplier, +0.005 GOR winner bonus
  - 💎 **Elite (2nd-3rd):** 30% of pool, 2.5x multiplier
  - ⭐ **Skilled (4th-10th):** 20% of pool, 1.2x multiplier
  - 🎮 **Participant (11+):** 5% of pool, 0.5x multiplier
- **Performance Bonuses:**
  - Up to 0.002 GOR for high scores (1000+ points)
  - 0.001 GOR for surviving 2+ minutes
- **Minimum Claim Threshold:** 0.0001 GOR
- **Claim Process:** Rewards are claimed directly from the death screen via real Solana transactions.

---

## 🏆 Achievements

- **Progressive Unlocks:** Real-time notifications for new achievements.
- **Rarity Tiers:** Common, Rare, Epic, Legendary.
- **Bonus Rewards:** Extra GOR for unlocking achievements.
- **Animated UI:** Visual feedback and progress bars.

---

## 🎨 UI/UX Highlights

- **Animated Death Screen:** Rank-based themes, performance stats, and smooth transitions.
- **Reward Pool Status:** Real-time pool monitoring and transparent economics.
- **Responsive Design:** Optimized for all screen sizes.
- **Background Music:** Toggle and adjust volume in settings.

---

## 🏗️ Project Structure

```
/src
  /components      # UI components (GameCanvas, Leaderboard, Settings, etc.)
  /hooks           # Custom React hooks (game loop, rewards, web3)
  /providers       # Context providers (Wallet, Web3, Music)
  /services        # Blockchain reward logic
  /types           # TypeScript types
  /utils           # Game logic utilities
/public/assets     # Static assets (bg-sound.mp3)
```

---

## 🛠️ Setup & Development

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd slither-io
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set:
     ```
     VITE_RPC_ENDPOINT=
     VITE_VAULT_PRIVATE_KEY=
     VITE_ENTRY_FEE=0.01
     VITE_HOUSE_EDGE=5
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🔒 Environment Variables

| Variable                | Description                                 |
|-------------------------|---------------------------------------------|
| VITE_RPC_ENDPOINT       | Solana RPC endpoint                         |
| VITE_VAULT_PRIVATE_KEY  | Base58-encoded private key for reward vault |
| VITE_ENTRY_FEE          | Entry fee per game (GOR)                    |
| VITE_HOUSE_EDGE         | House edge percentage (default: 5)          |

---

## 📊 Example Reward Calculation

For a game with 10 players and a 0.095 GOR pool (after house edge):

- **Winner (1st):** ~0.038 GOR base + 0.005 bonus = 0.043+ GOR
- **Runner-up (2nd-3rd):** ~0.014 GOR base + performance bonuses
- **Top 10 (4th-10th):** ~0.003 GOR base + performance bonuses
- **Others:** Participation rewards if score > threshold

---

## 🛡️ Security

- **Vault-based Distribution:** Rewards sent from a secure vault.
- **Double-Claim Prevention:** Immediate status updates.
- **Rollback Mechanism:** Failed transaction recovery.
- **24-Hour Expiry:** Prevents stale reward claims.
- **Error Handling:** Graceful handling of network issues and insufficient funds.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 🙌 Credits

- Inspired by the original [Slither.io](https://slither.io/)
- Blockchain integration powered by [Solana](https://solana.com/)
- UI built with [React](https://react.dev/) and [Tailwind CSS](https://tailwindcss.com/)

---

## 📬 Contact

For questions or support, open an issue or contact the maintainer.
