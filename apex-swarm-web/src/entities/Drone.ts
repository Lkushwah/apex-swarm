import { Player } from './Player';
import { Enemy } from './Enemy';
import { MissileProjectile } from './Projectiles';

export class Drone {
    public x: number;
    public y: number;
    public radius: number = 8;
    
    private player: Player;
    private orbitAngle: number;
    private orbitDistance: number = 60;
    private fireCooldown: number = 0;
    
    // Evolved state
    public isEvolved: boolean = false;
    private targetEnemy: Enemy | null = null;
    public hitSet: Set<Enemy> = new Set(); // For evolved laser piercing logic

    constructor(player: Player, initialAngle: number) {
        this.player = player;
        this.orbitAngle = initialAngle;
        this.x = player.x + Math.cos(this.orbitAngle) * this.orbitDistance;
        this.y = player.y + Math.sin(this.orbitAngle) * this.orbitDistance;
    }

    public update(dt: number, enemies: Enemy[], projectiles: any[], damage: number) {
        if (!this.isEvolved) {
            // Base behavior: Orbit player
            this.orbitAngle += dt * 2;
            const targetX = this.player.x + Math.cos(this.orbitAngle) * this.orbitDistance;
            const targetY = this.player.y + Math.sin(this.orbitAngle) * this.orbitDistance;
            
            // Lerp towards orbit position
            this.x += (targetX - this.x) * 10 * dt;
            this.y += (targetY - this.y) * 10 * dt;

            // Fire at nearest enemy
            if (this.fireCooldown > 0) this.fireCooldown -= dt;
            if (this.fireCooldown <= 0) {
                let nearest: Enemy | null = null;
                let minDist = 300;
                for (const e of enemies) {
                    if (e.isDead) continue;
                    const dist = Math.hypot(this.x - e.x, this.y - e.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = e;
                    }
                }

                if (nearest) {
                    const angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                    const speed = 400;
                    
                    // Drone fires simple green projectiles
                    const p = new MissileProjectile(this.x, this.y, angle, damage, speed, 0); 
                    p.color = '#4ade80';
                    p.radius = 4;
                    projectiles.push(p);
                    this.fireCooldown = 1.0;
                }
            }
        } else {
            // Evolved behavior (Hive Mind): Detach, seek enemies, and draw lasers
            if (!this.targetEnemy || this.targetEnemy.isDead) {
                // Find random living enemy
                const living = enemies.filter(e => !e.isDead);
                if (living.length > 0) {
                    this.targetEnemy = living[Math.floor(Math.random() * living.length)];
                } else {
                    // Return to player if no enemies
                    const distToPlayer = Math.hypot(this.player.x - this.x, this.player.y - this.y);
                    if (distToPlayer > 100) {
                        const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
                        this.x += Math.cos(angle) * 150 * dt;
                        this.y += Math.sin(angle) * 150 * dt;
                    }
                    return;
                }
            }

            if (this.targetEnemy) {
                // Seek target slowly
                const angle = Math.atan2(this.targetEnemy.y - this.y, this.targetEnemy.x - this.x);
                this.x += Math.cos(angle) * 150 * dt;
                this.y += Math.sin(angle) * 150 * dt;

                // Laser logic is handled in the evolved projectile class (HiveMindLaser)
                // which draws the beam from the drone to the enemy.
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.isEvolved ? '#f0abfc' : '#4ade80';
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = this.isEvolved ? '#f0abfc' : '#4ade80';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Draw a UFO shape
        ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, -2, this.radius * 0.4, Math.PI, 0);
        ctx.fillStyle = this.isEvolved ? '#f0abfc' : '#4ade80';
        ctx.fill();

        ctx.restore();
    }
}
