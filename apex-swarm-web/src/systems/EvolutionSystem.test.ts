import { describe, it, expect } from 'vitest';
import { EvolutionSystem } from './EvolutionSystem';
import { Player } from '../entities/Player';

describe('EvolutionSystem Unit Tests', () => {
    it('should not evolve if weapon is not max level', () => {
        const player = new Player(0, 0);
        player.weapons = [{ id: 'kinetic_blaster', level: 7, evolved: false }];
        player.passives = [{ id: 'target_analyzer', level: 5 }];

        const evolved = EvolutionSystem.checkEvolutions(player);
        expect(evolved).toBe(false);
        expect(player.weapons[0].evolved).toBe(false);
    });

    it('should not evolve if passive is not max level', () => {
        const player = new Player(0, 0);
        player.weapons = [{ id: 'kinetic_blaster', level: 8, evolved: false }];
        player.passives = [{ id: 'target_analyzer', level: 4 }];

        const evolved = EvolutionSystem.checkEvolutions(player);
        expect(evolved).toBe(false);
        expect(player.weapons[0].evolved).toBe(false);
    });

    it('should not evolve if missing required passive', () => {
        const player = new Player(0, 0);
        player.weapons = [{ id: 'kinetic_blaster', level: 8, evolved: false }];
        player.passives = [{ id: 'overcharger', level: 5 }]; // Wrong passive

        const evolved = EvolutionSystem.checkEvolutions(player);
        expect(evolved).toBe(false);
        expect(player.weapons[0].evolved).toBe(false);
    });

    it('should evolve if both weapon and passive are max level', () => {
        const player = new Player(0, 0);
        player.weapons = [{ id: 'kinetic_blaster', level: 8, evolved: false }];
        player.passives = [{ id: 'targeting_module', level: 5 }];

        const evolved = EvolutionSystem.checkEvolutions(player);
        expect(evolved).toBe(true);
        expect(player.weapons[0].evolved).toBe(true);
    });
});
