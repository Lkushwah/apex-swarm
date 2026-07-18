import { describe, it, expect } from 'vitest';
import { Player } from './Player';

describe('Player Entity Unit Tests', () => {
    it('should initialize with correct default values', () => {
        const player = new Player(100, 100);
        expect(player.x).toBe(100);
        expect(player.y).toBe(100);
        expect(player.hp).toBe(100);
        expect(player.level).toBe(1);
        expect(player.xp).toBe(0);
    });

    it('should take damage correctly', () => {
        const player = new Player(0, 0);
        player.takeDamage(20);
        expect(player.hp).toBe(80);
    });

    it('should gain xp and level up correctly', () => {
        const player = new Player(0, 0);
        
        // Initial state
        expect(player.level).toBe(1);
        expect(player.xpToNext).toBe(100);

        // Add some XP, no level up
        const leveledUp1 = player.addXp(50);
        expect(leveledUp1).toBe(false);
        expect(player.xp).toBe(50);
        expect(player.level).toBe(1);

        // Add enough XP to level up
        const leveledUp2 = player.addXp(60);
        expect(leveledUp2).toBe(true);
        expect(player.level).toBe(2);
        expect(player.xp).toBe(10); // 50 + 60 = 110, 110 - 100 = 10
        expect(player.xpToNext).toBe(150); // 100 * 1.5
    });

    it('should move towards target position', () => {
        const player = new Player(0, 0);
        player.speed = 100;
        
        // Move towards (100, 0) for 0.1 seconds
        player.update(0.1, { x: 100, y: 0 }, { width: 800, height: 600 });
        
        // Expected distance moved: speed * dt = 100 * 0.1 = 10
        // Because of the player radius (15), bounds checking sets x = max(15, x)
        // Wait, player starts at 0, 0. Radius is 15.
        // During update: moveX = 10. x becomes 10.
        // Bounds check: x = max(15, min(width-15, 10)) -> x = 15.
        // So x should be 15.
        expect(player.x).toBe(15);
        expect(player.y).toBe(15);
    });
});
