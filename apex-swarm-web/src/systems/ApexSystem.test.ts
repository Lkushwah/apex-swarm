import { describe, it, expect, beforeEach } from 'vitest';
import { ApexSystem } from './ApexSystem';
import { Player } from '../entities/Player';

describe('ApexSystem Unit Tests', () => {
    let player: Player;
    let apex: ApexSystem;

    beforeEach(() => {
        player = new Player(100, 100);
        apex = new ApexSystem(player);
    });

    it('should fill meter from kills, time, and damage', () => {
        expect(apex.meter).toBe(0);
        
        apex.addKill();
        expect(apex.meter).toBe(1);
        
        apex.addTime(10); // 10s * 0.4 = 4
        expect(apex.meter).toBe(5);
        
        apex.addDamage(10); // 10 dmg / 100 maxHp = 10% lost -> 3 meter
        expect(apex.meter).toBe(8);
    });

    it('should cap meter at MAX_METER and respect fillRateBonus', () => {
        apex.fillRateBonus = 0.5; // +50% fill rate
        apex.addMeter(10); 
        expect(apex.meter).toBe(15);
        
        apex.addMeter(100); // 100 * 1.5 = 150
        expect(apex.meter).toBe(apex.MAX_METER); // 100
        expect(apex.canTrigger()).toBe(true);
    });

    it('should transition states correctly on trigger', () => {
        apex.addMeter(100);
        expect(apex.canTrigger()).toBe(true);
        
        apex.manualTrigger();
        expect(apex.getState()).toBe('TIMESLOW');
        expect(apex.currentTimeScale).toBe(0.1);
        
        apex.update(0.4); // TIMESLOW_DURATION
        
        expect(apex.getState()).toBe('ACTIVE');
        expect(apex.currentTimeScale).toBe(1.0);
        expect(apex.isInvincible).toBe(true);
        expect(apex.lifesteal).toBe(0.15);
        
        apex.update(8); // ACTIVE_DURATION
        
        expect(apex.getState()).toBe('FADING');
        
        apex.update(1); // FADING_DURATION
        
        expect(apex.getState()).toBe('READY');
        expect(apex.isInvincible).toBe(false);
        expect(apex.meter).toBe(0);
    });

    it('should trigger safety net if canTrigger is true', () => {
        apex.addMeter(100);
        
        apex.triggerSafetyNet();
        expect(apex.getState()).toBe('TIMESLOW');
    });

    it('should handle banked overflow correctly', () => {
        apex.overflowCap = 20; // Allow 20 banked overflow
        
        apex.addMeter(150); // Will fill to 100, overflow 50, capped at 20
        expect(apex.meter).toBe(100);
        expect(apex.bankedOverflow).toBe(20);
        
        apex.manualTrigger();
        apex.update(0.4); // transition to ACTIVE
        
        // Active duration is normally 8s. Overflow bonus: 8 * (20/100) = 1.6s. Total 9.6s.
        // We will just verify it's ACTIVE for > 8s
        expect(apex.getState()).toBe('ACTIVE');
        apex.update(8);
        expect(apex.getState()).toBe('ACTIVE'); // Still active due to overflow bonus
        apex.update(1.6);
        expect(apex.getState()).toBe('FADING'); // Now fading
    });
});
