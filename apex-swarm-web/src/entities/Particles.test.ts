import { describe, it, expect } from 'vitest';
import { Particle, FloatingText, ApexShard, createParticles, createApexShards } from './Particles';

describe('Particles Entity Unit Tests', () => {
    it('Particle should initialize and update correctly', () => {
        const p = new Particle(100, 100, '#ff0000');
        expect(p.x).toBe(100);
        expect(p.y).toBe(100);
        expect(p.color).toBe('#ff0000');
        expect(p.life).toBeGreaterThan(0);
        
        const initialLife = p.life;
        const initialSize = p.size;
        
        const isAlive = p.update(0.1);
        expect(p.life).toBeCloseTo(initialLife - 0.1);
        expect(p.size).toBeLessThan(initialSize);
        // Might be dead if initialLife was very small, but typically 0.25+
    });

    it('FloatingText should move upwards and fade', () => {
        const ft = new FloatingText(100, 100, 'Test', '#ffffff', 1.0);
        expect(ft.y).toBe(100);
        expect(ft.vy).toBe(-35); // default upward velocity
        
        const isAlive = ft.update(0.1);
        expect(isAlive).toBe(true);
        expect(ft.y).toBeCloseTo(96.5); // 100 - (35 * 0.1)
        expect(ft.life).toBeCloseTo(0.9);
    });

    it('FloatingText should return false when life expires', () => {
        const ft = new FloatingText(100, 100, 'Test', '#ffffff', 0.1);
        const isAlive = ft.update(0.2);
        expect(isAlive).toBe(false);
    });

    it('ApexShard should apply gravity and update correctly', () => {
        const shard = new ApexShard(100, 100);
        const initialVy = shard.vy;
        
        shard.update(0.1);
        
        // Gravity increases vy (vy += 60 * dt)
        expect(shard.vy).toBeCloseTo(initialVy + 60 * 0.1);
    });

    it('Helpers should populate arrays correctly', () => {
        const pArr: Particle[] = [];
        createParticles(pArr, 0, 0, '#fff', 5);
        expect(pArr.length).toBe(5);

        const sArr: ApexShard[] = [];
        createApexShards(sArr, 0, 0, 3);
        expect(sArr.length).toBe(3);
    });
});
