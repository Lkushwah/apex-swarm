export class Player {
    public x: number;
    public y: number;
    public radius: number = 15;
    public color: string = '#38bdf8'; // Sky 400

    public speed: number = 180;
    public maxHp: number = 100;
    public hp: number = 100;
    
    public damageMultiplier: number = 1.0;
    public fireRateMultiplier: number = 1.0;
    public speedMultiplier: number = 1.0;

    public xp: number = 0;
    public level: number = 1;
    public xpToNext: number = 100;

    public dashCooldownTimer: number = 0;
    public dashDurationTimer: number = 0;
    public isDashing: boolean = false;
    public dashDir?: { x: number, y: number };

    // Inventory
    public weapons: { id: string, level: number, evolved: boolean }[] = [{ id: 'kinetic_blaster', level: 1, evolved: false }];
    public passives: { id: string, level: number }[] = [];

    // Weapon/Passive specific stats
    public critChance: number = 0;
    public critDamage: number = 1.5;
    public orbitBonus: number = 0;
    public chainBonus: number = 0;
    public chainFalloffReduction: number = 0;
    public splashBonus: number = 0;
    public meleeLifesteal: number = 0;
    public droneRegen: number = 0;
    public droneRespawnBonus: number = 0;
    public armor: number = 0;
    public maxDashCharges: number = 1;
    public globalLifesteal: number = 0;

    // Real properties (no more `as any` casts)
    public magnetRadius: number = 100;
    public creditMultiplier: number = 1.0;
    public hpRegen: number = 0; // HP per second, from perm_regen
    public maxWeaponSlots: number = 6;
    public maxPassiveSlots: number = 6;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public update(dt: number, targetPos: { x: number, y: number }, bounds: { width: number, height: number }) {
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
        if (this.dashDurationTimer > 0) {
            this.dashDurationTimer -= dt;
            this.isDashing = this.dashDurationTimer > 0;
        }

        const dx = targetPos.x - this.x;
        const dy = targetPos.y - this.y;
        const dist = Math.hypot(dx, dy);

        let currentSpeed = this.speed * this.speedMultiplier;
        if (this.isDashing) currentSpeed *= 3.0;

        if (this.isDashing && this.dashDir) {
            // Force move in dash direction
            this.x += this.dashDir.x * currentSpeed * dt;
            this.y += this.dashDir.y * currentSpeed * dt;
        } else if (dist > 5) {
            // Normal move toward target
            const moveX = (dx / dist) * currentSpeed * dt;
            const moveY = (dy / dist) * currentSpeed * dt;
            this.x += moveX;
            this.y += moveY;
        }

        this.x = Math.max(this.radius, Math.min(bounds.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(bounds.height - this.radius, this.y));

        // HP Regen
        if (this.hpRegen > 0 && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * dt);
        }
    }

    public dash(targetPos: { x: number, y: number }) {
        if (this.dashCooldownTimer <= 0) {
            this.isDashing = true;
            this.dashDurationTimer = 0.15;
            this.dashCooldownTimer = 4.0;
            
            // Calculate direction toward current pointer
            const dx = targetPos.x - this.x;
            const dy = targetPos.y - this.y;
            const dist = Math.hypot(dx, dy) || 1;
            this.dashDir = { x: dx / dist, y: dy / dist };
        }
    }

    public draw(ctx: CanvasRenderingContext2D, apexState?: string) {
        const isApex = apexState === 'ACTIVE' || apexState === 'FADING';
        const pulse = isApex ? 0.5 + 0.5 * Math.sin(Date.now() / 80) : 0;

        ctx.globalAlpha = this.isDashing ? 0.5 : 1.0;

        if (isApex) {
            // Outer ring
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10 + pulse * 6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(249,115,22,${0.5 + pulse * 0.5})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.shadowBlur = isApex ? 30 + pulse * 20 : 15;
        ctx.shadowColor = isApex ? '#f97316' : this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isApex ? `rgba(249,${115 + Math.floor(pulse * 80)},22,1)` : this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }


    public takeDamage(amount: number) {
        // Apply armor reduction — at least 1 damage always gets through
        const reduced = Math.max(1, amount - this.armor);
        this.hp -= reduced;
    }

    public heal(amount: number) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }


    public addXp(amount: number): boolean {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            return true; // Leveled up
        }
        return false;
    }
}
