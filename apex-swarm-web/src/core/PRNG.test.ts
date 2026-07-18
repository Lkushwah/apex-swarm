import { describe, it, expect } from 'vitest';
import { PRNG } from './PRNG';

describe('PRNG', () => {
    it('should generate deterministic sequences for the same seed', () => {
        const prng1 = new PRNG(12345);
        const prng2 = new PRNG(12345);

        for (let i = 0; i < 100; i++) {
            expect(prng1.next()).toBe(prng2.next());
        }
    });

    it('should generate numbers between 0 (inclusive) and 1 (exclusive)', () => {
        const prng = new PRNG(999);
        for (let i = 0; i < 1000; i++) {
            const val = prng.next();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        }
    });

    it('should generate integers within a range', () => {
        const prng = new PRNG(42);
        for (let i = 0; i < 100; i++) {
            const val = prng.nextInt(5, 10);
            expect(val).toBeGreaterThanOrEqual(5);
            expect(val).toBeLessThan(10);
            expect(Number.isInteger(val)).toBe(true);
        }
    });
});
