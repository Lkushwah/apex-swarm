import { Enemy } from './Enemy';
import { Player } from './Player';
import { FloatingText } from './Particles';

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
    public angle: number = 0;

    // Shared arrays for feedback (set by main.ts)
    public static floatingTexts: FloatingText[] = [];
    public static particles: { x: number, y: number, color: string, count: number }[] = [];

    constructor(x: number, y: number, angle: number, damage: number, speed: number) {
        this.x = x;
        this.y = y;
        this.angle = angle;
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
        // Crit roll
        let finalDamage = this.damage;
        let isCrit = false;
        if (player.critChance > 0 && Math.random() < player.critChance) {
            finalDamage *= player.critDamage;
            isCrit = true;
        }

        const dmgDealt = Math.max(0, Math.min(e.hp, finalDamage));
        e.hp -= finalDamage;
        this.isDead = true; // By default, die on first hit
        
        // Lifesteal: Apex lifesteal + player global lifesteal
        const totalLifesteal = (apexSystem?.lifesteal ?? 0) + player.globalLifesteal;
        if (totalLifesteal > 0) {
            const healAmount = dmgDealt * totalLifesteal;
            player.heal(healAmount);
            // +HP floating text
            if (healAmount >= 1) {
                Projectile.floatingTexts.push(new FloatingText(
                    player.x, player.y - 20,
                    `+${Math.floor(healAmount)} HP`,
                    '#4ade80',
                    0.6
                ));
            }
        }

        // Damage number floating text
        const dmgColor = isCrit ? '#fbbf24' : '#fca5a5';
        const dmgText = isCrit ? `${Math.floor(finalDamage)} CRIT!` : String(Math.floor(finalDamage));
        Projectile.floatingTexts.push(new FloatingText(
            e.x, e.y - 10,
            dmgText,
            dmgColor,
            0.5
        ));

        // Hit particles
        Projectile.particles.push({
            x: this.x, y: this.y,
            color: isCrit ? '#fbbf24' : this.color,
            count: isCrit ? 6 : 3
        });
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
