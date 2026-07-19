import { describe, it, expect } from 'vitest';
import { Collectible } from './Collectible';
import { Player } from './Player';

describe('Collectible Entity Unit Tests', () => {
    it('should initialize correctly as XP', () => {
        const c = new Collectible(100, 100, 'xp');
        expect(c.x).toBe(100);
        expect(c.y).toBe(100);
        expect(c.type).toBe('xp');
        expect(c.xpValue).toBe(40);
        expect(c.isCollected).toBe(false);
        expect(c.color).toBe('#4ade80');
    });

    it('should initialize correctly as Credit', () => {
        const c = new Collectible(100, 100, 'credit');
        expect(c.type).toBe('credit');
        expect(c.xpValue).toBe(0);
        expect(c.color).toBe('#fbbf24');
    });

    it('should be pulled towards player if within magnetRadius', () => {
        const c = new Collectible(100, 100, 'xp');
        const player = new Player(150, 100); // dist = 50
        
        // magnetRadius = 100, dist = 50 -> should be pulled
        c.update(0.1, player, 100);
        
        // x should increase towards 150
        expect(c.x).toBeGreaterThan(100);
        expect(c.isCollected).toBe(false); // not close enough (15 + 6 = 21)
    });

    it('should NOT be pulled if outside magnetRadius', () => {
        const c = new Collectible(100, 100, 'xp');
        const player = new Player(300, 100); // dist = 200
        
        c.update(0.1, player, 100);
        
        // should not move
        expect(c.x).toBe(100);
    });

    it('should be collected when colliding with player', () => {
        const c = new Collectible(100, 100, 'xp');
        const player = new Player(110, 100); // dist = 10 < 21
        
        const isCollected = c.update(0.1, player, 100);
        
        expect(isCollected).toBe(true);
        expect(c.isCollected).toBe(true);
    });
});
