# Apex Swarm — Implementation Status Tracker

> **Last Updated:** 2026-07-18
> **GDD Version:** 2.0
> **Branch:** `feature/phase-1-3-implementation`

Legend: ✅ Implemented | 🔧 In Progress | ❌ Not Started | ⚠️ Partial/Buggy

---

## 1. Engine & Core Infrastructure

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Game Loop (requestAnimationFrame, dt cap) | `engine/GameLoop.ts` | ✅ | |
| Canvas Renderer (clear, grid, apex glow) | `engine/Renderer.ts` | ✅ | |
| Input Manager (pointer tracking) | `engine/InputManager.ts` | ✅ | |
| Save Manager (localStorage credits + upgrades) | `core/SaveManager.ts` | ✅ | Cloud save stub needed for Android phase |

---

## 2. Player Character (GDD §4)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Movement toward pointer | `entities/Player.ts` | ✅ | |
| Screen boundary clamping | `entities/Player.ts` | ✅ | |
| Dash (double-tap / Shift) | `entities/Player.ts` | ✅ | 0.15s duration, 4s cooldown |
| Dash visual (transparency) | `entities/Player.ts` | ✅ | |
| HP / Max HP | `entities/Player.ts` | ✅ | |
| Armor damage reduction | `entities/Player.ts` | ✅ | `takeDamage()` subtracts armor, min 1 damage |
| Magnet Radius (real property) | `entities/Player.ts` | ✅ | Was `any` cast, now proper field |
| Damage / Fire Rate / Speed multipliers | `entities/Player.ts` | ✅ | |
| Crit Chance / Crit Damage stats | `entities/Player.ts` | ✅ | Stats set by passives |
| Weapon inventory (6 slots) | `entities/Player.ts` | ✅ | |
| Passive inventory (6 slots) | `entities/Player.ts` | ✅ | |
| Draw with Apex Mode visual | `entities/Player.ts` | ✅ | Pulsing orange ring + glow |
| HP Regen per second | `entities/Player.ts` | ✅ | Driven by perm_regen upgrade |

---

## 3. Weapon System (GDD §5)

| Weapon | File(s) | Status | Notes |
|---|---|---|---|
| Kinetic Blaster (base, fan spread) | `systems/WeaponSystem.ts` | ✅ | Scales damage + fire rate with level, multi-projectile at higher levels |
| Plasma Orbit (orbiting orbs) | `entities/Projectiles.ts` | ✅ | Orb count scales with level |
| Chain Lightning (chain jumps) | `entities/Projectiles.ts` | ✅ | Jump count scales with level |
| Missile Barrage (homing + splash) | `entities/Projectiles.ts` | ✅ | Damage now scales with level |
| Glitch Scythe (melee arc) | `entities/Projectiles.ts` | ✅ | Damage scales with level, +5% per target bonus |
| Drone Swarm (autonomous drones) | `entities/Projectiles.ts` | ⚠️ | Fires auto-targeting projectiles (simplified); full Drone entity deferred to Phase 4 |
| Crit rolls on projectile hit | `entities/Projectile.ts` | ✅ | Uses player.critChance / critDamage |
| Global lifesteal on hit | `entities/Projectile.ts` | ✅ | player.globalLifesteal + apexSystem.lifesteal |
| Weapon damage scaling with level (all) | `systems/WeaponSystem.ts` | ✅ | |

---

## 4. Weapon Evolution System (GDD §7)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Evolution check (weapon L8 + passive L5) | `systems/EvolutionSystem.ts` | ✅ | Sets `evolved: true` |
| Evolution trigger flash / SFX | — | ❌ | Phase 4 |
| Railgun Array (piercing beam) | — | ❌ | Phase 4 |
| Singularity Ring (merged ring + gravity) | — | ❌ | Phase 4 |
| Storm Front (screen-wide pulse + stun) | — | ❌ | Phase 4 |
| Apocalypse Pod (cluster-split) | — | ❌ | Phase 4 |
| Reality Tear (360° pulse + lifesteal) | — | ❌ | Phase 4 |
| Hive Mind (uncapped drones + lasers) | — | ❌ | Phase 4 |

---

## 5. Passive Items (GDD §6)

| Passive | File(s) | Status | Notes |
|---|---|---|---|
| Targeting Module (crit chance + dmg) | `data/passives.ts` | ✅ | Connected to crit system |
| Mass Core (orbit size + dmg) | `data/passives.ts` | ✅ | |
| Conductor Coil (chain range + falloff) | `data/passives.ts` | ✅ | |
| Warhead (splash radius) | `data/passives.ts` | ✅ | |
| Bloodline Edge (melee lifesteal) | `data/passives.ts` | ✅ | |
| Swarm Link (drone regen + respawn) | `data/passives.ts` | ✅ | Stats set, full drone entity deferred |
| Iron Plate (flat armor) | `data/passives.ts` | ✅ | Connected to armor system |
| Apex Capacitor (fill rate bonus) | `data/passives.ts` | ✅ | Now actually sets apexSystem.fillRateBonus |
| Momentum Drive (speed + dash) | `data/passives.ts` | ✅ | |
| Vampiric Core (global lifesteal) | `data/passives.ts` | ✅ | Connected to projectile hit |

---

## 6. Enemy Roster (GDD §8)

| Enemy Type | File(s) | Status | Notes |
|---|---|---|---|
| Swarmer (red square, direct chase) | `entities/Enemy.ts` | ✅ | Unlocks at 0:00 |
| Brute (orange circle, slow, high HP) | `entities/Enemy.ts` | ✅ | Unlocks at 1:00 |
| Shooter (purple diamond, ranged) | `entities/Enemy.ts` | ✅ | Fires projectiles at player, unlocks 2:00 |
| Shielder (cyan hexagon, strafing shield) | `entities/Enemy.ts` | ✅ | Weak point on rear, unlocks 3:00 |
| Phasewraith (violet triangle, teleport) | `entities/Enemy.ts` | ✅ | Teleports toward player every 3s, unlocks 5:00 |
| Bulwark Drone (steel octagon, shield-cast) | `entities/Enemy.ts` | ✅ | 2s damage reduction shield, unlocks 7:00 |
| Glitch Swarm (magenta tiny squares ×5) | `entities/Enemy.ts` | ✅ | Cluster spawn, low HP, unlocks 9:00 |
| Enemy projectiles (Shooter) | `entities/Enemy.ts` | ✅ | Inline implementation |
| Weighted spawn tables over time | `systems/WaveManager.ts` | ✅ | Composition shifts as run progresses |
| Time-based enemy unlocks | `systems/WaveManager.ts` | ✅ | |
| Shielder fix (strafe, not beeline) | `entities/Enemy.ts` | ✅ | Slow turn rate, dash counterplay |

---

## 7. Boss & Elite Encounters (GDD §9)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Boss entity (compound shapes, HP bar) | — | ❌ | Phase 5 |
| BossSystem (checkpoint scheduling) | — | ❌ | Phase 5 |
| Bulwark Prime boss | — | ❌ | Phase 5 |
| Glitchmother boss | — | ❌ | Phase 5 |
| Railwraith boss (stretch) | — | ❌ | Phase 5 |
| Apex Mirror boss (stretch) | — | ❌ | Phase 5 |
| Telegraph warning (3s) | — | ❌ | Phase 5 |
| Arena lock (pause spawns) | — | ❌ | Phase 5 |
| Boss reward drops (chest) | — | ❌ | Phase 5 |

---

## 8. In-Run Progression & Leveling (GDD §10)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| XP curve (×1.5 scaling) | `entities/Player.ts` | ✅ | |
| Level-up draft (3 of 4 choices) | `ui/LevelUpUI.ts` | ✅ | Draws from weapon + passive pool |
| Weighted drafting (favor owned items) | `ui/LevelUpUI.ts` | ❌ | Currently pure random |
| Reroll (re-randomize choices) | `ui/LevelUpUI.ts` | ✅ | Base 1 charge, expandable via perm upgrade |
| Banish (remove item from pool) | `ui/LevelUpUI.ts` | ✅ | Base 1 charge, expandable via perm upgrade |

---

## 9. Power Upgrades / Meta-Progression (GDD §11)

| Upgrade | File(s) | Status | Notes |
|---|---|---|---|
| Iron Shell (perm_hp) | `data/upgrades.ts` | ✅ | +10 Max HP/level |
| War Core (perm_dmg) | `data/upgrades.ts` | ✅ | +5% Damage/level |
| Drift Engine (perm_speed) | `data/upgrades.ts` | ✅ | +5% Speed/level |
| Rapid Coil (perm_fire_rate) | `data/upgrades.ts` | ✅ | ×0.95 Fire Rate/level |
| Gem Magnet (perm_magnet) | `data/upgrades.ts` | ✅ | +20px Magnet Radius/level |
| Credit Surge (perm_credits) | `data/upgrades.ts` | ✅ | +10% Credits/level |
| Plated Hull (perm_armor) | `data/upgrades.ts` | ✅ | +1 flat Armor/level |
| Bio Regen (perm_regen) | `data/upgrades.ts` | ✅ | +0.2 HP/s regen/level |
| Second Chance (perm_reroll) | `data/upgrades.ts` | ✅ | +1 reroll charge/run |
| Pruning Protocol (perm_banish) | `data/upgrades.ts` | ✅ | +1 banish charge/run |
| Apex Capacity (perm_apex_cap) | `data/upgrades.ts` | ✅ | +10% overflow cap/level |
| Apex Amplifier (perm_apex_power) | `data/upgrades.ts` | ✅ | +5% dmg + 0.5s duration/level |
| Resonance Core (perm_apex_fill) | `data/upgrades.ts` | ✅ | +6% fill rate/level |
| Extra Slot (perm_loadout) | `data/upgrades.ts` | ✅ | +1 weapon or passive slot |
| Power Upgrades Shop UI | `ui/PowerUpgradesUI.ts` | ✅ | Grid layout, buy/max/locked states |

---

## 10. APEX MODE (GDD §12)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Apex Meter (0–100, visible HUD) | `systems/ApexSystem.ts` | ✅ | |
| Fill from kills (+1) | `systems/ApexSystem.ts` | ✅ | |
| Fill from time (+0.4/s) | `systems/ApexSystem.ts` | ✅ | |
| Fill from damage taken (+3 per 10% HP) | `systems/ApexSystem.ts` | ✅ | |
| Manual trigger (button + Space + double-tap) | `main.ts` | ✅ | |
| Time-slow transition (0.4s at 0.1x) | `systems/ApexSystem.ts` | ✅ | |
| Active state (8s, ×3 dmg, ×1.5 speed, invincible) | `systems/ApexSystem.ts` | ✅ | |
| Lifesteal (15% of damage dealt) | `systems/ApexSystem.ts` | ✅ | |
| Fading warning (1s) | `systems/ApexSystem.ts` | ✅ | |
| Safety net (auto-trigger at death if meter full) | `main.ts` | ✅ | Fixed race condition |
| Overflow banking | `systems/ApexSystem.ts` | ✅ | Extends duration proportionally |
| Apex banner + timer bar UI | `ui/UIManager.ts` | ✅ | |
| Fill rate bonus (from passives/upgrades) | `systems/ApexSystem.ts` | ✅ | |

---

## 11. Visual Feedback & Particles (GDD §20)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Particle system (square bursts) | `entities/Particles.ts` | ✅ | On enemy death, player hit, crit |
| Floating damage numbers | `entities/Particles.ts` | ✅ | Color-coded by type |
| "+XP" pickup text | `main.ts` | ✅ | |
| "+HP" lifesteal text | `entities/Projectile.ts` | ✅ | During Apex Mode |
| "+💰" credit pickup text | `main.ts` | ✅ | |
| Apex Shard sparkle particles | `entities/Particles.ts` | ✅ | Red/gold during Apex Mode |
| Crit hit visual ("CRIT!" text) | `entities/Projectile.ts` | ✅ | |
| Screen edge glow (Apex active) | `engine/Renderer.ts` | ✅ | |
| Parallax grid background | `engine/Renderer.ts` | ✅ | |
| Enemy-type-specific shapes & colors | `entities/Enemy.ts` | ✅ | 7 distinct shapes + colors |

---

## 12. Collectibles & Currencies (GDD §13)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| XP Gem (green diamond, 50% drop) | `entities/Collectible.ts` | ✅ | |
| Credit (amber, 10% drop) | `entities/Collectible.ts` | ✅ | |
| Core (pink/iridescent, rare) | — | ❌ | Phase 4-5 (cosmetics shop) |
| Magnet pickup radius | `entities/Collectible.ts` | ✅ | |

---

## 13. UI & Screens (GDD §15)

| Screen | File(s) | Status | Notes |
|---|---|---|---|
| Main Menu | `index.html`, `ui/UIManager.ts` | ✅ | Logo, Start Run, Power Upgrades |
| HUD (HP, XP, Level, Timer, Apex Meter) | `index.html`, `ui/UIManager.ts` | ✅ | |
| Apex trigger button | `index.html`, `ui/UIManager.ts` | ✅ | Pulses when ready |
| Level Up Draft screen | `ui/LevelUpUI.ts` | ✅ | 3 cards + reroll/banish |
| Power Upgrades Shop | `ui/PowerUpgradesUI.ts` | ✅ | |
| Game Over (stats, credits, run report) | `ui/UIManager.ts` | ✅ | |
| Apex Mode Banner + timer | `ui/UIManager.ts` | ✅ | |
| Cosmetics Shop | — | ❌ | Phase 4-5 |
| Daily Challenge screen | — | ❌ | Phase 4-5 |
| Boss Telegraph UI | — | ❌ | Phase 5 |

---

## 14. Retention Systems (GDD §14)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Daily Login Streak | — | ❌ | Phase 4 |
| Daily Challenge (seeded runs) | — | ❌ | Phase 4 |
| Daily Leaderboard | — | ❌ | Phase 4 |
| Weekly Boss Rotation (stretch) | — | ❌ | Phase 5 |

---

## 15. Monetization (GDD §18)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Rewarded Video placements | — | ❌ | Phase 4 |
| Interstitial ad system | — | ❌ | Phase 4 |
| IAP (remove ads, core packs) | — | ❌ | Phase 4 |
| AdManager stub | — | ❌ | Phase 4 |

---

## 16. Audio (GDD §19)

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| All audio SFX | — | ❌ | Not started, needs audio asset pipeline |

## 17. Testing & Quality Assurance

| Feature | File(s) | Status | Notes |
|---|---|---|---|
| Vitest configuration | `vitest.config.ts`, `package.json` | ✅ | |
| Player unit tests | `entities/Player.test.ts` | ✅ | Covers dash, armor, lifesteal, regen |
| Enemy unit tests | `entities/Enemy.test.ts` | ✅ | Covers Shielder block, Shooter attack, scaling |
| Projectile unit tests | `entities/Projectile.test.ts` | ✅ | Covers collisions, crits, splash, bounce |
| WeaponSystem unit tests | `systems/WeaponSystem.test.ts` | ✅ | Covers cooldown, damage calc, spread logic |
| WaveManager unit tests | `systems/WaveManager.test.ts` | ✅ | Covers weighted spawning and time progression |
| ApexSystem unit tests | `systems/ApexSystem.test.ts` | ✅ | Covers meter states, time slow, invincibility |
| EvolutionSystem unit tests | `systems/EvolutionSystem.test.ts` | ✅ | Covers passive-weapon requirements |
| Collectibles unit tests | `entities/Collectible.test.ts` | ✅ | Covers magnet radius and pickup logic |
| Particles unit tests | `entities/Particles.test.ts` | ✅ | Covers floating text and shard gravity |
| Upgrades unit tests | `data/upgrades.test.ts` | ✅ | Covers application logic for perm + run |

---

## Implementation Phases

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Critical fixes (armor, crits, lifesteal, safety net, missing upgrades) | ✅ |
| **Phase 2** | Enemy diversity (7 types, weighted spawns) | ✅ |
| **Phase 3** | Particles, floating text, visual feedback | ✅ |
| **Testing** | Comprehensive unit test suite for Phase 1-3 features via Vitest | ✅ |
| **Phase 4** | Weapon evolution effects, Drone entity, cosmetics, daily systems | ✅ |
| **Phase 5** | Boss system, boss entities, retention, monetization | ❌ |
| **Phase 6** | Firebase Leaderboards, Auth, Cloud Saves, Realtime Analytics | ✅ |

## Pre-Deployment Checklist (Important Reversions)

Before pushing the game to production on Firebase Hosting, the following testing overrides must be reverted or addressed:

- [ ] **Cosmetics Testing Override:** In `src/core/SaveManager.ts`, the `hasCosmetic(id: string)` method is currently hardcoded to `return true;` to unlock all cosmetics for testing. This must be reverted to check the actual `this.unlockedCosmetics` array.
- [ ] **PRNG Override (Daily Challenge):** If `Math.random` is being overridden for testing daily challenges in `main.ts`, ensure it is only active in the daily challenge mode and not affecting standard runs.
- [ ] **Firebase Security Rules:** Ensure Firestore security rules are strictly locked down to prevent unauthorized writes to `leaderboard` and `run_logs` collections (e.g., validate the schema and rate-limit if possible).
- [ ] **Analytics Logging Costs:** Monitor the `run_logs` collection size and document write limits to ensure the free tier quota is not exceeded.
- [ ] **Anonymous User Auth:** We currently fallback to "Anonymous" if no display name is entered. For a full production launch, ensure the name prompt accurately enforces saving or links to Firebase anonymous auth UID if needed.

