import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponSystem } from './WeaponSystem';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';

describe('WeaponSystem', () => {
    let player: Player;
    let weaponSystem: WeaponSystem;
    let enemies: Enemy[];
    let projectiles: Projectile[];

    beforeEach(() => {
        player = new Player(100, 100);
        player.weapons = [{ id: 'kinetic_blaster', level: 1, evolved: false }];
        weaponSystem = new WeaponSystem(player);
        enemies = [];
        projectiles = [];
    });

    it('should fire a projectile when cooldown expires and enemy is present', () => {
        enemies.push(new Enemy(150, 100, 1)); // enemy 50px away
        
        weaponSystem.update(0.5, enemies, projectiles); // 0.5s passes, kinetic_blaster baseRate is 0.45 at Lvl 1
        
        expect(projectiles.length).toBe(1);
        expect(projectiles[0].x).toBe(100); // starts at player
        expect(projectiles[0].y).toBe(100);
        expect(projectiles[0].vx).toBeGreaterThan(0); // moving right
    });

    it('should not fire if no enemies are present', () => {
        weaponSystem.update(0.5, enemies, projectiles);
        expect(projectiles.length).toBe(0);
    });

    it('should factor in player damage multiplier', () => {
        player.damageMultiplier = 2.0;
        enemies.push(new Enemy(150, 100, 1));
        
        weaponSystem.update(0.5, enemies, projectiles);
        
        expect(projectiles[0].damage).toBeGreaterThan(25); // base is 25 * 1.15 = 28.75, *2.0 = 57.5
    });
});
