import { Enemy, ENEMY_CONFIGS, type EnemyType } from '../entities/Enemy';
import { Boss, type BossType } from '../entities/Boss';

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

    public activeBoss: Boss | null = null;
    private bossMilestones = [
        { level: 5, type: 'core_sentinel' as BossType, spawned: false },
        { level: 10, type: 'void_weaver' as BossType, spawned: false },
        { level: 15, type: 'swarm_hive' as BossType, spawned: false },
        { level: 20, type: 'chrono_wraith' as BossType, spawned: false },
        { level: 25, type: 'apex_predator' as BossType, spawned: false }
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

    public update(dt: number, enemies: Enemy[], currentLevel: number) {
        this.survivalTime += dt;

        if (!this.activeBoss) {
            for (const milestone of this.bossMilestones) {
                if (!milestone.spawned && currentLevel >= milestone.level) {
                    milestone.spawned = true;
                    const timeScale = this.getTimeScale();
                    // Spawn at top edge so it's visible immediately
                    this.activeBoss = new Boss(this.bounds.width / 2, 50, milestone.type, timeScale);
                    return;
                }
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
