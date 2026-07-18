import './style.css';

import { GameLoop } from './engine/GameLoop';
import { Renderer } from './engine/Renderer';
import { InputManager } from './engine/InputManager';

import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
import { Collectible } from './entities/Collectible';

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
    const creditMultiplierUpg = PERM_UPGRADES.find(u => u.id === 'perm_credits')!;
    for (const upg of PERM_UPGRADES) {
        const level = saveManager.getUpgradeLevel(upg.id);
        if (level > 0 && upg.id !== 'perm_credits') {
            upg.apply(p, level);
        }
    }
    // Store credit multiplier on player for the run
    const creditLevel = saveManager.getUpgradeLevel('perm_credits');
    (p as any).creditMultiplier = 1 + creditLevel * 0.1;
    void creditMultiplierUpg; // used above
}

// ---- Start/Restart Game ----
function startGame() {
    const bounds = renderer.getDimensions();
    player = new Player(bounds.width / 2, bounds.height / 2);
    applyPermanentUpgrades(player);

    enemies = [];
    projectiles = [];
    collectibles = [];
    creditsEarnedThisRun = 0;
    killsThisRun = 0;

    weaponSystem = new WeaponSystem(player);
    waveManager = new WaveManager(bounds);
    apexSystem = new ApexSystem(player);

    // Apply perm_apex bonus to apex system
    const apexPermLevel = saveManager.getUpgradeLevel('perm_apex');
    apexSystem.durationBonus = apexPermLevel * 0.5;
    apexSystem.damageBonus   = apexPermLevel * 0.05;

    gameState = 'PLAYING';
    uiManager.showHUD();
}

function handleGameOver() {
    gameState = 'GAMEOVER';
    const creditMultiplier = (player as any).creditMultiplier ?? 1;
    const credits = Math.floor(
        (waveManager.survivalTime * 0.5 + creditsEarnedThisRun) * creditMultiplier
    );
    saveManager.addCredits(credits);
    uiManager.showGameOver(waveManager.survivalTime, credits, player, killsThisRun);
}

// ---- Button Wiring ----
document.getElementById('start-btn')!.addEventListener('click', startGame);
document.getElementById('restart-btn')!.addEventListener('click', startGame);
document.getElementById('power-upgrades-btn')!.addEventListener('click', () => {
    uiManager['mainMenu']?.classList.add('hidden');
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
    if (now - lastTapTime < 300) { // 300ms double-tap threshold
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
        if (player.hp <= 0) { handleGameOver(); return; }

        // Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update(scaledDt, bounds, enemies, apexSystem, player);
            if (p.isDead) { projectiles.splice(i, 1); }
        }

        // Enemies
        const hpBefore = player.hp;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            
            // Check if killed by a projectile this frame
            if (e.hp <= 0 && !e.isDead) {
                e.isDead = true;
                apexSystem.addKill(); // fill meter
                killsThisRun++;
                if (Math.random() > 0.5) collectibles.push(new Collectible(e.x, e.y, 'xp'));
                if (Math.random() < 0.1) collectibles.push(new Collectible(e.x, e.y, 'credit'));
                enemies.splice(i, 1);
                continue;
            }
            
            e.update(scaledDt, player, canTakeDamage);
            if (e.isDead) enemies.splice(i, 1); // e.g. kamikaze swarmer
        }
        if (player.hp < hpBefore) {
            apexSystem.addDamage(hpBefore - player.hp);
        }
        
        // Safety net trigger if player is about to die but has full meter
        if (player.hp <= 0) {
            if (apexSystem.canTrigger()) {
                apexSystem.triggerSafetyNet();
            } else {
                handleGameOver(); 
                return;
            }
        }

        // Collectibles
        const magnetRadius = (player as any).magnetRadius ?? 100;
        for (let i = collectibles.length - 1; i >= 0; i--) {
            const c = collectibles[i];
            const collected = c.update(scaledDt, player, magnetRadius);
            if (collected) {
                if (c.type === 'xp') {
                    const didLevel = player.addXp(c.xpValue);
                    if (didLevel) {
                        gameState = 'LEVELUP';
                        levelUpUI.show(player);
                    }
                } else if (c.type === 'credit') {
                    creditsEarnedThisRun++;
                }
                collectibles.splice(i, 1);
            }
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

        collectibles.forEach(c => c.draw(ctx, waveManager?.survivalTime ?? 0));
        enemies.forEach(e => e.draw(ctx));
        projectiles.forEach(p => p.draw(ctx));
        if (player) player.draw(ctx, apexSystem?.getState());
    }
);

// ---- Resize ----
window.addEventListener('resize', () => renderer.resize());

// ---- Boot ----
uiManager.showMainMenu();
gameLoop.start();
