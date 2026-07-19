import { describe, it, expect, beforeEach } from 'vitest';
import { WaveManager } from './WaveManager';
import { Enemy, ENEMY_CONFIGS } from '../entities/Enemy';

describe('WaveManager Unit Tests', () => {
    let wm: WaveManager;
    let enemies: Enemy[];

    beforeEach(() => {
        wm = new WaveManager({ width: 800, height: 600 });
        enemies = [];
    });

    it('should spawn enemies over time and decrease spawn timer', () => {
        expect(wm.survivalTime).toBe(0);
        
        // Update exactly the spawn timer amount (initially 0, spawns immediately)
        wm.update(0.1, enemies, 1);
        expect(enemies.length).toBeGreaterThan(0);
        expect(enemies[0].enemyType).toBe('swarmer'); // Only swarmer unlocked at t=0
        
        const initialEnemyCount = enemies.length;

        // Advance by 1 second. With base spawn rate 1.0, it should spawn 1 more.
        wm.update(1.0, enemies, 1);
        expect(enemies.length).toBeGreaterThan(initialEnemyCount);
    });

    it('should unlock brute at 60 seconds', () => {
        // Fast forward to 60s
        wm.survivalTime = 60;
        
        // We'll mock Math.random to always pick the highest weight for this test
        const originalRandom = Math.random;
        Math.random = () => 0.99; // Roll will pick the last element in weight array
        
        wm.update(0.1, enemies, 1); // Force spawn
        expect(enemies[enemies.length - 1].enemyType).toBe('brute');
        
        Math.random = originalRandom;
    });

    it('should unlock glitch_swarm at 540 seconds and spawn as a cluster of 5', () => {
        (wm as any).bossMilestones = []; // Disable boss spawn check for this test
        wm.survivalTime = 540;
        
        const originalRandom = Math.random;
        Math.random = () => 0.99; // Pick glitch_swarm
        
        const beforeCount = enemies.length;
        wm.update(0.1, enemies, 1); // Force spawn
        
        // Glitch swarm spawns 5 at once
        expect(enemies.length - beforeCount).toBe(5);
        expect(enemies[enemies.length - 1].enemyType).toBe('glitch_swarm');
        
        Math.random = originalRandom;
    });

    it('timeScale multiplier should be applied to spawned enemies', () => {
        wm.survivalTime = 120; // Time scale = 1 + (120/60) = 3
        
        wm.update(0.1, enemies, 1); // Force spawn
        const e = enemies[enemies.length - 1];
        
        // Base swarmer HP is 30, scaled by 3 = 90
        // If it picked brute (base 150), scaled by 3 = 450
        // We just verify it matches the config multiplied by 3
        const expectedHp = ENEMY_CONFIGS[e.enemyType].baseHp * (1 + 120.1 / 60);
        expect(e.maxHp).toBeCloseTo(expectedHp);
    });
});
