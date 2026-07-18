# APEX SWARM — Game Design Document

> **Version:** 2.0
> **Last Updated:** 2026-06-21
> **Platforms:** Web (Vite + TypeScript) → Android (Android Studio / Capacitor)
> **Genre:** Bullet Heaven / Auto-Shooter Survival
> **Target Audience:** Mobile Gamers (16–35), fans of Vampire Survivors, Holocure, Brotato
> **Status:** Full redesign pass — addresses content depth, USP mechanics, and monetization health found in v1.2

---

## Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Core Pillars & Player Promise](#2-core-pillars--player-promise)
3. [Game Loop](#3-game-loop)
4. [Player Character](#4-player-character)
5. [Weapon System](#5-weapon-system)
6. [Passive Items](#6-passive-items)
7. [Weapon Evolution System](#7-weapon-evolution-system)
8. [Enemy Roster](#8-enemy-roster)
9. [Boss & Elite Encounters](#9-boss--elite-encounters)
10. [In-Run Progression & Leveling](#10-in-run-progression--leveling)
11. [Power Upgrades (Meta-Progression)](#11-power-upgrades-meta-progression)
12. [APEX MODE — The Core USP](#12-apex-mode--the-core-usp)
13. [Collectibles & Currencies](#13-collectibles--currencies)
14. [Retention Systems (Daily Loop)](#14-retention-systems-daily-loop)
15. [UI & Screens](#15-ui--screens)
16. [Difficulty & Balancing Philosophy](#16-difficulty--balancing-philosophy)
17. [Technical Architecture](#17-technical-architecture)
18. [Monetization Strategy](#18-monetization-strategy)
19. [Audio Direction](#19-audio-direction)
20. [Visual Direction](#20-visual-direction)
21. [Success Metrics & Targets](#21-success-metrics--targets)
22. [Development Roadmap](#22-development-roadmap)
23. [Changelog](#23-changelog)

---

## 1. Executive Summary & Vision

**Apex Swarm** is a portrait-mode, hyper-fast "Bullet Heaven" survival game. The player controls a lone Cyber-Warrior who auto-attacks endless swarms of neon-glitch enemies, growing in power through per-run draft upgrades and unlocking permanent buffs through meta-progression.

> **Tagline:** *"You are the swarm. Until you're the apex."*

The genre is crowded. To compete, Apex Swarm needs one mechanic that is unmistakably its own, plus enough build depth and content cadence to support 15–20 minute runs played daily over months. This version of the GDD restructures the game around a single design thesis:

> **Every system in this document should answer one question: does this make the Apex Meter more interesting to manage?**

Where v1.2 treated APEX MODE as a one-time panic button triggered automatically at low HP, this version turns it into a **player-controlled risk/reward resource** — something the player builds, banks, times, and masters, which is what survival-roguelite players actually return for. Everything else (weapons, passives, enemies, bosses, meta-upgrades, monetization) is redesigned to feed into or interact with that resource.

---

## 2. Core Pillars & Player Promise

| Pillar | Description |
|---|---|
| **Feel-Good Auto-Combat** | The player never aims manually. Satisfaction comes from positioning, kiting, and upgrade synergy, not twitch aim. |
| **Build Diversity** | No two runs should draft the same way. Weapons, passives, and evolutions create distinct strategic identities (Orbit-tank, Glass-cannon Missiles, Chain-lightning Crowd-control, etc.). |
| **The Apex Meter (USP)** | A persistent, visible, player-managed resource that turns every run into a rhythm of *build meter → decide when to spend it*. This replaces the old "auto-trigger at 25% HP" design. |
| **Readable Escalation** | Power, threat, and spectacle all increase in lockstep so the player always feels the run getting harder *and* feels personally stronger to match it. |
| **30-Second Hook, 100-Hour Ceiling** | Understandable immediately; mastery (optimal evolution paths, Apex timing, boss routing) takes months. |

### 2.1 The One-Sentence Pitch
*"A Vampire-Survivors-style auto-shooter where you manually decide when to detonate your built-up power into an invincible, lifesteal-fueled rampage — bank it too long and you might die first; pop it too early and you'll have nothing left for the boss."*

---

## 3. Game Loop

### 3.1 Macro Loop (Meta, across sessions)

```
OPEN APP
    │
    ▼
Daily Login Bonus + Daily Challenge offered
    │
    ▼
START RUN (Standard or Daily Challenge)
    │
    ▼
[RUN LOOP — see 3.2]
    │
    ▼
GAME OVER → Earn Credits + Cores (rare)
    │
    ▼
Power Upgrades Shop (Credits) / Cosmetics Shop (Cores)
    │
    ▼
START RUN AGAIN (stronger) — or close app, return tomorrow for streak
```

### 3.2 Micro Loop (Within a single run)

```
SURVIVE
    │
    ├─→ Kill Enemies → Drop XP Gems / Credits / fill Apex Meter slightly
    │
    ├─→ Level Up → Draft 3 of 4 random Weapon/Passive upgrades → Choose 1
    │
    ├─→ Apex Meter fills (kills, survival time, damage taken)
    │        │
    │        ▼
    │   Player CHOOSES to activate APEX MODE (manual trigger)
    │        │
    │        ▼
    │   8s of invincible, lifesteal, ×3 damage rampage
    │        │
    │        ▼
    │   Meter resets → begins refilling
    │
    ├─→ Boss/Elite encounter every 5 minutes (telegraphed, gated arena)
    │
    └─→ HP reaches 0 → GAME OVER (unless Continue via rewarded ad is offered once)
```

The key structural change from v1.2: **the Apex Meter is now a constant on-screen UI element the player is always making a decision about**, not a one-time scripted event. This is what creates session-to-session mastery and is the loop the rest of this document is built to support.

---

## 4. Player Character

### 4.1 Base Stats

| Stat | Base Value | Description |
|---|---|---|
| HP | 100 | Reduced by enemy contact and projectiles. No passive regen by default (regen is purchasable, see §11). |
| Speed | 180 px/s | Movement toward touch/pointer position. |
| Damage Multiplier | ×1.0 | Applied to all weapon damage. |
| Fire Rate Multiplier | ×1.0 | Applied to all weapon cooldowns. |
| Armor | 0 | Flat damage reduction per hit (purchasable). |
| Magnet Radius | 60 px | XP/Credit pickup radius. |
| **Apex Meter** | 0 / 100 | New core resource. See §12. |

### 4.2 Movement
- The player moves toward the touch pointer / mouse cursor position; movement stops within 5px of the target.
- Movement is capped to screen boundaries with a radius buffer.
- **New:** brief (0.15s) directional dash is available once per 4 seconds via double-tap, primarily as a flanking tool against shielded enemies (see §8) and a defensive option outside Apex Mode. This gives the player agency in the 90%+ of the run where they are *not* invincible, which v1.2 lacked entirely.

### 4.3 Auto-Attack
- All equipped weapons fire automatically via `WeaponSystem`.
- Default weapon: **Kinetic Blaster**, fires at the nearest living enemy.
- Up to **6 active weapon slots** and **6 passive slots** can be held at once (see §5–§6), forcing real drafting decisions rather than "take everything."

### 4.4 Apex Mode
- See Section 12 in full — this is the headline system of the game.

---

## 5. Weapon System

Weapons are drafted during level-up and can be leveled from 1→8. At level 8, a weapon paired with its matching passive (see §7) can **evolve** into a unique super-weapon.

### 5.1 Kinetic Blaster (Starting Weapon)
- **Fire Rate:** 0.5s → 0.2s at max level
- **Damage:** 25 base → scales +15% per level
- **Mechanic:** Fires one projectile at the nearest enemy, gains +1 projectile every 2 levels (fan spread at 3+).
- **Evolution:** *Railgun Array* (with Targeting Module passive) — fires a piercing line-beam through all enemies in a lane.

### 5.2 Plasma Orbit
- **Damage:** 15/hit base, scales with level
- **Mechanic:** Orbiting plasma orbs around the player; +1 orb per 2 levels (max 6 at level 8).
- **Evolution:** *Singularity Ring* (with Mass Core passive) — orbs merge into a single rotating ring that also pulls nearby enemies inward (mini-gravity well).

### 5.3 Chain Lightning
- **Damage:** 40 base, −20% per chain jump
- **Mechanic:** Chains between +1 additional enemy per level (max 6 targets at level 8).
- **Evolution:** *Storm Front* (with Conductor Coil passive) — converts into a periodic screen-wide chain pulse that also briefly stuns hit enemies.

### 5.4 Missile Barrage
- **Damage:** 80/hit base
- **Mechanic:** Homing missile; +1 missile per 2 levels, splash radius increases with level.
- **Evolution:** *Apocalypse Pod* (with Warhead passive) — missiles cluster-split into 3 sub-munitions on impact.

### 5.5 New Weapon — Glitch Scythe (melee arc)
- **Description:** A wide melee arc swing in the direction of nearest enemy cluster.
- **Damage:** 35 base, hits all enemies in the arc
- **Fire Rate:** 0.8s
- **Mechanic:** Damage scales with number of enemies hit (+5% per additional target, up to +50%), rewarding aggressive positioning — this is the build that synergizes with tanking via Armor passives rather than kiting.
- **Evolution:** *Reality Tear* (with Bloodline Edge passive) — arc becomes a full 360° pulse with lifesteal on every hit.

### 5.6 New Weapon — Drone Swarm
- **Description:** Deploys up to 3 small autonomous drones that independently target and fire at enemies.
- **Damage:** 10/hit per drone, low but high uptime
- **Mechanic:** Drones have their own small HP pool and can be destroyed by enemy contact, then respawn after 5s — introduces a sustain/attrition build identity distinct from the others.
- **Evolution:** *Hive Mind* (with Swarm Link passive) — drone count uncapped (scales with kills this run, soft-capped at 8), each drone gains a slow tracking laser.

### 5.7 Weapon Design Rationale
v1.2 had four weapons, all flat stat-scalers with no build identity beyond "more damage." Six weapons across distinct combat fantasies (precision single-target, contact AoE, chain CC, splash/burst, melee aggression, sustained attrition) gives drafting genuine stakes — picking Glitch Scythe over Missile Barrage should feel like committing to a playstyle, not just a number.

---

## 6. Passive Items

Passives never deal damage directly; they modify stats, weapons, or the Apex Meter. Six can be held at once. Each has a matching weapon for evolution purposes, but all passives provide stand-alone value too.

| ID | Name | Icon | Base Effect (scales ×5 levels) | Evolution Partner |
|---|---|---|---|---|
| `targeting_module` | Targeting Module | 🎯 | +10% crit chance, +25% crit damage | Kinetic Blaster |
| `mass_core` | Mass Core | 🌀 | +10% orbit weapon size & damage | Plasma Orbit |
| `conductor_coil` | Conductor Coil | 🔗 | +15% chain range, −10% chain falloff | Chain Lightning |
| `warhead` | Warhead | 💥 | +20% splash radius on explosive weapons | Missile Barrage |
| `bloodline_edge` | Bloodline Edge | 🩸 | +4% lifesteal on melee hits | Glitch Scythe |
| `swarm_link` | Swarm Link | 📡 | +1 drone HP regen/s, −10% drone respawn time | Drone Swarm |
| `iron_plate` | Iron Plate | 🛡️ | +3 flat Armor | — (general defense) |
| `apex_capacitor` | Apex Capacitor | 🔋 | +8% faster Apex Meter fill rate | — (Apex synergy, see §12) |
| `momentum_drive` | Momentum Drive | 👟 | +6% Move Speed, +1 dash charge max | — (general mobility) |
| `vampiric_core` | Vampiric Core | ❤️ | Heal 1% of damage dealt as HP (all sources) | — (general sustain) |

This gives 6 weapons × 4 evolution-eligible passives + 4 general passives = real combinatorial depth (a player choosing between rushing one evolution vs. spreading stats across two weapons), which was entirely absent in v1.2's flat +X% pool.

---

## 7. Weapon Evolution System

This is new in v2.0 and is the primary lever for late-run power spikes and build identity, modeled on the genre's most successful retention mechanic.

### 7.1 Requirements
A weapon evolves automatically (with a full-screen cinematic flash + SFX sting, not a draft choice) when **both** conditions are met simultaneously:
1. The weapon is at Level 8 (max).
2. Its matching passive is at Level 5 (max).

### 7.2 Why This Matters
- Creates a clear mid-to-late-run goal state the player can plan toward from level 5–6 onward ("I need 3 more Plasma Orbit levels and 2 more Mass Core levels").
- Evolutions are visually and mechanically distinct, not just bigger numbers — this is the single highest-leverage addition for making 15-minute runs feel like they have a narrative arc (early scramble → mid-game build commitment → late-game evolved power fantasy → Apex-fueled finish).
- Directly supports the Apex Meter design: most evolutions are explicitly tuned to be **at their best during Apex Mode** (e.g., Reality Tear's lifesteal pulse synergizes with Apex's own lifesteal — see §12.4), so reaching an evolution and banking an Apex charge together is the peak "build moment" of a run.

### 7.3 Evolution Slots
A player can have multiple evolved weapons in one run if they commit enough drafts, but the draft pool intentionally narrows (fewer offers of unrelated weapons) once the player has flagged a clear specialization, encouraging — not forcing — focused builds.

---

## 8. Enemy Roster

### 8.1 Scaling Formula
All enemy stats scale with `timeScale = 1 + (survivalTime / 60)`, unchanged from v1.2, but enemy **variety** now extends across the full run instead of stopping at minute 3.

### 8.2 Enemy Types

| Enemy | Shape | Color | HP | Speed | Damage | Unlocks At | Behavior |
|---|---|---|---|---|---|---|---|
| **Swarmer** | Square | Red `#ef4444` | 30×scale | 50–90×scale | 10 | 0:00 | Chases directly, self-destructs on contact. |
| **Brute** | Large Circle | Orange `#f97316` | 150×scale | 30×scale | 25 | 1:00 | Slow, high HP, walks directly at player. |
| **Shooter** | Diamond | Purple `#a855f7` | 60×scale | 20×scale | 15 | 2:00 | Keeps distance, fires 1 projectile every 2s toward player. |
| **Shielder** | Hexagon | Cyan `#06b6d4` | 80×scale | 40×scale | 10 | 3:00 | **Redesigned — see 8.3.** |
| **Phasewraith** *(new)* | Triangle | Violet `#8b5cf6` | 50×scale | 70×scale | 20 | 5:00 | Teleports 150px toward the player every 3s if line of sight is broken; punishes pure kiting builds and rewards AoE. |
| **Bulwark Drone** *(new)* | Octagon | Steel `#94a3b8` | 200×scale | 25×scale | 15 | 7:00 | Periodically casts a 2s damage-reduction shield on itself (telegraphed by a visible charge-up ring); reward burst weapons that can break it before it completes. |
| **Glitch Swarm** *(new)* | Tiny Squares (×5 cluster) | Magenta `#ec4899` | 8×scale each | 100×scale | 6 each | 9:00 | Spawns in clusters of 5, very low HP but high contact frequency; exists to make AoE weapons (Glitch Scythe, evolved orbits) feel powerful, and to punish single-target-only builds. |

### 8.3 Shielder Fix (Critical v1.2 Bug)
**Problem identified in v1.2:** the Shielder was both "immune from the front" and "a direct chaser," which by definition means its front always faces the player — making it mathematically unkillable by any ranged weapon, since `WeaponSystem` fires from the player's position outward.

**v2.0 fix:** the Shielder now **strafes in a slow arc** around its current target rather than beelining at it, actively trying to keep its shielded front oriented toward the *nearest threat source*, but its turn rate (90°/s) is slow enough that:
- A player using the new **dash** (§4.2) can reposition behind it faster than it can re-orient.
- Orbit-based weapons (Plasma Orbit) and melee arcs (Glitch Scythe) that surround the player will naturally land hits on its exposed rear/sides without any special player input, giving those builds a clear identity advantage against this enemy type.
- A small "weak point" indicator (a brighter cyan facet) is rendered on its rear so the mechanic is legible at a glance, not just a stat the player has to infer.

### 8.4 Spawn Rates
- Base: 1 enemy/second, ramping to 0.1s between spawns by minute 2 (unchanged from v1.2).
- **New:** spawn *composition* shifts over time via weighted tables per enemy type, not just spawn rate — e.g., Glitch Swarm clusters become a larger share of spawns after minute 9, deliberately pushing players toward AoE answers as the run matures.

---

## 9. Boss & Elite Encounters

Entirely new system. v1.2 had no bosses, which left long runs feeling like the same loop with bigger numbers. Bosses give runs a narrative beat structure and are the best natural moments for optional rewarded-ad placements (see §18).

### 9.1 Structure
A boss spawns at fixed survival-time checkpoints: **5:00, 10:00, 15:00, 20:00**, and every 5 minutes thereafter (scaling indefinitely for endless-mode chasers/leaderboard players).

### 9.2 Boss Encounter Flow
1. **Telegraph (3s):** screen darkens slightly at the edges, a directional warning arrow shows the boss's spawn point, audio sting plays.
2. **Arena Lock:** normal enemy spawns pause for the duration of the boss fight (prevents being overwhelmed by two threats at once — this is a readability/fairness rule, not a difficulty reduction, since the boss alone is tuned to be the equivalent threat).
3. **Boss Fight:** 2–3 telegraphed attack patterns (covered below) that the boss cycles through.
4. **Reward:** on death, boss always drops a guaranteed large XP burst, a Credit cache, and a **chest** containing a free reroll of the next 3 level-up drafts (or, if Apex Capacitor passive is held, a partial Apex Meter refill — a deliberate small synergy reward).

### 9.3 Example Bosses (MVP needs minimum 2; ship target 4)

| Boss | Shape Identity | Signature Attack | Counterplay |
|---|---|---|---|
| **The Bulwark Prime** | Giant Hexagon | Slams down 4 telegraphed shockwave rings in sequence | Dash through the gaps between rings; rewards the new dash mechanic directly |
| **Glitchmother** | Pulsing cluster of small shapes | Periodically splits into 6 Glitch Swarm minis, then reforms | Rewards AoE/evolved weapons to clear minis fast before reform heals the boss |
| **Railwraith** *(stretch)* | Elongated diamond | Fires 3 long laser sweeps across the arena in sequence | Pure movement-and-timing test; no weapon is "correct," rewards player skill independent of build |
| **The Apex Mirror** *(stretch, 20:00+)* | Mirrors the player's own silhouette | Copies the player's currently equipped weapons against them | Late-run spectacle fight that directly validates the player's build choices back at them |

### 9.4 Design Rationale
Bosses give Apex Swarm session structure ("I died right before the 10-minute boss, I want to try again") and give the meta-progression shop tangible stakes ("I need 20 more max HP to survive the 15:00 boss"). This is the second-biggest content gap from v1.2 after the Apex Mode rework.

---

## 10. In-Run Progression & Leveling

### 10.1 XP Curve (unchanged, validated as solid)

| Level | XP Needed |
|---|---|
| 1 → 2 | 100 |
| 2 → 3 | 150 |
| 3 → 4 | 225 |
| n → n+1 | prev × 1.5 |

### 10.2 Level-Up Draft
On leveling up, the game pauses and presents **3 of 4 randomly rolled options**, drawn from the combined Weapon + Passive pool (§5, §6), weighted to favor:
- Weapons/passives the player already owns (encourages but doesn't force build commitment toward evolutions).
- At least 1 "fresh" option not yet owned, if slots remain open, so new players are never stuck only being offered things they don't have room for.

### 10.3 New: Reroll & Banish (Light Roguelite Layer)
- **1 free reroll per run** (re-rolls the current 3 choices), purchasable as a permanent meta-upgrade for additional charges (§11).
- **1 free banish per run** (permanently removes one item from this run's draft pool, e.g., banish a weapon type you don't want), same upgrade path.
This single addition is a well-tested genre-standard lever for giving players a feeling of agency over RNG without removing the RNG entirely, and was completely absent in v1.2.

---

## 11. Power Upgrades (Meta-Progression)

Permanent upgrades purchased between runs using **Credits**.

### 11.1 Shop Menu Layout
Unchanged structurally from v1.2 — full-screen modal, grid of cards (Icon, Name, Description, Current Level, Cost) — this part of the original design was solid.

### 11.2 Expanded Upgrade Tree

| ID | Name | Max Level | Cost/Level | Effect |
|---|---|---|---|---|
| `perm_hp` | Iron Shell | 10 | 50 + (lvl×25) | +10 Max HP/level |
| `perm_dmg` | War Core | 10 | 75 + (lvl×35) | +5% Damage/level |
| `perm_speed` | Drift Engine | 5 | 60 + (lvl×30) | +5% Speed/level |
| `perm_fire_rate` | Rapid Coil | 5 | 80 + (lvl×40) | ×0.95 Fire Rate/level |
| `perm_magnet` | Gem Magnet | 5 | 40 + (lvl×20) | +20px Magnet Radius/level |
| `perm_credits` | Credit Surge | 5 | 90 + (lvl×45) | +10% Credits earned/level |
| `perm_armor` | Plated Hull | 5 | 70 + (lvl×35) | +1 flat Armor/level |
| `perm_regen` | Bio Regen | 5 | 100 + (lvl×50) | +0.2 HP/s regen per level |
| `perm_reroll` | Second Chance | 3 | 120 + (lvl×60) | +1 free reroll/run per level |
| `perm_banish` | Pruning Protocol | 3 | 120 + (lvl×60) | +1 free banish/run per level |
| **`perm_apex_cap`** | **Apex Capacity** | 5 | 110 + (lvl×55) | +10% max Apex Meter overflow (banked meter persists 1 extra second per level into next non-Apex state — see §12.6) |
| **`perm_apex_power`** | **Apex Amplifier** | 5 | 130 + (lvl×65) | +5% Apex Mode damage AND +0.5s Apex duration per level |
| **`perm_apex_fill`** | **Resonance Core** | 5 | 100 + (lvl×50) | +6% Apex Meter fill rate per level |
| `perm_loadout` | Extra Slot | 2 | 200 + (lvl×100) | +1 active weapon OR passive slot per level (player chooses which on purchase) |

The three Apex-specific permanent upgrades are new and intentional — since Apex is now the headline mechanic, the meta-progression shop needs to let dedicated players build toward "I want to be an Apex-focused character," not just generic stat padding. `perm_loadout` is also new and is the single most exciting long-term unlock in the shop (literally more build space), giving end-game players something to grind toward.

### 11.3 Persistence
v1.2 used `localStorage` only — a real LTV risk for an ad-funded mobile game, since uninstalls or device changes silently wipe all progress.

**v2.0 requirement:** `localStorage` remains the source of truth for the web prototype phase, but the Android build must ship with:
- An anonymous device-bound cloud save (e.g., Play Games Services Saved Games, or a lightweight backend) from day one of the Android port.
- A manual "Restore Purchases / Link Account" flow before any IAP is enabled, since unrecoverable paid progress is both a trust and a platform-policy risk.

---

## 12. APEX MODE — The Core USP

This section replaces the v1.2 design wholesale. The old version auto-triggered once at 25% HP with no player agency, which created a contradiction (the "comeback mechanic" did nothing to address the HP problem that caused it) and gave the headline feature zero replay depth. The new version is built to be a resource the player actively manages every single run.

### 12.1 The Apex Meter
- A persistent HUD element, always visible, filling from **0 to 100**.
- Fills from three sources, all visible to the player as small "+" ticks for feedback:
  - **+1 per kill** (small, steady trickle).
  - **+0.4/second** passive survival fill.
  - **+3 per 10% of Max HP lost** in a single hit (this preserves the "danger fuels power" fantasy from v1.2, but as a *contribution* to player choice rather than an automatic override of it).
- At 100, the meter visibly pulses and locks "ready," and a dedicated **APEX button** appears on the HUD (or a swipe-up gesture, platform-dependent).

### 12.2 Manual Trigger (Core Change)
The player taps the Apex button whenever they choose, once the meter is full. This is the single most important design change in this document:
- **Banking:** a player can choose to sit on a full meter, accepting risk, if they want to save it for an incoming boss telegraph.
- **Panic Use:** a player can also choose to pop it the instant it's full, prioritizing the immediate fight over future ones.
- This converts Apex from a scripted cutscene into a **skill expression and decision point**, which is the actual retention hook of the genre's best "ultimate ability" systems — the mastery curve is in learning *when*, not just *that*, to use it.

### 12.3 Safety Net (Not a Replacement)
If the player's HP would hit 0 while the Apex Meter is at 100 (full) and unused, the game auto-triggers Apex Mode instead of ending the run — a last-resort save, not the primary trigger. This preserves the "miracle comeback" fantasy from v1.2 for new/struggling players without making it the *only* way experienced players get to experience the mechanic.

### 12.4 Effects During APEX MODE

| Effect | Value | Change from v1.2 |
|---|---|---|
| Duration | 8s base (+0.5s per Apex Amplifier level, §11.2) | Same base, now scalable |
| Damage Multiplier | ×3.0 | Unchanged |
| Speed Multiplier | ×1.5 | Unchanged |
| Invincibility | YES | Unchanged |
| Fire Rate | ×0.4 (2.5× faster) | Unchanged |
| **Lifesteal** | **Heal 15% of all damage dealt as HP** | **New.** This is the critical fix — it directly resolves the v1.2 flaw where Apex ended and the player was immediately back in HP-crisis. Now an aggressive, well-timed Apex use can meaningfully refill the player's HP bar, making it a genuine comeback tool again, just one the player has to use *well* rather than receive automatically. |
| Visual | Pulsing red/gold screen edge, white player pulsate, red enemy outlines | Unchanged, validated as good |
| Audio | High-energy cinematic sting | Unchanged |

### 12.5 Transition Sequence (unchanged, validated as good)
1. Trigger → 0.4s time-slow (timeScale → 0.1)
2. Screen flash white → expanding ring burst from player
3. Time resumes → APEX MODE active
4. On expiry → "APEX FADING" warning (1s) → return to normal stats
5. Normal damage resumes

### 12.6 Apex Overflow (New, supports `perm_apex_cap`)
If the meter is already full and the player chooses not to trigger it, additional fill beyond 100 is banked as "Overflow" up to a cap (base 0%, extendable via meta-upgrade). On the next Apex trigger, banked Overflow extends the *duration* of that activation by a proportional amount. This rewards disciplined banking play without being mandatory to understand for casual players.

### 12.7 Why This Is a Stronger USP
The pitch in §1 only works if Apex Mode is something the player is making a meaningful decision about multiple times per run, not something that happens to them once. A chargeable, player-triggered, lifesteal-augmented ultimate with optional banking is differentiated from both the "no special ability" baseline of Vampire Survivors and the purely-cosmetic ultimates seen in some competitors — it's mechanically load-bearing, marketable in a 15-second trailer clip, and gives the game's subreddit/Discord something to theorycraft about ("optimal Apex banking for the 15:00 boss"), which is exactly the kind of hook ad-funded F2P games need for organic, non-paid retention.

---

## 13. Collectibles & Currencies

| Item | Color | Source | Effect |
|---|---|---|---|
| XP Gem | Green `#4ade80` | Enemy death (50% chance) | +35 XP. Magnetized at ≤ Magnet Radius. |
| Credit | Amber `#fbbf24` | Enemy death (10% chance), boss drops, run milestones | Spent in Power Upgrades shop. |
| **Core** *(new)* | Pink/Iridescent `#f0abfc` | Rare drop (~1 per 3–4 minutes survived), daily challenge reward, boss chest | Premium soft currency, spent **only on cosmetics** (skins, projectile trails, victory poses) — never on power, to keep the meta-progression shop fair and avoid pay-to-win perception. |
| Apex Shard *(new, cosmetic feedback only)* | Red/Gold sparkle | Spawns briefly when Apex Mode is active | Purely visual flourish particle, no mechanical effect; reinforces the "this moment matters" feeling of Apex Mode. |

---

## 14. Retention Systems (Daily Loop)

Entirely new section. v1.2 had no reason for a player to specifically return *today* versus *whenever* — a real gap for an ad-funded game where DAU and session count drive revenue as much as session length does.

### 14.1 Daily Login Streak
- Day 1–6: escalating small Credit rewards.
- Day 7: a guaranteed Core reward + a cosmetic fragment.
- Streak resets on a missed day but **never resets meta-progression** — this is purely a bonus layer, never a punishment layer, to avoid anxiety-driven engagement patterns.

### 14.2 Daily Challenge
- One seeded, fixed-modifier run per day (e.g., "Drone Swarm start, double Brute spawn rate, no HP regen upgrades active").
- Same enemy seed for all players that day, enabling a simple daily leaderboard (survival time or score) — a strong, low-cost driver of daily return visits and light social competition without needing full multiplayer infrastructure.
- Reward: guaranteed Core + bonus Credits, independent of standard-run economy.

### 14.3 Weekly Boss Rotation (Stretch)
- One boss from §9.3 is flagged "Boss of the Week" with a small cosmetic-only bonus for defeating it that week, encouraging players to revisit content they may have skipped.

---

## 15. UI & Screens

| Screen | ID | Description |
|---|---|---|
| **Main Menu** | `#main-menu` | Logo, "Start Run", "Daily Challenge" (with streak indicator), "Power Upgrades", "Cosmetics" |
| **HUD** | `#hud` | HP bar, XP bar, Level, Survival Timer, **Apex Meter + trigger button** (now a primary, persistent HUD element, not a hidden background stat) |
| **Level Up Draft** | `#levelup-screen` | 3 cards + Reroll/Banish buttons (if unlocked). Game paused. |
| **Boss Telegraph** | `#boss-warning` | Directional arrow + boss name card, 3s before spawn |
| **Power Upgrades** | `#power-upgrades-screen` | Full-screen shop, all permanent upgrades incl. new Apex tree |
| **Cosmetics Shop** | `#cosmetics-screen` *(new)* | Core-currency-only shop, skins/trails/poses, clearly separated from the power shop |
| **Apex Mode Banner** | `#apex-banner` | Animated banner during Apex Mode, now also shows live lifesteal/HP feedback |
| **Daily Challenge** | `#daily-screen` *(new)* | Today's modifiers, leaderboard, claim status |
| **Game Over** | `#gameover-screen` | Survival time, Credits/Cores earned, weapon/evolution summary ("Run Report"), optional rewarded-ad Continue offer, "Try Again", "Upgrades" |

---

## 16. Difficulty & Balancing Philosophy

New section — v1.2 had a spawn-rate ramp but no stated design intent behind it.

### 16.1 Target Run Length
- **Average run (mid-skill, moderately upgraded player):** 12–18 minutes to death.
- **Skilled/well-upgraded player, no Apex misuse:** can reasonably reach the 20:00 boss checkpoint.
- This range is chosen deliberately: long enough to fit multiple boss encounters and a full evolution arc, short enough to support multiple sessions per day on mobile.

### 16.2 DPS Budget Framing
Each enemy tier should be tunable against a reference "expected player DPS at time T," derived from the median weapon/passive loadout at that survival time in playtesting — rather than hand-tuned per-enemy in isolation. This is a process note for the balance pass, not a hard number to ship with; it should be validated and adjusted through playtesting telemetry once the Android build can log run data.

### 16.3 Apex Pacing
The Apex Meter fill rate (§12.1) should be tuned so an average player reaches their **first** full meter between 1:30–2:30 into a run, and roughly every 90–120 seconds thereafter assuming steady combat — frequent enough to be a constant strategic layer, not a once-per-run event.

---

## 17. Technical Architecture

### 17.1 Project Structure (Web Phase, Updated)

```
apex-swarm-web/
├── src/
│   ├── engine/
│   │   ├── GameLoop.ts
│   │   ├── InputManager.ts      # + dash gesture detection
│   │   └── Renderer.ts
│   ├── entities/
│   │   ├── Player.ts            # + Apex Meter state, lifesteal, dash charges
│   │   ├── Enemy.ts             # + strafe AI (Shielder), teleport AI (Phasewraith)
│   │   ├── Boss.ts              # NEW — attack pattern state machine
│   │   ├── Drone.ts             # NEW — Drone Swarm sub-entity, own HP/respawn
│   │   ├── Projectile.ts
│   │   └── Collectible.ts       # + Core drops, Apex Shard particles
│   ├── systems/
│   │   ├── WeaponSystem.ts      # + evolution checks
│   │   ├── EvolutionSystem.ts   # NEW — watches weapon+passive level pairs
│   │   ├── WaveManager.ts       # + weighted spawn composition over time
│   │   ├── BossSystem.ts        # NEW — checkpoint scheduling, arena lock
│   │   ├── ApexSystem.ts        # REWORKED — manual trigger, overflow, lifesteal
│   │   └── DailyChallengeSystem.ts  # NEW — seeded modifiers, leaderboard fetch
│   ├── ui/
│   │   ├── UIManager.ts
│   │   ├── PowerUpgradesUI.ts
│   │   ├── CosmeticsUI.ts       # NEW
│   │   ├── LevelUpUI.ts         # + reroll/banish buttons
│   │   └── ApexHUD.ts           # NEW — persistent meter + trigger button
│   ├── data/
│   │   ├── weapons.ts           # NEW — 6 weapons incl. evolutions
│   │   ├── passives.ts          # NEW
│   │   ├── bosses.ts            # NEW
│   │   └── enemies.ts
│   ├── core/
│   │   ├── SaveManager.ts       # + cloud-save hook stub for Android phase
│   │   └── AdManager.ts         # NEW — stub, see §18
│   └── main.ts
├── index.html
├── vite.config.ts
└── package.json
```

### 17.2 Game State Machine (Updated)

```
START → PLAYING → LEVELUP → PLAYING → ...
                ↘ BOSS_ENCOUNTER → PLAYING
                ↘ APEX_MODE (player-triggered OR safety-net) → PLAYING
                                                              ↘ GAMEOVER → (optional) CONTINUE_OFFER → PLAYING
```

### 17.3 Testing Strategy
Unchanged in spirit from v1.2, expanded in scope:
- **Unit Tests** (`*.test.ts`): entity math, XP curve, damage calc, **Apex Meter fill/overflow math**, evolution-trigger conditions.
- **Integration Tests**: WeaponSystem targeting, BossSystem pattern cycling, ApexSystem manual-trigger + safety-net edge cases (e.g., meter exactly at 100 when lethal damage lands).
- **System Tests**: full headless run (start → boss → levelup → apex trigger → game over).
- **Build Validation**: TypeScript compile + Vite production build.
- **Tool:** Vitest.

---

## 18. Monetization Strategy

v1.2's plan (forced interstitial every 3rd run, regardless of context) is replaced with a **rewarded-first, opt-in model**, which is the healthier pattern for retention-sensitive bullet-heaven audiences since players choose when to see an ad rather than having sessions interrupted unpredictably.

### 18.1 Rewarded Video Touchpoints (Primary)
| Placement | Trigger | Reward |
|---|---|---|
| Continue Run | On Game Over, offered once per run max | Revive at 50% HP, Apex Meter unchanged |
| Double Rewards | On Game Over screen | 2× Credits/Cores earned this run |
| Instant Apex Fill | Optional button on HUD, capped at 1 use/run | Fully fills Apex Meter once |
| Extra Daily Attempt | Daily Challenge screen | One additional attempt at today's seeded run |
| Bonus Draft | Rare level-up screen prompt (not every level-up) | A 4th draft option for that level-up only |

### 18.2 Interstitials (Secondary, Capped)
- Replace the flat "every 3rd run" rule with a **frequency-capped, context-aware** rule: only shown after Game Over, never mid-run, with a minimum session-count and time-based cooldown between impressions (exact cadence to be tuned against retention data once analytics are live — this should not be hard-coded without A/B validation).
- Never shown to a player within their first 2 sessions (protects Day-1 retention while the player is still forming a habit).

### 18.3 IAP
| Type | Notes |
|---|---|
| Remove Interstitials | One-time purchase, does not affect rewarded-ad availability (player can still opt in for rewards) |
| Core Packs | Cosmetics-only currency, explicitly never sells power, stats, or upgrades |
| Cosmetic Bundles | Skins, trails, Apex visual effects — direct purchase alternative to grinding Cores |
| Starter Pack *(stretch)* | One-time, modest, time-limited bundle of Credits + a cosmetic, standard genre convention for early monetization without being predatory |

### 18.4 Guiding Principle
No IAP or ad path should ever sell a power advantage in standard runs or affect the Daily Challenge leaderboard (which must remain ad/IAP-neutral to keep its competitive integrity). This is a deliberate trust-building constraint, not a missed revenue opportunity — leaderboard integrity and a non-predatory monetization reputation are what sustain an ad-funded game's organic install base over time.

---

## 19. Audio Direction

| Sound | Trigger | Notes |
|---|---|---|
| Shoot SFX | Every bullet fired | Should vary per weapon for build identity |
| Enemy Death SFX | Enemy HP ≤ 0 | Layered/pitched up during Glitch Swarm clears for satisfying AoE feedback |
| Gem/Credit/Core Collect SFX | Pickup | Distinct tones per currency tier |
| Level Up SFX | Level-up screen opens | |
| **Apex Meter Full Ping** *(new)* | Meter reaches 100 | Distinct "ready" chime — critical, since this now needs to clearly signal an available player decision, not just flavor |
| APEX Trigger SFX | Player activates Apex Mode | Cinematic sting |
| APEX Loop BGM | During Apex Mode | High-energy layer over base track |
| **Boss Telegraph Sting** *(new)* | 3s warning before boss spawn | |
| **Evolution Trigger Fanfare** *(new)* | Weapon evolves | Should feel as significant as a level-up, arguably more |

---

## 20. Visual Direction

- **Color Palette:** Dark navy background (`#0f172a`), cyan/blue player, red enemies (with new accent colors per §8.2 for variety), green gems, amber credits, pink/iridescent Cores.
- **Style:** Neon-glow geometric primitives, no sprites in MVP, `shadowBlur` glow throughout — validated as a strong, performant, distinctive look; keep for the full content expansion.
- **Player:** Glowing cyan circle, white inner core, pulsing during Apex Mode; **new** — subtle persistent meter-fill glow intensity as the Apex Meter approaches 100%, so readiness is communicated through the character itself, not just the HUD.
- **Bosses:** Larger, more geometrically complex silhouettes than standard enemies (compound shapes) so they read as significant at a glance even before HP bars are visible.
- **Background:** Subtle parallax grid, scrolls opposite player direction.
- **Particles:** Square burst particles on death/impact; new Apex Shard sparkle particles during Apex Mode (§13).
- **Floating Text:** Damage numbers, "+XP" popups; new lifesteal "+HP" popups during Apex Mode for clear feedback on the new mechanic.

---

## 21. Success Metrics & Targets

These are **illustrative starting targets for internal alignment and playtesting validation**, not industry benchmarks — they should be replaced with real targets once analytics are live post-soft-launch, and treated as hypotheses to test rather than committed numbers.

| Metric | Initial Target (to validate) | Why It Matters Here |
|---|---|---|
| Average Session Length | 12–18 min | Matches the tuned run length in §16.1 |
| Sessions per DAU | 2+ | Validates the daily loop (§14) is pulling players back same-day |
| D1 / D7 / D30 Retention | Track and compare cohorts before/after each content drop (bosses, evolutions) | More useful as a relative measure across updates than an absolute number pre-launch |
| Apex Mode Uses per Run | 2–4 | If this is consistently 0–1, the meter fill rate (§16.3) is mistuned and the USP isn't landing |
| Rewarded Ad Opt-In Rate | Track per placement (§18.1) | A low opt-in rate on "Continue Run" specifically would signal the reward isn't valuable enough relative to ad friction |
| Daily Challenge Participation | Track % of DAU | Direct signal on whether §14.2 is actually driving the daily habit it's designed for |

---

## 22. Development Roadmap

| Phase | Scope | Notes |
|---|---|---|
| **Phase 0 — Core Loop (current/MVP)** | Player, 2–3 weapons, base enemies, basic Apex (even the v1.2 auto-trigger version is an acceptable placeholder here), localStorage save | Get the feel right before adding content breadth |
| **Phase 1 — USP Pass** | Full Apex Mode rework (§12), dash mechanic, all 6 weapons + evolutions, all 10 passives | This phase is where the game becomes differentiated; do not skip to monetization before this lands |
| **Phase 2 — Content Depth** | Full enemy roster incl. Phasewraith/Bulwark Drone/Glitch Swarm, 2 bosses minimum, reroll/banish | Validates the 15–20 min run length target |
| **Phase 3 — Android Port** | Capacitor/native wrapper, cloud save, touch input polish, performance pass for low-end Android devices | Cloud save must land before any IAP is enabled (§11.3, §17) |
| **Phase 4 — Retention & Monetization** | Daily Challenge, login streak, rewarded ad placements, Core/Cosmetics shop, capped interstitials | Monetization intentionally comes after the loop and content are proven, not before |
| **Phase 5 — Live Ops** | Remaining stretch bosses, Weekly Boss Rotation, seasonal cosmetic drops, balance iteration from telemetry | Ongoing post-launch |

---

## 23. Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-06-21 | Initial GDD from prototype analysis |
| 1.1 | 2026-06-21 | Added APEX MODE USP, Power Upgrades shop |
| 1.2 | 2026-06-21 | Added full enemy roster, weapon definitions, technical architecture |
| **2.0** | **2026-06-21** | **Full redesign pass:** reworked Apex Mode into a manual, chargeable, lifesteal-augmented resource (was: auto-trigger once at 25% HP); added Weapon Evolution System and 2 new weapons (6 total); added Passive Item system (10 passives); added Boss & Elite Encounters (new system, 4 bosses); fixed Shielder "immune from front while chasing" logic contradiction; added Reroll/Banish draft agency; expanded enemy roster across full run length (was front-loaded to 3 min); added Retention Systems (daily login, Daily Challenge, leaderboard); added dash mechanic for non-Apex player agency; replaced forced-interstitial monetization with rewarded-first model and added cosmetic-only premium currency (Core) to avoid pay-to-win; added cloud-save requirement ahead of any IAP; added Difficulty/Balancing philosophy section; added Success Metrics framework; added phased Development Roadmap prioritizing USP and content before monetization. |
