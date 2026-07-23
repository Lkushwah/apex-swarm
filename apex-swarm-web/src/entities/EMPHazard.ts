import { Enemy } from './Enemy';
import { Player } from './Player';

export class EMPHazard {
    public x: number;
    public y: number;
    public radius: number = 20;
    public slowRadius: number = 180;
    public life: number = 12.0; // 12 seconds before despawning if untriggered
    public state: 'arming' | 'ready' | 'detonating' | 'expired' = 'arming';
    public armTimer: number = 1.0;
    public detonateTimer: number = 0;
    public detonateMaxTimer: number = 0.8; // Shockwave expansion duration

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public update(dt: number, player: Player, enemies: Enemy[]) {
        if (this.state === 'expired') return;

        if (this.state === 'arming') {
            this.armTimer -= dt;
            if (this.armTimer <= 0) {
                this.state = 'ready';
            }
            return;
        }

        if (this.state === 'ready') {
            this.life -= dt;
            if (this.life <= 0) {
                this.state = 'expired';
                return;
            }

            // Check trigger: if player or any enemy steps inside trigger radius
            const distPlayer = Math.hypot(player.x - this.x, player.y - this.y);
            let shouldTrigger = distPlayer < this.radius + player.radius;

            if (!shouldTrigger) {
                for (const e of enemies) {
                    if (e.isDead) continue;
                    const dist = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dist < this.radius + e.radius) {
                        shouldTrigger = true;
                        break;
                    }
                }
            }

            if (shouldTrigger) {
                this.triggerEMPPulse(enemies);
            }
            return;
        }

        if (this.state === 'detonating') {
            this.detonateTimer += dt;
            if (this.detonateTimer >= this.detonateMaxTimer) {
                this.state = 'expired';
            }
        }
    }

    private triggerEMPPulse(enemies: Enemy[]) {
        this.state = 'detonating';
        this.detonateTimer = 0;

        // Apply EMP Slow & Stun to all enemies in radius
        for (const e of enemies) {
            if (e.isDead) continue;
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.slowRadius) {
                // Apply 50% slow for 3 seconds
                (e as any).empSlowTimer = 3.0;
                (e as any).empSlowFactor = 0.5;
                // Brief stun
                e.stunTimer = Math.max(e.stunTimer, 0.5);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (this.state === 'expired') return;

        ctx.save();
        if (this.state === 'arming') {
            ctx.globalAlpha = 0.4 + 0.3 * Math.sin(Date.now() / 100);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#06b6d4'; // Cyan
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (this.state === 'ready') {
            const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 150);
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#06b6d4';
            
            // Outer field outline
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.4})`;
            ctx.fill();
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner core icon (lightning symbol)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', this.x, this.y);

            ctx.shadowBlur = 0;
        } else if (this.state === 'detonating') {
            const progress = this.detonateTimer / this.detonateMaxTimer;
            const currentRadius = this.slowRadius * progress;
            const alpha = 1 - progress;

            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.25})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.8})`;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#22d3ee';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    }
}
