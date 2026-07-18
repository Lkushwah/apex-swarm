import './style.css';

import { GameLoop } from './engine/GameLoop';
import { Renderer } from './engine/Renderer';
import { InputManager } from './engine/InputManager';

import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
import { Collectible } from './entities/Collectible';
import { Particle, FloatingText, ApexShard, createParticles, createApexShards } from './entities/Particles';

import { WeaponSystem } from './systems/WeaponSystem';
import { WaveManager } from './systems/WaveManager';
import { ApexSystem } from './systems/ApexSystem';

import { UIManager } from './ui/UIManager';
import { LevelUpUI } from './ui/LevelUpUI';
import { PowerUpgradesUI } from './ui/PowerUpgradesUI';

import { SaveManager } from './core/SaveManager';
import { PERM_UPGRADES } from './data/upgrades';

// ---- Engine Setup ----
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const inputManager = new InputManager(canvas);
const saveManager = new SaveManager();
const uiManager = new UIManager();

// ---- Game State ----
type GameState = 'MENU' | 'PLAYING' | 'LEVELUP' | 'GAMEOVER';
let gameState: GameState = 'MENU';

let player: Player;
let enemies: Enemy[] = [];
let projectiles: Projectile[] = [];
let collectibles: Collectible[] = [];
let particles: Particle[] = [];
let floatingTexts: FloatingText[] = [];
let apexShards: ApexShard[] = [];
let creditsEarnedThisRun: number = 0;
let killsThisRun: number = 0;

let weaponSystem: WeaponSystem;
let waveManager: WaveManager;
let apexSystem: ApexSystem;

// ---- Sub-UIs ----
const powerUpgradesUI = new PowerUpgradesUI(saveManager, () => uiManager.showMainMenu());
const levelUpUI = new LevelUpUI(() => {
    gameState = 'PLAYING';
});

// ---- Permanent Upgrades Application ----
function applyPermanentUpgrades(p: Player) {
    for (const upg of PERM_UPGRADES) {
        const level = saveManager.getUpgradeLevel(upg.id);
        if (level > 0 && upg.id !== 'perm_credits' && upg.id !== 'perm_reroll' && upg.id !== 'perm_banish'
            && upg.id !== 'perm_apex_cap' && upg.id !== 'perm_apex_power' && upg.id !== 'perm_apex_fill') {
            upg.apply(p, level);
        }
    }
    // Store credit multiplier on player for the run
    const creditLevel = saveManager.getUpgradeLevel('perm_credits');
    p.creditMultiplier = 1 + creditLevel * 0.1;
}

// ---- Start/Restart Game ----
function startGame() {
    const bounds = renderer.getDimensions();
    player = new Player(bounds.width / 2, bounds.height / 2);
    applyPermanentUpgrades(player);

    enemies = [];
    projectiles = [];
    collectibles = [];
    particles = [];
    floatingTexts = [];
    apexShards = [];
    creditsEarnedThisRun = 0;
    killsThisRun = 0;

    // Wire particle/text arrays into Projectile's static feedback system
    Projectile.floatingTexts = floatingTexts;
    Projectile.particles = [];

    weaponSystem = new WeaponSystem(player);
    waveManager = new WaveManager(bounds);
    apexSystem = new ApexSystem(player);

    // Apply Apex perm upgrades to apex system
    const apexPowerLevel = saveManager.getUpgradeLevel('perm_apex_power');
    apexSystem.durationBonus = apexPowerLevel * 0.5;
    apexSystem.damageBonus   = apexPowerLevel * 0.05;

    const apexCapLevel = saveManager.getUpgradeLevel('perm_apex_cap');
    apexSystem.overflowCap = apexCapLevel * 10;

    const apexFillLevel = saveManager.getUpgradeLevel('perm_apex_fill');
    apexSystem.fillRateBonus = apexFillLevel * 0.06;

    // Set reroll/banish charges from perm upgrades
    const rerollLevel = saveManager.getUpgradeLevel('perm_reroll');
    const banishLevel = saveManager.getUpgradeLevel('perm_banish');
    levelUpUI.setCharges(1 + rerollLevel, 1 + banishLevel);

    gameState = 'PLAYING';
    uiManager.showHUD();
}

function handleGameOver() {
    gameState = 'GAMEOVER';
    const credits = Math.floor(
        (waveManager.survivalTime * 0.5 + creditsEarnedThisRun) * player.creditMultiplier
    );
    saveManager.addCredits(credits);
    uiManager.showGameOver(waveManager.survivalTime, credits, player, killsThisRun);
}

// ---- Button Wiring ----
document.getElementById('start-btn')!.addEventListener('click', startGame);
document.getElementById('restart-btn')!.addEventListener('click', startGame);
document.getElementById('power-upgrades-btn')!.addEventListener('click', () => {
    document.getElementById('main-menu')?.classList.add('hidden');
    powerUpgradesUI.show();
});
document.getElementById('go-upgrades-btn')!.addEventListener('click', () => {
    document.getElementById('gameover-screen')?.classList.add('hidden');
    powerUpgradesUI.show();
});
document.getElementById('apex-trigger-btn')!.addEventListener('click', () => {
    if (gameState === 'PLAYING') apexSystem.manualTrigger();
});
window.addEventListener('keydown', (e) => {
    if (gameState !== 'PLAYING') return;
    if (e.code === 'Space') {
        e.preventDefault();
        apexSystem.manualTrigger();
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        player.dash(inputManager.getPointerPosition());
    }
});

let lastTapTime = 0;
window.addEventListener('pointerup', (e) => {
    if (gameState !== 'PLAYING') return;
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    
    const now = performance.now();
    if (now - lastTapTime < 300) {
        apexSystem.manualTrigger();
    }
    lastTapTime = now;
});

// ---- Game Loop ----
const gameLoop = new GameLoop(
    // UPDATE
    (dt) => {
        if (gameState === 'MENU' || gameState === 'LEVELUP') return;
        if (gameState === 'GAMEOVER') return;

        inputManager.update();

        // APEX system: controls timeScale
        apexSystem.addTime(dt); // fill meter
        apexSystem.update(dt);
        const ts = apexSystem.currentTimeScale;
        const scaledDt = dt * ts;

        // APEX banner
        if (apexSystem.getState() === 'ACTIVE' || apexSystem.getState() === 'FADING') {
            const activeDur = 8 + apexSystem.durationBonus;
            const apexTimer = (apexSystem as any).timer as number;
            uiManager.showApexBanner(apexTimer / activeDur);
            
            // Spawn Apex Shards around the player
            if (Math.random() < 0.3) {
                createApexShards(apexShards, player.x + (Math.random() - 0.5) * 40, player.y + (Math.random() - 0.5) * 40, 1);
            }
        } else if (apexSystem.getState() === 'SPENT') {
            uiManager.hideApexBanner();
        }

        const bounds = renderer.getDimensions();

        // Wave & weapons (with effective damage multiplier including APEX bonus)
        waveManager.update(scaledDt, enemies);
        const effectiveDamageBonus = apexSystem.damageMultiplierBonus;
        weaponSystem.apexDamageBonus = effectiveDamageBonus;
        weaponSystem.update(scaledDt, enemies, projectiles);

        // Player
        const canTakeDamage = !apexSystem.isInvincible;
        player.update(scaledDt, inputManager.getPointerPosition(), bounds);

        // Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update(scaledDt, bounds, enemies, apexSystem, player);
            if (p.isDead) { projectiles.splice(i, 1); }
        }

        // Process deferred particle spawns from Projectile.particles
        for (const pd of Projectile.particles) {
            createParticles(particles, pd.x, pd.y, pd.color, pd.count);
        }
        Projectile.particles.length = 0;

        // Enemies
        const hpBefore = player.hp;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            
            // Check if killed by a projectile this frame
            if (e.hp <= 0 && !e.isDead) {
                e.isDead = true;
                apexSystem.addKill(); // fill meter
                killsThisRun++;
                
                // Death particles
                createParticles(particles, e.x, e.y, e.color, 8);

                if (Math.random() > 0.5) collectibles.push(new Collectible(e.x, e.y, 'xp'));
                if (Math.random() < 0.1) collectibles.push(new Collectible(e.x, e.y, 'credit'));
                enemies.splice(i, 1);
                continue;
            }
            
            e.update(scaledDt, player, canTakeDamage);
            if (e.isDead) {
                // Self-destruct enemies (swarmer contact, etc.)
                createParticles(particles, e.x, e.y, e.color, 5);
                apexSystem.addKill();
                killsThisRun++;
                if (Math.random() > 0.5) collectibles.push(new Collectible(e.x, e.y, 'xp'));
                if (Math.random() < 0.1) collectibles.push(new Collectible(e.x, e.y, 'credit'));
                enemies.splice(i, 1);
            }
        }
        
        // Track damage taken for Apex meter
        if (player.hp < hpBefore) {
            const dmgTaken = hpBefore - player.hp;
            apexSystem.addDamage(dmgTaken);
            // Hit flash
            createParticles(particles, player.x, player.y, '#ef4444', 4);
        }
        
        // Safety net: AFTER enemy processing, check if player died
        if (player.hp <= 0) {
            if (apexSystem.canTrigger()) {
                apexSystem.triggerSafetyNet();
                player.hp = 1; // Survive with 1 HP, lifesteal will heal during Apex
            } else {
                handleGameOver();
                return;
            }
        }

        // Collectibles
        for (let i = collectibles.length - 1; i >= 0; i--) {
            const c = collectibles[i];
            const collected = c.update(scaledDt, player, player.magnetRadius);
            if (collected) {
                if (c.type === 'xp') {
                    const didLevel = player.addXp(c.xpValue);
                    floatingTexts.push(new FloatingText(c.x, c.y, `+${c.xpValue} XP`, '#4ade80', 0.5));
                    if (didLevel) {
                        gameState = 'LEVELUP';
                        levelUpUI.show(player);
                    }
                } else if (c.type === 'credit') {
                    creditsEarnedThisRun++;
                    floatingTexts.push(new FloatingText(c.x, c.y, '+1 💰', '#fbbf24', 0.5));
                }
                collectibles.splice(i, 1);
            }
        }

        // Update particles, floating texts, and shards
        for (let i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].update(scaledDt)) particles.splice(i, 1);
        }
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            if (!floatingTexts[i].update(scaledDt)) floatingTexts.splice(i, 1);
        }
        for (let i = apexShards.length - 1; i >= 0; i--) {
            if (!apexShards[i].update(scaledDt)) apexShards.splice(i, 1);
        }

        // Apply Apex Capacitor passive (read from player's passives)
        const apexCapPassive = player.passives.find(p => p.id === 'apex_capacitor');
        if (apexCapPassive) {
            apexSystem.fillRateBonus = (saveManager.getUpgradeLevel('perm_apex_fill') * 0.06) + (apexCapPassive.level * 0.08);
        }

        uiManager.updateHUD(player.hp, player.maxHp, player.xp, player.xpToNext, player.level, waveManager.survivalTime, saveManager.getCredits(), apexSystem.meter);
    },

    // RENDER
    () => {
        renderer.clear();
        if (gameState === 'MENU') return;

        renderer.drawGrid(inputManager.getPointerPosition());
        const ctx = renderer.getContext();

        // APEX screen edge glow
        if (apexSystem && (apexSystem.getState() === 'ACTIVE' || apexSystem.getState() === 'FADING')) {
            renderer.drawApexGlow();
        }

        // Draw Apex Shards (behind everything else)
        apexShards.forEach(s => s.draw(ctx));

        collectibles.forEach(c => c.draw(ctx, waveManager?.survivalTime ?? 0));
        enemies.forEach(e => e.draw(ctx));
        projectiles.forEach(p => p.draw(ctx));
        if (player) player.draw(ctx, apexSystem?.getState());

        // Particles and floating text on top
        particles.forEach(p => p.draw(ctx));
        floatingTexts.forEach(ft => ft.draw(ctx));
    }
);

// ---- Resize ----
window.addEventListener('resize', () => renderer.resize());

// ---- Boot ----
uiManager.showMainMenu();
gameLoop.start();
