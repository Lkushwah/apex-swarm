import { Player } from '../entities/Player';

export type ApexState = 'READY' | 'TRIGGERED' | 'TIMESLOW' | 'ACTIVE' | 'FADING' | 'SPENT';

export class ApexSystem {
    private player: Player;
    private state: ApexState = 'READY'; // Represents 'READY_TO_FILL' when meter < 100
    private timer: number = 0;

    // Meter state
    public meter: number = 0;
    public readonly MAX_METER = 100;

    // Config
    private readonly TIMESLOW_DURATION = 0.4;    // seconds of time-slow
    private readonly ACTIVE_DURATION = 8;         // seconds of APEX active
    private readonly FADING_DURATION = 1;         // seconds of warning

    // Per-run bonus
    public durationBonus: number = 0;
    public damageBonus: number = 0;
    public overflowCap: number = 0; // % of max meter that can be banked
    public fillRateBonus: number = 0; // % bonus to fill rate

    public currentTimeScale: number = 1.0;
    public isInvincible: boolean = false;
    public damageMultiplierBonus: number = 0;
    public lifesteal: number = 0; // % of damage dealt

    // Overflow bank
    public bankedOverflow: number = 0;

    constructor(player: Player) {
        this.player = player;
    }

    public getState(): ApexState { return this.state; }
    
    // API for meter filling
    public addMeter(amount: number) {
        if (this.state === 'READY') {
            const actualAmount = amount * (1 + this.fillRateBonus);
            this.meter += actualAmount;
            
            if (this.meter > this.MAX_METER) {
                this.bankedOverflow = Math.min(this.overflowCap, this.meter - this.MAX_METER);
                this.meter = this.MAX_METER;
            }
        }
    }

    public addKill() { this.addMeter(1); }
    public addTime(dt: number) { this.addMeter(0.4 * dt); }
    public addDamage(damageTaken: number) {
        const pctLost = damageTaken / this.player.maxHp;
        // +3 per 10% lost -> 30 * pctLost
        this.addMeter(30 * pctLost);
    }

    public canTrigger(): boolean {
        return this.state === 'READY' && this.meter >= this.MAX_METER;
    }

    public manualTrigger() {
        if (this.canTrigger()) {
            this.state = 'TIMESLOW';
            this.timer = this.TIMESLOW_DURATION;
            this.currentTimeScale = 0.1;
            this.isInvincible = true;
        }
    }

    // Safety net trigger
    public triggerSafetyNet() {
        if (this.canTrigger()) {
            this.manualTrigger();
        }
    }

    public update(dt: number): void {
        if (this.state === 'TIMESLOW') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.activateApex();
            }
        } else if (this.state === 'ACTIVE') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.beginFading();
            }
        } else if (this.state === 'FADING') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.deactivate();
            }
        }
    }

    private activateApex() {
        this.state = 'ACTIVE';
        this.currentTimeScale = 1.0;
        this.isInvincible = true;
        this.damageMultiplierBonus = 2.0 * (1 + this.damageBonus);
        this.lifesteal = 0.15; // 15% lifesteal
        
        // Overflow duration extension: 1% overflow = 1% extra base duration
        const overflowBonus = this.ACTIVE_DURATION * (this.bankedOverflow / 100);
        this.timer = this.ACTIVE_DURATION + this.durationBonus + overflowBonus;
    }

    private beginFading() {
        this.state = 'FADING';
        this.timer = this.FADING_DURATION;
    }

    private deactivate() {
        this.state = 'READY'; // Resets to fillable state
        this.currentTimeScale = 1.0;
        this.isInvincible = false;
        this.damageMultiplierBonus = 0;
        this.lifesteal = 0;
        this.meter = 0;
        this.bankedOverflow = 0;
    }
}
