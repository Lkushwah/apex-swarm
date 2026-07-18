// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from './SaveManager';

describe('SaveManager', () => {
    let sm: SaveManager;

    beforeEach(() => {
        localStorage.clear();
        sm = new SaveManager();
    });

    it('should have all cosmetics unlocked for testing', () => {
        expect(sm.hasCosmetic('any_random_id')).toBe(true);
    });

    it('should store and retrieve display name', () => {
        sm.setDisplayName('TestPilot');
        expect(sm.getDisplayName()).toBe('TestPilot');
    });
});
