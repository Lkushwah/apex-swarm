import { describe, it, expect } from 'vitest';
import { Enemy, ENEMY_CONFIGS } from './Enemy';
import { Player } from './Player';

describe('Enemy Entity Unit Tests', () => {
    it('should initialize basic swarmer correctly', () => {
        const timeScale = 1.0;
        const enemy = new Enemy(100, 100, timeScale, 'swarmer');
        
        expect(enemy.x).toBe(100);
        expect(enemy.y).toBe(100);
        expect(enemy.enemyType).toBe('swarmer');
        expect(enemy.hp).toBe(ENEMY_CONFIGS['swarmer'].baseHp);
        expect(enemy.maxHp).toBe(ENEMY_CONFIGS['swarmer'].baseHp);
        expect(enemy.damage).toBe(ENEMY_CONFIGS['swarmer'].baseDamage);
        expect(enemy.shape).toBe('square');
    });

    it('should scale HP and Speed based on timeScale', () => {
        const timeScale = 2.0;
        const enemy = new Enemy(0, 0, timeScale, 'brute');
        
        expect(enemy.maxHp).toBe(ENEMY_CONFIGS['brute'].baseHp * 2);
        expect(enemy.hp).toBe(ENEMY_CONFIGS['brute'].baseHp * 2);
        // brute speed scaling: baseSpeed * 1 * (timeScale * 0.8)
        expect(enemy.speed).toBeCloseTo(ENEMY_CONFIGS['brute'].baseSpeed * 2.0 * 0.8);
    });

    it('Swarmer should deal damage and die on collision with player', () => {
        const player = new Player(0, 0);
        const enemy = new Enemy(0, 0, 1.0, 'swarmer');
        
        enemy.update(0.1, player, true);
        
        expect(player.hp).toBe(100 - ENEMY_CONFIGS['swarmer'].baseDamage);
        expect(enemy.isDead).toBe(true);
    });

    it('Brute should deal damage but NOT die on collision', () => {
        const player = new Player(0, 0);
        const enemy = new Enemy(0, 0, 1.0, 'brute');
        
        enemy.update(0.1, player, true);
        
        expect(player.hp).toBe(100 - ENEMY_CONFIGS['brute'].baseDamage);
        expect(enemy.isDead).toBe(false);
    });

    it('Shooter should spawn projectiles over time', () => {
        const player = new Player(200, 200);
        const enemy = new Enemy(0, 0, 1.0, 'shooter');
        
        // Initial shootTimer is 2. Update by 2.1s to force a shot.
        enemy.update(2.1, player, true);
        
        expect(enemy.projectiles.length).toBe(1);
        expect(enemy.projectiles[0].damage).toBe(ENEMY_CONFIGS['shooter'].baseDamage);
    });

    it('Shielder should reduce frontal damage', () => {
        const enemy = new Enemy(0, 0, 1.0, 'shielder');
        // Force shieldAngle to 0 (facing right)
        (enemy as any).shieldAngle = 0; 

        // Attack from front (angle 0)
        const dmgFront = enemy.takeDamageFrom(10, 0);
        expect(dmgFront).toBe(2); // 80% reduction
        expect(enemy.hp).toBe(ENEMY_CONFIGS['shielder'].baseHp - 2);

        // Attack from rear (angle PI)
        const dmgRear = enemy.takeDamageFrom(10, Math.PI);
        expect(dmgRear).toBe(10); // No reduction
        expect(enemy.hp).toBe(ENEMY_CONFIGS['shielder'].baseHp - 12);
    });

    it('Bulwark Drone should reduce damage when shield is active', () => {
        const enemy = new Enemy(0, 0, 1.0, 'bulwark_drone');
        // Force shield active
        (enemy as any).bulwarkShieldActive = true; 

        const dmg = enemy.takeDamageFrom(10);
        expect(dmg).toBe(3); // 70% reduction
    });
});
