import { Enemy, ENEMY_CONFIGS, type EnemyType } from '../entities/Enemy';
import { Boss, type BossType } from '../entities/Boss';
import { EMPHazard } from '../entities/EMPHazard';
import { Player } from '../entities/Player';

// -------------------------------------------------------
// WaveManager — weighted spawn system per GDD §8.4
// -------------------------------------------------------

interface SpawnWeight {
    type: EnemyType;
    weight: number;
}

const MAX_ACTIVE_ENEMIES = 60; // Spawn cap to prevent lag/visual noise

export class WaveManager {
    public survivalTime: number = 0;
    private spawnTimer: number = 0;
    private baseSpawnRate: number = 1.0;
    private bounds: { width: number, height: number };

    public empHazards: EMPHazard[] = [];
    private empSpawnTimer: number = 5.0; // First EMP hazard spawns at 5s

    public activeBoss: Boss | null = null;
    public lastSpawnedBossLevel: number = 0;
    private bossTypeList: BossType[] = [
        'core_sentinel',
        'void_weaver',
        'swarm_hive',
        'chrono_wraith',
        'apex_predator'
    ];

    constructor(bounds: { width: number, height: number }) {
        this.bounds = bounds;
    }

    /**
     * Soft-exponential time scale: gentler early, ramps hard late.
     * Old: 1 + (t / 60)
     * New: 1 + (t / 90) + (t / 300)²
     */
    public getTimeScale(): number {
        const t = this.survivalTime;
        return 1 + (t / 90) + Math.pow(t / 300, 2);
    }

    public update(dt: number, enemies: Enemy[], currentLevel: number, player?: Player) {
        this.survivalTime += dt;

        // EMP Hazard Spawning & Updates
        if (player) {
            this.empSpawnTimer -= dt;
            if (this.empSpawnTimer <= 0 && this.empHazards.length < 3) {
                this.empSpawnTimer = 15.0 + Math.random() * 10;
                const margin = 120;
                const hx = margin + Math.random() * (this.bounds.width - margin * 2);
                const hy = margin + Math.random() * (this.bounds.height - margin * 2);
                this.empHazards.push(new EMPHazard(hx, hy));
            }

            for (let i = this.empHazards.length - 1; i >= 0; i--) {
                const emp = this.empHazards[i];
                emp.update(dt, player, enemies);
                if (emp.state === 'expired') {
                    this.empHazards.splice(i, 1);
                }
            }
        }

        if (!this.activeBoss) {
            // Spawn boss every 5 levels (L5, L10, L15, L20, L25, L30, L35...)
            if (currentLevel >= 5 && currentLevel >= this.lastSpawnedBossLevel + 5) {
                this.lastSpawnedBossLevel = Math.floor(currentLevel / 5) * 5;
                const bossIndex = (Math.floor(this.lastSpawnedBossLevel / 5) - 1) % this.bossTypeList.length;
                const bossType = this.bossTypeList[bossIndex];
                
                // Repeat cycles scale HP/damage further (+50% HP per loop)
                const loopCycle = Math.floor((this.lastSpawnedBossLevel - 5) / 25);
                const timeScale = this.getTimeScale() * (1 + loopCycle * 0.5);

                this.activeBoss = new Boss(this.bounds.width / 2, 50, bossType, timeScale);
                return;
            }
        }

        if (this.activeBoss) {
            if (this.activeBoss.isDead) {
                this.activeBoss = null;
            } else {
                return; // Pause regular spawns while boss is alive
            }
        }

        // Enforce spawn cap
        if (enemies.length >= MAX_ACTIVE_ENEMIES) return;

        this.spawnTimer -= dt;

        if (this.spawnTimer <= 0) {
            this.spawnEnemy(enemies);
            // Cap minimum spawn rate at 0.15s, ramp over 4 minutes (was 0.1s over 2 min)
            const currentSpawnRate = Math.max(0.15, this.baseSpawnRate - (this.survivalTime / 240));
            this.spawnTimer = currentSpawnRate;
        }
    }

    /**
     * Spawn minions for bosses (called from main.ts when boss queues minions).
     * Boss minions only drop XP, not credits.
     */
    public spawnMinions(enemies: Enemy[], type: EnemyType, count: number, x: number, y: number) {
        const timeScale = this.getTimeScale();
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 60;
            const enemy = new Enemy(x + offsetX, y + offsetY, timeScale, type);
            (enemy as any).isBossMinion = true; // Tag for loot filtering in main.ts
            enemies.push(enemy);
        }
    }

    private getSpawnWeights(): SpawnWeight[] {
        const t = this.survivalTime;
        const weights: SpawnWeight[] = [];

        // Swarmer: always available, dominant early, declining share
        weights.push({ type: 'swarmer', weight: Math.max(10, 60 - t * 0.3) });

        // Brute: unlocks at 1:00
        if (t >= ENEMY_CONFIGS.brute.unlockTime) {
            weights.push({ type: 'brute', weight: Math.min(20, 5 + (t - 60) * 0.1) });
        }

        // Shooter: unlocks at 2:00
        if (t >= ENEMY_CONFIGS.shooter.unlockTime) {
            weights.push({ type: 'shooter', weight: Math.min(18, 5 + (t - 120) * 0.08) });
        }

        // Shielder: unlocks at 3:00
        if (t >= ENEMY_CONFIGS.shielder.unlockTime) {
            weights.push({ type: 'shielder', weight: Math.min(15, 3 + (t - 180) * 0.06) });
        }

        // Phasewraith: unlocks at 5:00
        if (t >= ENEMY_CONFIGS.phasewraith.unlockTime) {
            weights.push({ type: 'phasewraith', weight: Math.min(12, 3 + (t - 300) * 0.05) });
        }

        // Bulwark Drone: unlocks at 7:00
        if (t >= ENEMY_CONFIGS.bulwark_drone.unlockTime) {
            weights.push({ type: 'bulwark_drone', weight: Math.min(10, 2 + (t - 420) * 0.04) });
        }

        // Kamikaze: unlocks at 1:30 (90s)
        if (t >= ENEMY_CONFIGS.kamikaze.unlockTime) {
            weights.push({ type: 'kamikaze', weight: Math.min(16, 4 + (t - 90) * 0.08) });
        }

        // Glitch Swarm: unlocks at 9:00, becomes a larger share late
        if (t >= ENEMY_CONFIGS.glitch_swarm.unlockTime) {
            weights.push({ type: 'glitch_swarm', weight: Math.min(25, 5 + (t - 540) * 0.15) });
        }

        return weights;
    }

    private pickEnemyType(): EnemyType {
        const weights = this.getSpawnWeights();
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const w of weights) {
            roll -= w.weight;
            if (roll <= 0) return w.type;
        }

        return 'swarmer'; // fallback
    }

    private getSpawnPosition(): { x: number, y: number } {
        let x = 0;
        let y = 0;
        const margin = 40;

        const side = Math.floor(Math.random() * 4);
        if (side === 0) { x = Math.random() * this.bounds.width; y = -margin; }
        else if (side === 1) { x = this.bounds.width + margin; y = Math.random() * this.bounds.height; }
        else if (side === 2) { x = Math.random() * this.bounds.width; y = this.bounds.height + margin; }
        else { x = -margin; y = Math.random() * this.bounds.height; }

        return { x, y };
    }

    private spawnEnemy(enemies: Enemy[]) {
        const timeScale = this.getTimeScale();
        const type = this.pickEnemyType();
        const pos = this.getSpawnPosition();

        if (type === 'glitch_swarm') {
            // Spawn as a cluster of 5
            for (let i = 0; i < 5; i++) {
                const offsetX = (Math.random() - 0.5) * 30;
                const offsetY = (Math.random() - 0.5) * 30;
                enemies.push(new Enemy(pos.x + offsetX, pos.y + offsetY, timeScale, 'glitch_swarm'));
            }
        } else {
            enemies.push(new Enemy(pos.x, pos.y, timeScale, type));
        }
    }
}
