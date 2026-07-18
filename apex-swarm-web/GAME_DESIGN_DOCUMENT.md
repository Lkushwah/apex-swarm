# APEX SWARM — Game Design Document

> **Version:** 1.2  
> **Last Updated:** 2026-06-21  
> **Platforms:** Web (Vite + TypeScript) → Android (Android Studio)  
> **Genre:** Bullet Heaven / Auto-Shooter Survival  
> **Target Audience:** Mobile Gamers (16–35), fans of Vampire Survivors, Holocure  

---

## Table of Contents
1. [Game Overview](#1-game-overview)
2. [Core Pillars](#2-core-pillars)
3. [Game Loop](#3-game-loop)
4. [Player](#4-player)
5. [Weapons](#5-weapons)
6. [Enemies](#6-enemies)
7. [Progression & Leveling](#7-progression--leveling)
8. [Power Upgrades (Meta-Progression)](#8-power-upgrades-meta-progression)
9. [Special USP — APEX MODE](#9-special-usp--apex-mode)
10. [Collectibles & Currencies](#10-collectibles--currencies)
11. [UI & Screens](#11-ui--screens)
12. [Technical Architecture](#12-technical-architecture)
13. [Monetization](#13-monetization)
14. [Audio Direction](#14-audio-direction)
15. [Visual Direction](#15-visual-direction)

---

## 1. Game Overview

**Apex Swarm** is a portrait-mode, hyper-fast "Bullet Heaven" survival game. The player controls a lone Cyber-Warrior who auto-attacks endless swarms of neon-glitch enemies. The goal is to survive for as long as possible, growing in power through per-run draft upgrades and unlocking permanent buffs through meta-progression.

> **Tagline:** *"You are the swarm."*

---

## 2. Core Pillars

| Pillar | Description |
|---|---|
| **Feel-Good Auto-Combat** | The player never aims manually. The game always fires. Satisfaction comes from positioning and upgrade synergies. |
| **Explosive Progression** | Every level-up is a "pull" moment: 3 choices, increasing stakes, snowballing power. |
| **The APEX Moment** | Every run has a dramatic do-or-die transformation (see §9). |
| **30-Second Hooks** | The core loop must be understandable in 30 seconds, but mastery should take months. |

---

## 3. Game Loop

```
START RUN
    │
    ▼
Survive → Kill Enemies → Drop XP Gems
    │
    ▼
Level Up → Draft 3 Random Upgrades → Choose 1
    │
    ▼ (Repeat until HP = 0)
GAME OVER
    │
    ▼
Earn Credits → Open Power Upgrades Shop
    │
    ▼
Permanent Stats Increased → START RUN (stronger)
```

---

## 4. Player

### 4.1 Base Stats

| Stat | Base Value | Description |
|---|---|---|
| HP | 100 | Reduced by enemy contact. No regeneration by default. |
| Speed | 180 px/s | Movement toward touch/pointer position. |
| Damage Multiplier | ×1.0 | Applied to all weapon damage. |
| Fire Rate Multiplier | ×1.0 | Applied to all weapon cooldowns. |

### 4.2 Movement
- The player moves toward the **touch pointer / mouse cursor** position.
- Movement stops when within 5px of the target.
- Movement is capped to screen boundaries (with radius buffer).

### 4.3 Auto-Attack
- All weapons are automatically fired by the `WeaponSystem`.
- The base weapon (Kinetic Blaster) fires at the nearest living enemy.
- Weapon selection is expanded through run-time upgrades (see §5).

### 4.4 APEX Mode (Special USP)
- See Section 9.

---

## 5. Weapons

### 5.1 Kinetic Blaster (Default Weapon)
- **Fire Rate:** 0.5s (base)
- **Damage:** 25 (base)
- **Projectile Speed:** 400 px/s
- **Range:** Full screen (bullets despawn at edges or after 2s)
- **Mechanic:** Fires one projectile at the nearest enemy. Slight recoil.

### 5.2 Plasma Orbit (Unlock via upgrade)
- **Description:** 2 orbiting plasma orbs that rotate around the player.
- **Damage:** 15 per hit
- **Rotation Speed:** 150°/s
- **Mechanic:** Constantly active, deals contact damage. Unlock more orbs via upgrades.

### 5.3 Chain Lightning (Unlock via upgrade)
- **Description:** Fires a bolt that chains between 3 nearby enemies.
- **Damage:** 40 base (decreases 20% per chain)
- **Chain Range:** 120 px
- **Fire Rate:** 1.5s

### 5.4 Missile Barrage (Unlock via upgrade)
- **Description:** Fires a slow-moving homing missile at a random enemy.
- **Damage:** 80 per hit
- **Speed:** 150 px/s
- **Fire Rate:** 3.0s

---

## 6. Enemies

### 6.1 Scaling Formula
All enemy stats scale with `timeScale = 1 + (survivalTime / 60)`.

### 6.2 Enemy Types

| Enemy | Shape | Color | HP | Speed | Damage | Behavior |
|---|---|---|---|---|---|---|
| **Swarmer** (default) | Square | Red `#ef4444` | 30 × scale | 50–90 × scale | 10 | Chase player directly. Self-destructs on contact. |
| **Brute** (unlocks at 1min) | Large Circle | Orange `#f97316` | 150 × scale | 30 × scale | 25 | Slow, high HP, walks directly at player. |
| **Shooter** (unlocks at 2min) | Diamond | Purple `#a855f7` | 60 × scale | 20 × scale | 15 | Keeps distance, fires 1 projectile every 2s toward player. |
| **Shielder** (unlocks at 3min) | Hexagon | Cyan `#06b6d4` | 80 × scale | 40 × scale | 10 | Normal chaser, but is immune to damage from the front (must flank). |

### 6.3 Spawn Rates
- **Base:** 1 enemy per second
- **Minimum:** 0.1s between spawns
- **Escalation:** Spawn rate ramps from 1.0s down to 0.1s over 2 minutes.

---

## 7. Progression & Leveling

### 7.1 In-Run XP Curve

| Level | XP Needed |
|---|---|
| 1 → 2 | 100 |
| 2 → 3 | 150 |
| 3 → 4 | 225 |
| n → n+1 | prev × 1.5 |

### 7.2 Level-Up Draft (Per-Run Upgrades)

On leveling up, the game **pauses** and presents **3 randomly selected upgrades** from the following pool:

| ID | Name | Icon | Effect |
|---|---|---|---|
| `dmg_up` | Damage Up | ⚔️ | +25% Damage Multiplier |
| `fire_rate_up` | Fire Rate Up | ⚡ | ×0.8 Fire Rate cooldown (20% faster) |
| `speed_up` | Speed Up | 👟 | +15% Movement Speed |
| `hp_up` | HP Restore | ❤️‍🔥 | Restore 20% of Max HP |
| `orbit_unlock` | Plasma Orb | 🔵 | Add 1 orbiting plasma orb |
| `chain_unlock` | Chain Lightning | ⚡ | Unlock/upgrade Chain Lightning weapon |
| `missile_unlock` | Missile Barrage | 🚀 | Unlock/upgrade Missile Barrage weapon |
| `apex_charge` | Apex Charge | 🔥 | Reduce Apex Mode threshold by 10% |

---

## 8. Power Upgrades (Meta-Progression)

Permanent upgrades purchased between runs using **Credits**. Credits are earned by surviving time, killing enemies, and collecting credit drops.

### 8.1 Shop Menu Layout
- Accessible from the **Main Menu** via a "POWER UPGRADES" button.
- A full-screen modal panel with a grid of upgrade cards.
- Each card shows: Icon, Name, Description, Current Level, Cost.

### 8.2 Upgrade Tree

| ID | Name | Max Level | Cost Per Level | Effect |
|---|---|---|---|---|
| `perm_hp` | Iron Shell | 10 | 50 + (level × 25) | +10 Max HP per level |
| `perm_dmg` | War Core | 10 | 75 + (level × 35) | +5% Damage per level |
| `perm_speed` | Drift Engine | 5 | 60 + (level × 30) | +5% Speed per level |
| `perm_fire_rate` | Rapid Coil | 5 | 80 + (level × 40) | ×0.95 Fire Rate per level |
| `perm_magnet` | Gem Magnet | 5 | 40 + (level × 20) | +20px Magnet Radius per level |
| `perm_apex` | Apex Amp | 5 | 100 + (level × 50) | +5% Apex Mode damage and duration per level |
| `perm_credits` | Credit Surge | 5 | 90 + (level × 45) | +10% Credits earned per level |

### 8.3 Persistence
- Stored in `localStorage` under the key `apex_swarm_save`.
- Structure: `{ credits: number, upgrades: { [id]: level } }`

---

## 9. Special USP — APEX MODE 🔥

**APEX MODE** is the game's signature mechanic and primary USP. It is designed to create a dramatic, cinematic "comeback" moment in every run.

### 9.1 Trigger Condition
- When the player's HP drops to **25% or below** for the first time in a run, APEX MODE automatically activates.
- Triggered only once per run.
- Can also be manually triggered by selecting the `apex_charge` upgrade (charges faster).

### 9.2 Effects During APEX MODE
| Effect | Value |
|---|---|
| Duration | 8 seconds (base) |
| Damage Multiplier | ×3.0 |
| Speed Multiplier | ×1.5 |
| Invincibility | YES — no damage can be taken |
| Fire Rate | ×0.4 (fires 2.5x faster) |
| Visual | Screen edge glows pulsing red/gold. Player pulsates white. All enemies gain red outline. |
| Audio | High-energy cinematic SFX trigger |

### 9.3 APEX MODE Transition
1. HP hits threshold → brief **0.4s time-slow** (timeScale → 0.1)
2. Screen flash white → player emits expanding ring burst
3. Time resumes at full speed → APEX MODE active
4. On expiry → "APEX FADING" warning for 1s → return to normal stats
5. Player takes damage normally again after APEX MODE ends.

### 9.4 Visual Identity
- Player renders with a pulsing white glow and a spinning outer ring.
- Enemies gain a reddish silhouette to indicate they are in the "danger zone."
- A dedicated "APEX MODE" UI banner animates in from the top.

---

## 10. Collectibles & Currencies

| Item | Color | Source | Effect |
|---|---|---|---|
| XP Gem | Green `#4ade80` | Enemy death (50% chance) | +35 XP. Magnetized at ≤100px range. |
| Credit | Amber `#fbbf24` | Enemy death (10% chance), run milestones | +1 Credit. Used in Power Upgrades shop. |

---

## 11. UI & Screens

| Screen | ID | Description |
|---|---|---|
| **Main Menu** | `#main-menu` | Game logo, "Start Run", "Power Upgrades" buttons |
| **HUD** | `#hud` | HP bar, XP bar, Level indicator, Survival Timer, Apex Mode cooldown |
| **Level Up Draft** | `#levelup-screen` | 3 upgrade cards. Game is paused. |
| **Power Upgrades** | `#power-upgrades-screen` | Full screen shop. Shows all permanent upgrades, current levels, credits balance. |
| **Apex Mode Banner** | `#apex-banner` | Animated banner shown during Apex Mode (overlays HUD) |
| **Game Over** | `#gameover-screen` | Survival time, credits earned this run, "Try Again", "Upgrades" buttons |

---

## 12. Technical Architecture

### 12.1 Project Structure (Web Phase)
```
apex-swarm-web/
├── src/
│   ├── engine/
│   │   ├── GameLoop.ts      # requestAnimationFrame loop + delta time
│   │   ├── InputManager.ts  # Mouse/touch pointer tracking
│   │   └── Renderer.ts      # Canvas 2D wrapper (clear, drawGrid, getDimensions)
│   ├── entities/
│   │   ├── Player.ts        # HP, XP, movement, APEX Mode state
│   │   ├── Enemy.ts         # Chase AI, scaling stats
│   │   ├── Projectile.ts    # Velocity, damage, lifespan
│   │   └── Collectible.ts   # XP Gem, Credit pickups (magnet logic)
│   ├── systems/
│   │   ├── WeaponSystem.ts  # Auto-aim, fire rate, multi-weapon management
│   │   ├── WaveManager.ts   # Survival timer, enemy spawn ramp
│   │   └── ApexSystem.ts    # APEX MODE trigger, time-slow, effects
│   ├── ui/
│   │   ├── UIManager.ts     # DOM overlay management
│   │   ├── PowerUpgradesUI.ts  # Permanent upgrades shop modal
│   │   └── LevelUpUI.ts     # Per-run level up draft screen
│   ├── data/
│   │   ├── upgrades.ts      # Upgrade definitions (per-run and permanent)
│   │   └── enemies.ts       # Enemy type definitions
│   ├── core/
│   │   └── SaveManager.ts   # localStorage persistence
│   └── main.ts              # Wires everything together, game state machine
├── index.html
├── vite.config.ts
└── package.json
```

### 12.2 Game State Machine
```
START → PLAYING → LEVELUP → PLAYING → ... → GAMEOVER
                                    ↘ APEX_MODE → PLAYING
```

### 12.3 Testing Strategy
- **Unit Tests** (`*.test.ts`): Entity math, XP curves, damage calculations
- **Integration Tests**: WeaponSystem targeting + firing, APEX MODE trigger logic
- **System Tests**: Full game loop (start → levelup → game over) in headless mode
- **Build Validation**: TypeScript compilation + Vite production build
- **Tool:** Vitest

---

## 13. Monetization

> ⚠️ Deferred to a later phase. All hooks are stubbed in code.

| Type | SDK | Trigger |
|---|---|---|
| Rewarded Ad | TBD (AdMob/Unity Ads) | "Continue run?" offer on Game Over |
| Interstitial Ad | TBD | After every 3rd run |
| IAP – "No Ads" | Google Play Billing | Permanent removal of interstitials |
| IAP – "Credit Pack" | Google Play Billing | Purchase credit bundles |

---

## 14. Audio Direction

> ⚠️ Deferred to a later phase.

| Sound | Trigger |
|---|---|
| Shoot SFX | Every bullet fired |
| Enemy Death SFX | Enemy HP ≤ 0 |
| Gem Collect SFX | XP collected |
| Level Up SFX | Level-up screen opens |
| APEX Trigger SFX | Cinematic sting when APEX MODE activates |
| APEX Loop BGM | High-energy music during APEX MODE |

---

## 15. Visual Direction

- **Color Palette:** Dark navy background (`#0f172a`), cyan/blue player, red enemies, green gems, amber credits.
- **Style:** Neon-glow shapes. No sprites in MVP. All enemies are geometric primitives with `shadowBlur` glow.
- **Player:** Glowing cyan circle with white inner core. Pulsing during APEX MODE.
- **Background:** Subtle parallax grid (scrolls opposite to player direction).
- **Particles:** Small square particles burst on enemy death and bullet impact.
- **Floating Text:** Damage numbers and "+XP" popup text.

---

## Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-06-21 | Initial GDD from prototype analysis |
| 1.1 | 2026-06-21 | Added APEX MODE USP, Power Upgrades shop |
| 1.2 | 2026-06-21 | Added full enemy roster, weapon definitions, technical architecture |
