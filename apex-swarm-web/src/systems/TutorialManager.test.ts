// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorialManager } from './TutorialManager';
import { TutorialUI } from '../ui/TutorialUI';

describe('TutorialManager', () => {
    let ui: TutorialUI;
    let manager: TutorialManager;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="tutorial-screen">
                <h2 id="tutorial-title"></h2>
                <img id="tutorial-img" />
                <p id="tutorial-message"></p>
                <button id="tutorial-btn"></button>
            </div>
        `;
        localStorage.clear();
        ui = new TutorialUI();
        manager = new TutorialManager(ui);
    });

    it('should initialize with empty seenTutorials if nothing in localStorage', () => {
        expect(manager.hasSeen('APEX_METER')).toBe(false);
    });

    it('should show tutorial if not seen, and set seen in localStorage', () => {
        const spyShow = vi.spyOn(ui, 'show').mockImplementation(() => {});
        const mockDismiss = vi.fn();
        
        manager.showTutorial('APEX_METER', mockDismiss);
        
        expect(spyShow).toHaveBeenCalled();
        expect(manager.hasSeen('APEX_METER')).toBe(true);
        expect(localStorage.getItem('apex_swarm_tutorials')).toContain('APEX_METER');
    });

    it('should immediately call onDismiss and NOT show UI if already seen', () => {
        const spyShow = vi.spyOn(ui, 'show').mockImplementation(() => {});
        const mockDismiss = vi.fn();

        // Simulate having seen it
        localStorage.setItem('apex_swarm_tutorials', JSON.stringify(['APEX_METER']));
        const manager2 = new TutorialManager(ui);

        manager2.showTutorial('APEX_METER', mockDismiss);

        expect(spyShow).not.toHaveBeenCalled();
        expect(mockDismiss).toHaveBeenCalled();
    });
});
