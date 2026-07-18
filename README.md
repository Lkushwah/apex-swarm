# 🔥 APEX SWARM

> **"You are the swarm."** 

**Apex Swarm** is a hyper-fast, high-octane Bullet Heaven survival game built in Vanilla TypeScript. Survive endless waves of cybernetic enemies, collect experience and cores, evolve your weapons into devastating forms, and unleash the raw power of **APEX MODE**.

---

## 🎮 Gameplay Features

* **Endless Survival**: Fend off increasing waves of distinct enemy types (Swarmers, Chargers, Tanks, Shooters, Summoners, Splitters, and Bosses).
* **APEX MODE**: Building your APEX meter triggers a devastating limit-break state, granting you invincibility, massive damage multipliers, life steal, and time-slowing effects to decimate the screen.
* **Limitless Builds**: Collect XP to level up during your run and combine unique weapons and passive upgrades.
* **Weapon Evolutions**: Max out a weapon to evolve it into a catastrophic final form (e.g., *Railgun* ➔ *Orbital Strike*, *Drones* ➔ *Hive Mind Laser*).
* **Permanent Meta-Progression**: Extract "Cores" from your runs to spend in the **Power Upgrades** shop, permanently increasing your base stats across all runs.
* **Daily Challenges**: Compete in deterministic daily runs using a unified daily seed with unique mutators, giving every player the exact same enemy spawns and RNG for an even playing field.
* **Cosmetics Shop**: Flex your style by purchasing alternative bullet colors and visual flair using credits earned during your runs.
* **Global Leaderboards & Cloud Sync**: Powered by Firebase, compete globally for the highest survival times. Runs and analytics are automatically synced to the cloud.
* **Anonymous Authentication**: Jump right in without creating an account. Your stats and leaderboard entries are tied securely to your device.
* **Mouse & Touch Support**: Playable anywhere. Move fluidly via cursor follow or mobile touch controls.

## 🛠️ Technology Stack

Apex Swarm is built entirely from scratch with a custom engine architecture:
* **Vanilla TypeScript**: Type-safe entity-component architecture with zero heavyweight frameworks.
* **HTML5 Canvas API**: A highly optimized rendering loop supporting hundreds of entities, particles, and floating damage numbers simultaneously.
* **Firebase (Backend as a Service)**: Handles anonymous user authentication, global leaderboards, cloud saves, and realtime analytics logging via Firestore.
* **Vite**: Blazing fast development server and production bundler.
* **Vitest**: Comprehensive unit testing ensuring combat math, AI pathfinding, and deterministic PRNG behavior remain stable.

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lkushwah/apex-swarm.git
   ```

2. **Navigate to the web app directory:**
   ```bash
   cd apex-swarm/apex-swarm-web
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   *Alternatively, double-click the `start_server.bat` file in the root directory (Windows).*

5. **Play the game!**
   Open your browser to the local address provided by Vite (usually `http://localhost:5173/`).

## 🧪 Testing

Apex Swarm has a dedicated unit testing suite to verify engine stability.
Run tests using:
```bash
npm run test
```

---

*Designed and engineered with dynamic combat systems, responsive game feel, and deep scaling progression mechanics.*
