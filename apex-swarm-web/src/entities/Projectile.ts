import { Enemy } from './Enemy';
import { Player } from './Player';

export class Projectile {
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public damage: number;
    public radius: number = 4;
    public color: string = '#fde047'; // Yellow 300
    public life: number = 2; // seconds
    public isDead: boolean = false;

    constructor(x: number, y: number, angle: number, damage: number, speed: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
    }

    public update(dt: number, bounds: { width: number, height: number }, enemies: Enemy[], apexSystem: any, player: Player) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;

        if (this.life <= 0 || this.x < 0 || this.x > bounds.width || this.y < 0 || this.y > bounds.height) {
            this.isDead = true;
            return;
        }
        
        this.checkCollisions(enemies, apexSystem, player);
    }

    protected checkCollisions(enemies: Enemy[], apexSystem: any, player: Player) {
        for (const e of enemies) {
            if (e.isDead) continue;
            const dist = Math.hypot(this.x - e.x, this.y - e.y);
            if (dist < this.radius + e.radius) {
                this.hitEnemy(e, apexSystem, player, enemies);
                break;
            }
        }
    }

    protected hitEnemy(e: Enemy, apexSystem: any, player: Player, _enemies: Enemy[]) {
        const dmgDealt = Math.min(e.hp, this.damage);
        e.hp -= this.damage;
        this.isDead = true; // By default, die on first hit
        
        if (apexSystem.lifesteal > 0) {
            player.heal(dmgDealt * apexSystem.lifesteal);
        }
        // Kills and drops are handled by main.ts iterating over enemies, or we can handle it here?
        // Let's let main.ts handle enemy death drops for consistency.
    }

    public draw(ctx: CanvasRenderingContext2D, _time?: number) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

