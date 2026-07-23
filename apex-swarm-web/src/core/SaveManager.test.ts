// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from './SaveManager';

describe('SaveManager', () => {
    let sm: SaveManager;

    beforeEach(() => {
        localStorage.clear();
        sm = new SaveManager();
    });

    it('should handle cosmetic unlock state correctly', () => {
        expect(sm.hasCosmetic('default')).toBe(true);
        expect(sm.hasCosmetic('neon_red')).toBe(false);
        sm.unlockCosmetic('neon_red');
        expect(sm.hasCosmetic('neon_red')).toBe(true);
    });

    it('should store and retrieve display name', () => {
        sm.setDisplayName('TestPilot');
        expect(sm.getDisplayName()).toBe('TestPilot');
    });
});
