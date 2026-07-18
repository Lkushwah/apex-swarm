import { Enemy } from '../entities/Enemy';

export class WaveManager {
    public survivalTime: number = 0;
    private spawnTimer: number = 0;
    private baseSpawnRate: number = 1.0;
    private bounds: { width: number, height: number };

    constructor(bounds: { width: number, height: number }) {
        this.bounds = bounds;
    }

    public update(dt: number, enemies: Enemy[]) {
        this.survivalTime += dt;
        this.spawnTimer -= dt;

        if (this.spawnTimer <= 0) {
            this.spawnEnemy(enemies);
            // Cap minimum spawn rate at 0.1s
            const currentSpawnRate = Math.max(0.1, this.baseSpawnRate - (this.survivalTime / 120));
            this.spawnTimer = currentSpawnRate;
        }
    }

    private spawnEnemy(enemies: Enemy[]) {
        let x = 0;
        let y = 0;
        
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { x = Math.random() * this.bounds.width; y = -30; }
        else if (side === 1) { x = this.bounds.width + 30; y = Math.random() * this.bounds.height; }
        else if (side === 2) { x = Math.random() * this.bounds.width; y = this.bounds.height + 30; }
        else { x = -30; y = Math.random() * this.bounds.height; }

        const timeScale = 1 + (this.survivalTime / 60);
        enemies.push(new Enemy(x, y, timeScale));
    }
}
