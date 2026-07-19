import './style.css';

import { GameLoop } from './engine/GameLoop';
import { Renderer } from './engine/Renderer';
import { InputManager } from './engine/InputManager';

import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Boss } from './entities/Boss';
import { Projectile } from './entities/Projectile';
import { Collectible } from './entities/Collectible';
import { Particle, FloatingText, ApexShard, createParticles, createApexShards } from './entities/Particles';

import { WeaponSystem } from './systems/WeaponSystem';
import { WaveManager } from './systems/WaveManager';
import { ApexSystem } from './systems/ApexSystem';

import { UIManager } from './ui/UIManager';
import { LevelUpUI } from './ui/LevelUpUI';
import { PowerUpgradesUI } from './ui/PowerUpgradesUI';
import { CosmeticsUI, COSMETICS } from './ui/CosmeticsUI';
import { DailyChallengeUI } from './ui/DailyChallengeUI';
import { NamePromptUI } from './ui/NamePromptUI';
import { LeaderboardUI } from './ui/LeaderboardUI';
import { TutorialUI } from './ui/TutorialUI';
import { AchievementsUI } from './ui/AchievementsUI';
import { FeedbackUI } from './ui/FeedbackUI';
import { TutorialManager } from './systems/TutorialManager';
import { PRNG } from './core/PRNG';
import { AnalyticsLogger } from './core/AnalyticsLogger';

import { firebaseManager } from './core/FirebaseManager';

import { SaveManager } from './core/SaveManager';
import { PERM_UPGRADES } from './data/upgrades';

// ---- Engine Setup ----
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const inputManager = new InputManager(canvas);
inputManager.onDoubleTap(() => {
    if (gameState === 'PLAYING' && apexSystem && apexSystem.canTrigger()) {
        apexSystem.manualTrigger();
    }
});
const saveManager = new SaveManager();
const uiManager = new UIManager();
let namePromptUI: NamePromptUI;
let tutorialUI: TutorialUI;
let achievementsUI: AchievementsUI;
let feedbackUI: FeedbackUI;
let tutorialManager: TutorialManager;

// ---- Game State ----
type GameState = 'MENU' | 'PLAYING' | 'LEVELUP' | 'GAMEOVER' | 'TUTORIAL' | 'PAUSED' | 'QUIT_CONFIRM';
let gameState: GameState = 'MENU';

let player: Player;
let enemies: Enemy[] = [];
let projectiles: Projectile[] = [];
let collectibles: Collectible[] = [];
let particles: Particle[] = [];
let floatingTexts: FloatingText[] = [];
let apexShards: ApexShard[] = [];
let creditsEarnedThisRun: number = 0;
let coresEarnedThisRun: number = 0;
let totalKills: number = 0;
let survivalTime: number = 0;
let currentBoss: any = null;

let weaponSystem: WeaponSystem;
let waveManager: WaveManager;
let apexSystem: ApexSystem;
let analyticsLogger: AnalyticsLogger;

// ---- Sub-UIs ----
const powerUpgradesUI = new PowerUpgradesUI(saveManager, () => uiManager.showMainMenu());
const cosmeticsUI = new CosmeticsUI(saveManager, undefined, () => uiManager.showMainMenu());
const dailyChallengeUI = new DailyChallengeUI(saveManager, (seed, mods) => startDailyRun(seed, mods), () => uiManager.showMainMenu());
const leaderboardUI = new LeaderboardUI();
leaderboardUI.onBack = () => uiManager.showMainMenu();

namePromptUI = new NamePromptUI(saveManager);
tutorialUI = new TutorialUI();
achievementsUI = new AchievementsUI(saveManager);
feedbackUI = new FeedbackUI();
tutorialManager = new TutorialManager(tutorialUI);
let namePromptTarget: 'START_GAME' | 'LEADERBOARD' | null = null;

namePromptUI.onNameSet = () => {
    if (namePromptTarget === 'START_GAME') {
        startGame();
    } else if (namePromptTarget === 'LEADERBOARD') {
        leaderboardUI.show();
    } else {
        uiManager.showMainMenu();
    }
};

namePromptUI.onSkip = () => {
    if (namePromptTarget === 'START_GAME') {
        startGame();
    } else {
        uiManager.showMainMenu();
    }
};

let pendingLevelUps = 0;

const levelUpUI = new LevelUpUI((selection) => {
    if (selection && analyticsLogger) {
        analyticsLogger.logEvent(selection.type as any, { id: selection.id, level: selection.level }, survivalTime);
    }
    checkTutorials();

    if (pendingLevelUps > 0) {
        pendingLevelUps--;
        player.level++;
        player.xpToNext = Math.floor(player.xpToNext * 1.35);
        levelUpUI.show(player);
    } else {
        gameState = 'PLAYING';
    }
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

function checkTutorials() {
    if (gameState !== 'PLAYING') return;

    if (survivalTime > 1 && !tutorialManager.hasSeen('MOVEMENT_AND_DASH')) {
        gameState = 'TUTORIAL';
        tutorialManager.showTutorial('MOVEMENT_AND_DASH', () => {
            gameState = 'PLAYING';
        });
        return;
    }

    if (survivalTime > 5 && collectibles.some(c => c.type === 'xp') && !tutorialManager.hasSeen('COLLECTING_XP')) {
        gameState = 'TUTORIAL';
        tutorialManager.showTutorial('COLLECTING_XP', () => {
            gameState = 'PLAYING';
        });
        return;
    }

    if (player && player.level > 1 && !tutorialManager.hasSeen('LEVELING_UP')) {
        gameState = 'TUTORIAL';
        tutorialManager.showTutorial('LEVELING_UP', () => {
            gameState = 'PLAYING';
        });
        return;
    }

    if (creditsEarnedThisRun > 0 && !tutorialManager.hasSeen('CREDITS_AND_CORES')) {
        gameState = 'TUTORIAL';
        tutorialManager.showTutorial('CREDITS_AND_CORES', () => {
            gameState = 'PLAYING';
        });
        return;
    }

    if (apexSystem && apexSystem.canTrigger() && !tutorialManager.hasSeen('APEX_METER')) {
        gameState = 'TUTORIAL';
        tutorialManager.showTutorial('APEX_METER', () => {
            gameState = 'PLAYING';
        });
        return;
    }

    if (player && player.weapons.some(w => w.evolved) && !tutorialManager.hasSeen('WEAPON_EVOLUTION')) {
        gameState = 'TUTORIAL';
        tutorialManager.showTutorial('WEAPON_EVOLUTION', () => {
            gameState = 'PLAYING';
        });
        return;
    }

    if (weaponSystem && weaponSystem.drones && weaponSystem.drones.length > 0 && !tutorialManager.hasSeen('DRONES')) {
        gameState = 'TUTORIAL';
        tutorialManager.showTutorial('DRONES', () => {
            gameState = 'PLAYING';
        });
        return;
    }
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
    coresEarnedThisRun = 0;
    totalKills = 0;
    survivalTime = 0;
    currentBoss = null;

    // Wire particle/text arrays into Projectile's static feedback system
    Projectile.floatingTexts = floatingTexts;
    Projectile.particles = [];

    weaponSystem = new WeaponSystem(player);
    waveManager = new WaveManager(bounds);
    apexSystem = new ApexSystem(player);
    analyticsLogger = new AnalyticsLogger();
    analyticsLogger.logEvent('GAME_START', {}, 0);

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

    const equipped = saveManager.getEquippedCosmetic();
    if (equipped) {
        const cos = COSMETICS.find(c => c.id === equipped);
        if (cos) player.color = cos.color;
    }
    cosmeticsUI.setPlayer(player); // Update preview

    gameState = 'PLAYING';
    uiManager.showHUD();
    checkTutorials();
}

function startDailyRun(seed: number, modifiers: string[]) {
    startGame();
    
    // Override random system with PRNG
    const prng = new PRNG(seed);
    Math.random = () => prng.next(); // Not safe for real prod, but fine for local run
    
    // Apply modifiers
    if (modifiers.includes('Player Speed -20%')) {
        player.speed *= 0.8;
    }
    if (modifiers.includes('Start with 0 Upgrades')) {
        // Reset perm upgrades? Actually, `startGame` just applied them. Let's undo it.
        player = new Player(renderer.getDimensions().width / 2, renderer.getDimensions().height / 2);
        const equipped = saveManager.getEquippedCosmetic();
        if (equipped) {
            const cos = COSMETICS.find(c => c.id === equipped);
            if (cos) player.color = cos.color;
        }
        weaponSystem = new WeaponSystem(player);
        apexSystem = new ApexSystem(player);
    }
    // We would pass modifiers to waveManager for Enemy HP, Spawns, etc.
    (waveManager as any).dailyModifiers = modifiers;
}

function handleGameOver() {
    gameState = 'GAMEOVER';
    
    // Check Achievements
    if (survivalTime >= 60 && !saveManager.hasAchievement('survive_1m')) saveManager.unlockAchievement('survive_1m');
    if (survivalTime >= 300 && !saveManager.hasAchievement('survive_5m')) saveManager.unlockAchievement('survive_5m');
    if (survivalTime >= 600 && !saveManager.hasAchievement('survive_10m')) saveManager.unlockAchievement('survive_10m');
    if (player.level >= 10 && !saveManager.hasAchievement('level_10')) saveManager.unlockAchievement('level_10');
    if (player.level >= 25 && !saveManager.hasAchievement('level_25')) saveManager.unlockAchievement('level_25');
    if (totalKills >= 500 && !saveManager.hasAchievement('kill_500')) saveManager.unlockAchievement('kill_500');
    if (totalKills >= 2000 && !saveManager.hasAchievement('kill_2000')) saveManager.unlockAchievement('kill_2000');

    saveManager.addCredits(Math.floor(creditsEarnedThisRun * (1 + player.creditMultiplier)));
    if ((saveManager as any).addCores) {
        (saveManager as any).addCores(coresEarnedThisRun);
    }
    saveManager.updateStats(survivalTime, totalKills, player.level);
    
    const displayName = saveManager.getDisplayName();
    
    // Sync high scores to Firebase
    if (displayName) {
        firebaseManager.syncData(displayName, saveManager.getRawData(), survivalTime, totalKills);
    }
    
    // Log run analytics to Firebase
    analyticsLogger.updateStats(survivalTime, player.x, player.y, player.hp, player.level, totalKills, true);
    const runLog = analyticsLogger.getRunLog();
    analyticsLogger.logEvent('GAME_OVER', { finalLevel: player.level, finalKills: totalKills }, survivalTime);
    
    const runLogData = {
        displayName: displayName || 'Anonymous',
        survivalTime: survivalTime,
        totalKills: totalKills,
        level: player.level,
        weapons: player.weapons.map(w => ({ id: w.id, level: w.level, evolved: w.evolved })),
        passives: player.passives.map(p => ({ id: p.id, level: p.level })),
        events: runLog.events,
        statsTimeline: runLog.statsTimeline
    };

    firebaseManager.saveRunLog(runLogData);

    // Also save locally via Vite dev server plugin
    fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runLogData, null, 2)
    }).catch(() => { /* Ignore in production when endpoint doesn't exist */ });

    uiManager.showGameOver(survivalTime, totalKills, player.level, player.weapons, player.passives, creditsEarnedThisRun, coresEarnedThisRun);
}

// ---- Button Wiring ----
document.getElementById('start-btn')!.addEventListener('click', () => {
    const name = saveManager.getDisplayName();
    if (!name) {
        document.getElementById('main-menu')?.classList.add('hidden');
        namePromptTarget = 'START_GAME';
        namePromptUI.show();
    } else {
        startGame();
    }
});
document.getElementById('restart-btn')!.addEventListener('click', startGame);
document.getElementById('go-main-menu-btn')!.addEventListener('click', () => {
    gameState = 'MENU';
    document.getElementById('gameover-screen')?.classList.add('hidden');
    document.getElementById('main-menu')?.classList.remove('hidden');
    document.getElementById('hud')?.classList.add('hidden');
});
document.getElementById('power-upgrades-btn')!.addEventListener('click', () => {
    document.getElementById('main-menu')?.classList.add('hidden');
    powerUpgradesUI.show();
});
document.getElementById('cosmetics-btn')?.addEventListener('click', () => cosmeticsUI.show());
document.getElementById('achievements-btn')?.addEventListener('click', () => achievementsUI.show());
document.getElementById('feedback-btn')?.addEventListener('click', () => {
    document.getElementById('main-menu')?.classList.add('hidden');
    feedbackUI.show();
});
document.getElementById('cosmetics-btn')!.addEventListener('click', () => {
    document.getElementById('main-menu')?.classList.add('hidden');
    cosmeticsUI.show();
});
document.getElementById('daily-challenge-btn')!.addEventListener('click', () => {
    document.getElementById('main-menu')?.classList.add('hidden');
    dailyChallengeUI.show();
});
document.getElementById('leaderboards-btn')!.addEventListener('click', () => {
    document.getElementById('main-menu')?.classList.add('hidden');
    
    // Check if user has a display name
    const name = saveManager.getDisplayName();
    if (!name) {
        namePromptTarget = 'LEADERBOARD';
        namePromptUI.show();
    } else {
        leaderboardUI.show();
    }
});
document.getElementById('go-upgrades-btn')!.addEventListener('click', () => {
    document.getElementById('gameover-screen')?.classList.add('hidden');
    powerUpgradesUI.show();
});
document.getElementById('apex-trigger-btn')!.addEventListener('click', () => {
    if (gameState === 'PLAYING') {
        if (apexSystem.canTrigger()) {
            apexSystem.manualTrigger();
            if (analyticsLogger) analyticsLogger.logEvent('APEX_TRIGGERED', { type: 'manual' }, survivalTime);
        }
    }
});

// ---- Pause Logic & Wiring ----
function pauseGame() {
    gameState = 'PAUSED';
    document.getElementById('pause-screen')?.classList.remove('hidden');
}

function resumeGame() {
    gameState = 'PLAYING';
    document.getElementById('pause-screen')?.classList.add('hidden');
    document.getElementById('quit-confirm-screen')?.classList.add('hidden');
}

function quitToMainMenuConfirm() {
    gameState = 'QUIT_CONFIRM';
    document.getElementById('pause-screen')?.classList.add('hidden');
    document.getElementById('quit-confirm-screen')?.classList.remove('hidden');
}

function cancelQuit() {
    gameState = 'PAUSED';
    document.getElementById('quit-confirm-screen')?.classList.add('hidden');
    document.getElementById('pause-screen')?.classList.remove('hidden');
}

function quitToMainMenu() {
    document.getElementById('pause-screen')?.classList.add('hidden');
    document.getElementById('quit-confirm-screen')?.classList.add('hidden');
    document.getElementById('hud')?.classList.add('hidden');
    gameState = 'MENU';
    document.getElementById('main-menu')?.classList.remove('hidden');
}

document.getElementById('pause-btn')!.addEventListener('click', () => {
    if (gameState === 'PLAYING') {
        pauseGame();
    }
});
document.getElementById('pause-resume-btn')!.addEventListener('click', () => {
    resumeGame();
});
document.getElementById('pause-quit-btn')!.addEventListener('click', () => {
    quitToMainMenuConfirm();
});
document.getElementById('quit-yes-btn')!.addEventListener('click', () => {
    quitToMainMenu();
});
document.getElementById('quit-no-btn')!.addEventListener('click', () => {
    cancelQuit();
});
document.getElementById('pause-tutorial-btn')!.addEventListener('click', () => {
    gameState = 'TUTORIAL';
    document.getElementById('pause-screen')?.classList.add('hidden');
    tutorialUI.show(
        'HOW TO PLAY',
        '• <span style="color:#38bdf8; font-weight:bold;">Move</span>: Drag or move cursor to navigate.<br/><br/>' +
        '• <span style="color:#f59e0b; font-weight:bold;">Combat</span>: Weapons fire automatically.<br/><br/>' +
        '• <span style="color:#fbbf24; font-weight:bold;">Dash</span>: Press SHIFT or Double Tap to dash.<br/><br/>' +
        '• <span style="color:#ef4444; font-weight:bold;">Apex Mode</span>: Press SPACE / Click APEX button at 100% charge to gain invincibility + massive damage boost.<br/><br/>' +
        '• <span style="color:#a855f7; font-weight:bold;">Evolutions</span>: Upgrade a weapon to level 8 with its matching passive to evolve it.'
    );
    tutorialUI.onDismiss = () => {
        gameState = 'PAUSED';
        document.getElementById('pause-screen')?.classList.remove('hidden');
    };
});
window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
            e.preventDefault();
            pauseGame();
        } else if (gameState === 'PAUSED') {
            e.preventDefault();
            resumeGame();
        }
        return;
    }
    
    if (gameState !== 'PLAYING') return;
    if (e.code === 'Space') {
        e.preventDefault();
        if (apexSystem.canTrigger()) {
            apexSystem.manualTrigger();
            if (analyticsLogger) analyticsLogger.logEvent('APEX_TRIGGERED', { type: 'manual' }, survivalTime);
        }
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        player.dash(inputManager.getPointerPosition());
    } else if (e.code === 'KeyB' && gameState === 'PLAYING') {
        // Debug: spawn boss instantly
        if (!currentBoss && waveManager) {
            // Force random boss spawn
            const timeScale = waveManager.getTimeScale();
            const types: ('core_sentinel' | 'void_weaver' | 'swarm_hive' | 'chrono_wraith' | 'apex_predator')[] = 
                ['core_sentinel', 'void_weaver', 'swarm_hive', 'chrono_wraith', 'apex_predator'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            waveManager.activeBoss = new Boss(renderer.getDimensions().width / 2, 50, randomType, timeScale);
        }
    }
});

let lastTapTime = 0;
window.addEventListener('pointerup', (e) => {
    if (gameState !== 'PLAYING') return;
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    
    const now = performance.now();
    if (now - lastTapTime < 300) {
        if (apexSystem.canTrigger()) {
            apexSystem.manualTrigger();
            if (analyticsLogger) analyticsLogger.logEvent('APEX_TRIGGERED', { type: 'manual' }, survivalTime);
        }
    }
    lastTapTime = now;
});

// ---- Game Loop ----
const gameLoop = new GameLoop(
    // UPDATE
    (dt) => {
        if (gameState === 'MENU' || gameState === 'LEVELUP' || gameState === 'TUTORIAL' || gameState === 'PAUSED' || gameState === 'QUIT_CONFIRM') return;
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
        } else {
            uiManager.hideApexBanner();
        }

        const bounds = renderer.getDimensions();

        // Wave & weapons (with effective damage multiplier including APEX bonus)
        waveManager.update(scaledDt, enemies, player.level);
        survivalTime = waveManager.survivalTime;
        const effectiveDamageBonus = apexSystem.damageMultiplierBonus;
        weaponSystem.apexDamageBonus = effectiveDamageBonus;
        // Boss Handling (Check spawns before weapons target)
        if (waveManager.activeBoss !== currentBoss) {
            if (waveManager.activeBoss) {
                // Boss just spawned -> Arena Lock!
                currentBoss = waveManager.activeBoss;
                uiManager.showBossWarning();
                
                // Arena Lock! Flee all regular enemies
                enemies.forEach(e => {
                    e.isFleeing = true;
                });
            } else if (currentBoss && currentBoss.isDead) {
                // Boss just died -> Give Rewards
                createParticles(particles, currentBoss.x, currentBoss.y, currentBoss.color, 100);
                uiManager.hideBossUI();
                
                // Retrieve rewards from boss definition
                const levelsReward = currentBoss.rewardLevelUps;
                const creditsReward = currentBoss.rewardCredits;
                const coresReward = currentBoss.rewardCores;
                
                creditsEarnedThisRun += creditsReward;
                coresEarnedThisRun += coresReward;
                
                if (currentBoss.rewardHealFull) {
                    player.hp = player.maxHp;
                    floatingTexts.push(new FloatingText(player.x, player.y, `FULL HEAL!`, '#22c55e', 1.2));
                }
                if (currentBoss.rewardApexRefill) {
                    apexSystem.meter = apexSystem.MAX_METER;
                    floatingTexts.push(new FloatingText(player.x, player.y, `APEX READY!`, '#f43f5e', 1.2));
                }

                floatingTexts.push(new FloatingText(currentBoss.x, currentBoss.y, `+${creditsReward} CREDITS!`, '#fbbf24', 1.0));
                if (coresReward > 0) {
                    floatingTexts.push(new FloatingText(currentBoss.x, currentBoss.y - 20, `+${coresReward} CORES!`, '#f0abfc', 1.0));
                }

                if (levelsReward > 0) {
                    pendingLevelUps = levelsReward - 1; // The first one is shown now, rest are pending
                    player.level++;
                    player.xpToNext = Math.floor(player.xpToNext * 1.35);
                    gameState = 'LEVELUP';
                    levelUpUI.show(player);
                }
                
                currentBoss = null;
            }
        }

        const targets = currentBoss && !currentBoss.isDead ? [...enemies, currentBoss as any] : enemies;

        weaponSystem.update(scaledDt, targets, projectiles);

        checkTutorials();

        // Player
        const canTakeDamage = !apexSystem.isInvincible;
        player.update(scaledDt, inputManager.getPointerPosition(), bounds);
        analyticsLogger.updateStats(survivalTime, player.x, player.y, player.hp, player.level, totalKills);

        if (currentBoss) {
            currentBoss.update(scaledDt, player, canTakeDamage);
            uiManager.updateBossHP(currentBoss.name, currentBoss.hp, currentBoss.maxHp);
            
            // Process boss-summoned minion spawns
            if (currentBoss.minionQueue && currentBoss.minionQueue.length > 0) {
                for (const req of currentBoss.minionQueue) {
                    waveManager.spawnMinions(enemies, req.type, req.count, req.x, req.y);
                }
                currentBoss.minionQueue = [];
            }
            
            // Check if killed by a projectile this frame
            if (currentBoss.hp <= 0 && !currentBoss.isDead) {
                currentBoss.isDead = true;
            }
        }

        // Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update(scaledDt, bounds, targets, apexSystem, player);
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
                if (!e.isFleeing) {
                    apexSystem.addKill(); // fill meter
                    totalKills++;
                    
                    // Death particles
                    createParticles(particles, e.x, e.y, e.color, 8);

                    if (!(e as any).isBossMinion) {
                        if (Math.random() > 0.5) collectibles.push(new Collectible(e.x, e.y, 'xp'));
                        if (Math.random() < 0.1) collectibles.push(new Collectible(e.x, e.y, 'credit'));
                        if (Math.random() < 0.02) collectibles.push(new Collectible(e.x, e.y, 'core'));
                    } else {
                        // Boss minions drop XP only (option C)
                        if (Math.random() > 0.5) collectibles.push(new Collectible(e.x, e.y, 'xp'));
                    }
                }
                enemies.splice(i, 1);
                continue;
            }
            
            e.update(scaledDt, player, canTakeDamage);
            if (e.isDead) {
                if (!e.isFleeing) {
                    // Self-destruct enemies (swarmer contact, etc.)
                    createParticles(particles, e.x, e.y, e.color, 5);
                    apexSystem.addKill();
                    totalKills++;
                    if (!(e as any).isBossMinion) {
                        if (Math.random() > 0.5) collectibles.push(new Collectible(e.x, e.y, 'xp'));
                        if (Math.random() < 0.1) collectibles.push(new Collectible(e.x, e.y, 'credit'));
                        if (Math.random() < 0.02) collectibles.push(new Collectible(e.x, e.y, 'core'));
                    } else {
                        // Boss minions drop XP only (option C)
                        if (Math.random() > 0.5) collectibles.push(new Collectible(e.x, e.y, 'xp'));
                    }
                }
                enemies.splice(i, 1);
            }
        }
        
        // Track damage taken for Apex meter
        if (player.hp < hpBefore) {
            const dmgTaken = hpBefore - player.hp;
            apexSystem.addDamage(dmgTaken);
            // Hit flash
            createParticles(particles, player.x, player.y, '#ef4444', 4);
            
            if (dmgTaken >= 15) {
                analyticsLogger.logEvent('HEAVY_DAMAGE_TAKEN', { amount: dmgTaken, hpLeft: player.hp }, survivalTime);
            }
        }
        
        // Safety net: AFTER enemy processing, check if player died
        if (player.hp <= 0) {
            if (apexSystem.canTrigger()) {
                apexSystem.triggerSafetyNet();
                player.hp = 1; // Survive with 1 HP, lifesteal will heal during Apex
                if (analyticsLogger) analyticsLogger.logEvent('APEX_TRIGGERED', { type: 'safety_net' }, survivalTime);
            } else {
                createParticles(particles, player.x, player.y, player.color, 30);
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
                        analyticsLogger.logEvent('LEVEL_UP', { newLevel: player.level }, survivalTime);
                        levelUpUI.show(player);
                    }
                } else if (c.type === 'credit') {
                    creditsEarnedThisRun++;
                    floatingTexts.push(new FloatingText(c.x, c.y, '+1 💰', '#fbbf24', 0.5));
                } else if (c.type === 'core') {
                    coresEarnedThisRun++;
                    floatingTexts.push(new FloatingText(c.x, c.y, '+1 CORE', '#f0abfc', 0.5));
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

        uiManager.updateHUD(player.hp, player.maxHp, player.xp, player.xpToNext, player.level, waveManager.survivalTime, saveManager.getCredits(), apexSystem.meter, saveManager.getCores());
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
        if (currentBoss && gameState !== 'GAMEOVER') {
            const dims = renderer.getDimensions();
            currentBoss.draw(ctx, dims.width, dims.height);
        }
        
        // Drones
        weaponSystem.drones.forEach(d => d.draw(ctx));

        projectiles.forEach(p => p.draw(ctx));
        if (player && gameState !== 'GAMEOVER') player.draw(ctx, apexSystem?.getState());

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
