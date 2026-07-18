import { Projectile } from './Projectile';
import { Enemy } from './Enemy';
import { Player } from './Player';
import { type FloatingText } from './Particles';

export class MissileProjectile extends Projectile {
    private target: Enemy | null = null;
    private splashRadius: number;

    constructor(x: number, y: number, angle: number, damage: number, speed: number, splashRadius: number) {
        super(x, y, angle, damage, speed);
        this.color = '#ef4444'; // Red
        this.splashRadius = splashRadius;
        this.radius = 6;
    }

    public update(dt: number, bounds: { width: number, height: number }, enemies: Enemy[], apexSystem: any, player: Player) {
        // Homing logic
        if (!this.target || this.target.isDead) {
            let minDist = Infinity;
            for (const e of enemies) {
                if (e.isDead) continue;
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist < minDist) { minDist = dist; this.target = e; }
            }
        }
        
        if (this.target && !this.target.isDead) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const angle = Math.atan2(dy, dx);
            const speed = Math.hypot(this.vx, this.vy);
            
            // Turn gradually
            const currentAngle = Math.atan2(this.vy, this.vx);
            const angleDiff = Math.atan2(Math.sin(angle - currentAngle), Math.cos(angle - currentAngle));
            const newAngle = currentAngle + angleDiff * dt * 5;
            
            this.vx = Math.cos(newAngle) * speed;
            this.vy = Math.sin(newAngle) * speed;
        }

        super.update(dt, bounds, enemies, apexSystem, player);
    }

    protected hitEnemy(_e: Enemy, apexSystem: any, player: Player, enemies: Enemy[]) {
        this.isDead = true;
        
        // Splash damage to all enemies in radius
        for (const other of enemies) {
            if (other.isDead) continue;
            const dist = Math.hypot(this.x - other.x, this.y - other.y);
            if (dist <= this.splashRadius) {
                // Crit roll
                let finalDamage = this.damage;
                let isCrit = false;
                if (player.critChance > 0 && Math.random() < player.critChance) {
                    finalDamage *= player.critDamage;
                    isCrit = true;
                }

                const dmgDealt = Math.min(other.hp, finalDamage);
                other.hp -= finalDamage;

                const totalLifesteal = (apexSystem?.lifesteal ?? 0) + player.globalLifesteal;
                if (totalLifesteal > 0) player.heal(dmgDealt * totalLifesteal);

                // Floating text
                Projectile.floatingTexts.push({
                    x: other.x, y: other.y - 10,
                    text: isCrit ? `${Math.floor(finalDamage)} CRIT!` : String(Math.floor(finalDamage)),
                    color: isCrit ? '#fbbf24' : '#fca5a5',
                    life: 0.5, maxLife: 0.5, vy: -30
                } as FloatingText);
            }
        }

        // Explosion particles
        Projectile.particles.push({ x: this.x, y: this.y, color: '#ef4444', count: 8 });
    }

    public draw(ctx: CanvasRenderingContext2D, _time?: number) {
        ctx.save();
        ctx.translate(this.x, this.y);
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        // Missile body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.6);
        ctx.lineTo(-this.radius * 0.5, 0);
        ctx.lineTo(-this.radius, this.radius * 0.6);
        ctx.closePath();
        ctx.fill();

        // Engine glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.5, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

export class PlasmaOrbProjectile extends Projectile {
    private playerRef: Player;
    private orbitAngle: number;
    private orbitDistance: number;

    constructor(player: Player, angleOffset: number, damage: number, sizeBonus: number) {
        super(player.x, player.y, 0, damage, 0);
        this.playerRef = player;
        this.orbitAngle = angleOffset;
        this.orbitDistance = 80;
        this.color = '#a855f7'; // Purple
        this.radius = 8 * (1 + sizeBonus);
        this.life = 0.8; // Despawn right as next volley fires
    }

    public update(dt: number, _bounds: { width: number, height: number }, enemies: Enemy[], apexSystem: any, player: Player) {
        this.orbitAngle += dt * 3; // orbit speed
        this.x = this.playerRef.x + Math.cos(this.orbitAngle) * this.orbitDistance;
        this.y = this.playerRef.y + Math.sin(this.orbitAngle) * this.orbitDistance;
        
        // Custom collision, doesn't die on hit
        for (const e of enemies) {
            if (e.isDead) continue;
            const dist = Math.hypot(this.x - e.x, this.y - e.y);
            if (dist < this.radius + e.radius) {
                const d = this.damage * dt * 5;
                const dmgDealt = Math.min(e.hp, d);
                e.hp -= d;

                const totalLifesteal = (apexSystem?.lifesteal ?? 0) + player.globalLifesteal;
                if (totalLifesteal > 0) player.heal(dmgDealt * totalLifesteal);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D, _time?: number) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

export class ChainLightningProjectile extends Projectile {
    private maxJumps: number;
    private jumpsDone: number = 0;
    private hitSet: Set<Enemy> = new Set();
    private falloffReduction: number;

    constructor(x: number, y: number, angle: number, damage: number, speed: number, jumps: number, falloffReduction: number) {
        super(x, y, angle, damage, speed);
        this.color = '#38bdf8'; // Light Blue
        this.maxJumps = jumps;
        this.falloffReduction = falloffReduction;
        this.radius = 3;
    }

    protected hitEnemy(e: Enemy, apexSystem: any, player: Player, enemies: Enemy[]) {
        if (this.hitSet.has(e)) return;
        this.hitSet.add(e);
        
        const falloff = Math.max(0, 0.2 - this.falloffReduction);
        let currentDamage = this.damage * Math.pow(1 - falloff, this.jumpsDone);
        
        // Crit roll
        let isCrit = false;
        if (player.critChance > 0 && Math.random() < player.critChance) {
            currentDamage *= player.critDamage;
            isCrit = true;
        }

        const dmgDealt = Math.min(e.hp, currentDamage);
        e.hp -= currentDamage;

        const totalLifesteal = (apexSystem?.lifesteal ?? 0) + player.globalLifesteal;
        if (totalLifesteal > 0) player.heal(dmgDealt * totalLifesteal);

        // Floating text
        Projectile.floatingTexts.push({
            x: e.x, y: e.y - 10,
            text: isCrit ? `${Math.floor(currentDamage)} CRIT!` : String(Math.floor(currentDamage)),
            color: isCrit ? '#fbbf24' : '#93c5fd',
            life: 0.5, maxLife: 0.5, vy: -30
        } as FloatingText);

        this.jumpsDone++;
        if (this.jumpsDone >= this.maxJumps) {
            this.isDead = true;
            return;
        }

        // Find next target
        let nextTarget: Enemy | null = null;
        let minDist = 200; // Chain range
        for (const other of enemies) {
            if (other.isDead || this.hitSet.has(other)) continue;
            const dist = Math.hypot(e.x - other.x, e.y - other.y);
            if (dist < minDist) {
                minDist = dist;
                nextTarget = other;
            }
        }

        if (nextTarget) {
            const angle = Math.atan2(nextTarget.y - this.y, nextTarget.x - this.x);
            const speed = Math.hypot(this.vx, this.vy);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            this.isDead = true;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, _time?: number) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Lightning trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 0.04 + (Math.random() - 0.5) * 6, this.y - this.vy * 0.04 + (Math.random() - 0.5) * 6);
        ctx.lineTo(this.x - this.vx * 0.08, this.y - this.vy * 0.08);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

export class ScytheArcProjectile extends Projectile {
    private playerRef: Player;
    private baseAngle: number;
    private swingProgress: number = 0;
    private hitEnemies: Set<Enemy> = new Set();

    constructor(player: Player, angle: number, damage: number) {
        super(player.x, player.y, 0, damage, 0);
        this.playerRef = player;
        this.baseAngle = angle;
        this.color = '#fbbf24'; // Amber
        this.life = 0.2; // Quick swing
        this.radius = 40; // Hitbox radius
    }

    public update(dt: number, _bounds: { width: number, height: number }, enemies: Enemy[], apexSystem: any, player: Player) {
        this.life -= dt;
        if (this.life <= 0) {
            this.isDead = true;
            return;
        }
        
        this.swingProgress += dt * 5;
        const currentAngle = this.baseAngle - Math.PI/4 + (this.swingProgress * Math.PI/2);
        
        this.x = this.playerRef.x + Math.cos(currentAngle) * 50;
        this.y = this.playerRef.y + Math.sin(currentAngle) * 50;

        // Count targets hit for +5% per-target bonus (GDD §5.5)
        let targetsHitThisSwing = 0;

        for (const e of enemies) {
            if (e.isDead || this.hitEnemies.has(e)) continue;
            const dist = Math.hypot(this.x - e.x, this.y - e.y);
            if (dist < this.radius + e.radius) {
                this.hitEnemies.add(e);
                targetsHitThisSwing++;

                // +5% per additional target, up to +50%
                const multiTargetBonus = 1 + Math.min(0.5, 0.05 * Math.max(0, this.hitEnemies.size - 1));
                let d = this.damage * multiTargetBonus;

                // Crit roll
                let isCrit = false;
                if (player.critChance > 0 && Math.random() < player.critChance) {
                    d *= player.critDamage;
                    isCrit = true;
                }

                const dmgDealt = Math.min(e.hp, d);
                e.hp -= d;
                
                // Melee lifesteal from passive + global + apex
                const totalLifesteal = (apexSystem?.lifesteal ?? 0) + player.meleeLifesteal + player.globalLifesteal;
                if (totalLifesteal > 0) player.heal(dmgDealt * totalLifesteal);

                // Floating text
                Projectile.floatingTexts.push({
                    x: e.x, y: e.y - 10,
                    text: isCrit ? `${Math.floor(d)} CRIT!` : String(Math.floor(d)),
                    color: isCrit ? '#fbbf24' : '#fcd34d',
                    life: 0.4, maxLife: 0.4, vy: -25
                } as FloatingText);
            }
        }
        void targetsHitThisSwing;
    }

    public draw(ctx: CanvasRenderingContext2D, _time?: number) {
        // Arc slash effect
        const currentAngle = this.baseAngle - Math.PI/4 + (this.swingProgress * Math.PI/2);
        
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.playerRef.x, this.playerRef.y, 50, currentAngle - 0.5, currentAngle + 0.5);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
