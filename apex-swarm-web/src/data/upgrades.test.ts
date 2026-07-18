import { describe, it, expect } from 'vitest';
import { RUN_UPGRADES, PERM_UPGRADES } from './upgrades';
import { Player } from '../entities/Player';

describe('Upgrades Data Unit Tests', () => {
    it('Run upgrades should apply correctly to player', () => {
        const player = new Player(0, 0);
        
        const dmgUp = RUN_UPGRADES.find(u => u.id === 'dmg_up');
        dmgUp?.apply(player);
        expect(player.damageMultiplier).toBe(1.25);

        const speedUp = RUN_UPGRADES.find(u => u.id === 'speed_up');
        speedUp?.apply(player);
        expect(player.speedMultiplier).toBe(1.15);

        const fireRateUp = RUN_UPGRADES.find(u => u.id === 'fire_rate_up');
        fireRateUp?.apply(player);
        expect(player.fireRateMultiplier).toBe(0.8);
    });

    it('Permanent upgrades should apply correct math per level', () => {
        const player = new Player(0, 0);

        const permHp = PERM_UPGRADES.find(u => u.id === 'perm_hp');
        permHp?.apply(player, 2); // Level 2
        expect(player.maxHp).toBe(120); // 100 + 10 * 2
        expect(player.hp).toBe(120);

        const permMagnet = PERM_UPGRADES.find(u => u.id === 'perm_magnet');
        permMagnet?.apply(player, 3); // Level 3
        expect(player.magnetRadius).toBe(160); // 100 + 20 * 3

        const permArmor = PERM_UPGRADES.find(u => u.id === 'perm_armor');
        permArmor?.apply(player, 5); // Level 5
        expect(player.armor).toBe(5); // 0 + 5

        const permRegen = PERM_UPGRADES.find(u => u.id === 'perm_regen');
        permRegen?.apply(player, 4); // Level 4
        expect(player.hpRegen).toBe(0.8); // 0.2 * 4

        const permLoadout = PERM_UPGRADES.find(u => u.id === 'perm_loadout');
        permLoadout?.apply(player, 2); // Level 2
        expect(player.maxWeaponSlots).toBe(8); // 6 + 2
    });
});
