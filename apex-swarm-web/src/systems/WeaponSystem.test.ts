import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponSystem } from './WeaponSystem';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';

describe('WeaponSystem Unit Tests', () => {
    let player: Player;
    let ws: WeaponSystem;
    let enemies: Enemy[];
    let projectiles: Projectile[];

    beforeEach(() => {
        player = new Player(100, 100);
        ws = new WeaponSystem(player);
        enemies = [new Enemy(200, 100, 1.0, 'swarmer')]; // enemy to the right
        projectiles = [];
    });

    it('should fire equipped weapons if cooldown is ready and enemies exist', () => {
        // Player starts with level 1 kinetic blaster
        ws.update(0.1, enemies, projectiles); // Cooldown initially 0, should fire immediately
        
        expect(projectiles.length).toBe(1);
        expect(projectiles[0].damage).toBeGreaterThan(0);
        // Projectile should be moving right (angle 0)
        expect(projectiles[0].vx).toBeGreaterThan(0);
        expect(projectiles[0].vy).toBeCloseTo(0);
    });

    it('should respect weapon cooldowns and fireRateMultiplier', () => {
        player.fireRateMultiplier = 0.5; // fires twice as fast (cooldowns are halved)
        
        ws.update(0.1, enemies, projectiles); // Fires first shot
        expect(projectiles.length).toBe(1);
        
        // Base kinetic blaster rate is 0.46 (Math.max(0.2, 0.5 - 0.04)). 
        // With multiplier 0.5, cooldown set to 0.23.
        
        ws.update(0.1, enemies, projectiles); // Cooldown not ready
        expect(projectiles.length).toBe(1);
        
        ws.update(0.15, enemies, projectiles); // 0.1 + 0.15 = 0.25 > 0.23, should fire again
        expect(projectiles.length).toBe(2);
    });

    it('should apply apexDamageBonus to weapon damage', () => {
        ws.apexDamageBonus = 1.0; // +100% damage
        player.damageMultiplier = 1.0; // Total multiplier: 2.0
        
        ws.update(0.1, enemies, projectiles);
        
        const baseDmg = 25 * (1 + 1 * 0.15); // Level 1 kinetic blaster base damage = 28.75
        expect(projectiles[0].damage).toBeCloseTo(baseDmg * 2.0);
    });

    it('Kinetic Blaster should fire multiple projectiles at higher levels', () => {
        player.weapons[0].level = 3; // 1 + floor(3/2) = 2 projectiles
        
        ws.update(0.1, enemies, projectiles);
        expect(projectiles.length).toBe(2);
    });

    it('should not fire if no enemies are present', () => {
        enemies = [];
        ws.update(0.1, enemies, projectiles);
        expect(projectiles.length).toBe(0);
    });

    it('should fire RailgunBeam when kinetic_blaster is evolved', () => {
        player.weapons[0].evolved = true;
        ws.update(0.1, enemies, projectiles);
        expect(projectiles.length).toBe(1);
        expect(projectiles[0].constructor.name).toBe('RailgunBeam');
    });

    it('should maintain drones for drone_swarm weapon', () => {
        player.weapons = [{ id: 'drone_swarm', level: 1, evolved: false }];
        ws.update(0.1, enemies, projectiles);
        expect(ws.drones.length).toBeGreaterThan(0);
        expect(ws.drones[0].constructor.name).toBe('Drone');
    });
});
