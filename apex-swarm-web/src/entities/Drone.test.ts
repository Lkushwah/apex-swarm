import { describe, it, expect } from 'vitest';
import { Drone } from './Drone';
import { Player } from './Player';
import { Enemy } from './Enemy';

describe('Drone', () => {
    it('should orbit the player', () => {
        const player = new Player(100, 100);
        const drone = new Drone(player, 0);

        // Initial position should be offset from player
        const dist = Math.hypot(drone.x - player.x, drone.y - player.y);
        expect(dist).toBeGreaterThan(40);

        const initialX = drone.x;
        const initialY = drone.y;

        drone.update(0.1, [], [], 10);

        // Should have moved along orbit
        expect(drone.x).not.toBe(initialX);
        expect(drone.y).not.toBe(initialY);
    });

    it('should fire at enemies when close and not evolved', () => {
        const player = new Player(100, 100);
        const drone = new Drone(player, 0);
        const enemy = new Enemy(150, 100, 1, 'swarmer');
        
        const projectiles: any[] = [];
        drone.update(0.016, [enemy], projectiles, 10);

        // It should have fired a projectile
        expect(projectiles.length).toBeGreaterThan(0);
    });

    it('should seek enemies when evolved', () => {
        const player = new Player(100, 100);
        const drone = new Drone(player, 0);
        drone.isEvolved = true;
        const enemy = new Enemy(150, 100, 1, 'swarmer');
        
        const distToEnemy = Math.hypot(drone.x - enemy.x, drone.y - enemy.y);
        
        drone.update(0.016, [], [], 10); // Find target
        drone.update(0.016, [enemy], [], 10); // Move towards target
        
        const distToEnemyAfter = Math.hypot(drone.x - enemy.x, drone.y - enemy.y);
        
        expect(distToEnemyAfter).toBeLessThan(distToEnemy);
    });

    it('should lock on to enemies when evolved', () => {
        const player = new Player(100, 100);
        const drone = new Drone(player, 0);
        drone.isEvolved = true;
        const enemy = new Enemy(150, 100, 1, 'swarmer');

        drone.update(0.1, [enemy], [], 10);
        
        expect((drone as any).targetEnemy).toBe(enemy);
    });
});
