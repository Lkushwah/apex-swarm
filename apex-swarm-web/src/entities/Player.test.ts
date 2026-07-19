import { describe, it, expect } from 'vitest';
import { Player } from './Player';

describe('Player Entity Unit Tests', () => {
    it('should initialize with correct default values', () => {
        const player = new Player(100, 100);
        expect(player.x).toBe(100);
        expect(player.y).toBe(100);
        expect(player.hp).toBe(100);
        expect(player.maxHp).toBe(100);
        expect(player.level).toBe(1);
        expect(player.xp).toBe(0);
        expect(player.armor).toBe(0);
        expect(player.hpRegen).toBe(0);
        expect(player.magnetRadius).toBe(100);
    });

    it('should take damage correctly without armor', () => {
        const player = new Player(0, 0);
        player.takeDamage(20);
        expect(player.hp).toBe(80);
    });

    it('should reduce taken damage with armor, minimum 1', () => {
        const player = new Player(0, 0);
        player.armor = 5;
        player.takeDamage(20); // 20 - 5 = 15 damage
        expect(player.hp).toBe(85);

        player.invincibilityTimer = 0; // Reset i-frames from first hit

        player.takeDamage(2); // 2 - 5 = -3, minimum 1 damage
        expect(player.hp).toBe(84);
    });

    it('should heal without exceeding maxHp', () => {
        const player = new Player(0, 0);
        player.hp = 50;
        player.heal(30);
        expect(player.hp).toBe(80);
        
        player.heal(50);
        expect(player.hp).toBe(100); // capped at maxHp (100)
    });

    it('should regenerate HP over time via update()', () => {
        const player = new Player(0, 0);
        player.hp = 50;
        player.hpRegen = 10; // 10 hp per sec
        
        // Update for 0.5s -> heals 5
        player.update(0.5, { x: 0, y: 0 }, { width: 800, height: 600 });
        expect(player.hp).toBe(55);
        
        // Does not exceed maxHp
        player.update(10, { x: 0, y: 0 }, { width: 800, height: 600 });
        expect(player.hp).toBe(100);
    });

    it('should gain xp and level up correctly', () => {
        const player = new Player(0, 0);
        expect(player.level).toBe(1);
        expect(player.xpToNext).toBe(100);

        const leveledUp1 = player.addXp(50);
        expect(leveledUp1).toBe(false);
        expect(player.xp).toBe(50);

        const leveledUp2 = player.addXp(60);
        expect(leveledUp2).toBe(true);
        expect(player.level).toBe(2);
        expect(player.xp).toBe(10); 
        expect(player.xpToNext).toBe(135); 
    });

    it('should move towards target position normally', () => {
        const player = new Player(0, 0);
        player.speed = 100;
        
        player.update(0.1, { x: 100, y: 0 }, { width: 800, height: 600 });
        
        expect(player.x).toBe(15);
        expect(player.y).toBe(15);
    });

    it('should dash in target direction with cooldown', () => {
        const player = new Player(100, 100);
        player.speed = 100;
        
        player.dash({ x: 200, y: 100 }); // Dashing to the right
        
        expect(player.isDashing).toBe(true);
        expect(player.dashCooldownTimer).toBe(4.0);
        expect(player.dashDurationTimer).toBe(0.15);
        
        // Dash applies 3x speed multiplier
        // Move during dash: speed(100) * 3 = 300. In 0.1s, moved 30.
        player.update(0.1, { x: 100, y: 100 }, { width: 800, height: 600 });
        expect(player.x).toBeCloseTo(130);
        expect(player.isDashing).toBe(true);
        
        // Finish dash (0.049s left so it's still dashing for this frame)
        player.update(0.049, { x: 100, y: 100 }, { width: 800, height: 600 });
        expect(player.x).toBeCloseTo(144.7);
        
        // Run out the rest of the timer
        player.update(0.001, { x: 100, y: 100 }, { width: 800, height: 600 });
        
        // Cooldown remains, dash duration ends
        expect(player.isDashing).toBe(false);
        expect(player.dashCooldownTimer).toBeCloseTo(3.85);

        // Try dashing again (should be ignored due to cooldown)
        player.dash({ x: 200, y: 100 });
        expect(player.isDashing).toBe(false);
    });
});
