import { Projectile } from './Projectile';
import { Enemy } from './Enemy';
import { Player } from './Player';

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
        
        // Splash damage
        for (const other of enemies) {
            if (other.isDead) continue;
            const dist = Math.hypot(this.x - other.x, this.y - other.y);
            if (dist <= this.splashRadius) {
                const dmgDealt = Math.min(other.hp, this.damage);
                other.hp -= this.damage;
                if (apexSystem.lifesteal > 0) player.heal(dmgDealt * apexSystem.lifesteal);
            }
        }
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
                // Throttle hits? Just deal a small fraction of damage per frame, or use cooldown.
                // Simple: deal dt * damage
                const d = this.damage * dt * 5;
                const dmgDealt = Math.min(e.hp, d);
                e.hp -= d;
                if (apexSystem.lifesteal > 0) player.heal(dmgDealt * apexSystem.lifesteal);
            }
        }
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
        if (this.hitSet.has(e)) return; // already hit
        this.hitSet.add(e);
        
        const falloff = Math.max(0, 0.2 - this.falloffReduction);
        const currentDamage = this.damage * Math.pow(1 - falloff, this.jumpsDone);
        
        const dmgDealt = Math.min(e.hp, currentDamage);
        e.hp -= currentDamage;
        if (apexSystem.lifesteal > 0) player.heal(dmgDealt * apexSystem.lifesteal);

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
}

export class ScytheArcProjectile extends Projectile {
    private playerRef: Player;
    private baseAngle: number;
    private swingProgress: number = 0;

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

        for (const e of enemies) {
            if (e.isDead) continue;
            const dist = Math.hypot(this.x - e.x, this.y - e.y);
            if (dist < this.radius + e.radius && !(e as any)._scytheHit) {
                (e as any)._scytheHit = true; // prevent multi-hit per swing
                setTimeout(() => { if(e) delete (e as any)._scytheHit; }, 300);
                
                const d = this.damage;
                const dmgDealt = Math.min(e.hp, d);
                e.hp -= d;
                
                // Add melee lifesteal from passive
                const totalLifesteal = apexSystem.lifesteal + player.meleeLifesteal;
                if (totalLifesteal > 0) player.heal(dmgDealt * totalLifesteal);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D, _time?: number) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.fill();
    }
}
