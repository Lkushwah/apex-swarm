import { Player } from './Player';

// -------------------------------------------------------
// Enemy Types per GDD §8.2
// -------------------------------------------------------
export type EnemyType = 'swarmer' | 'brute' | 'shooter' | 'shielder' | 'phasewraith' | 'bulwark_drone' | 'glitch_swarm';

interface EnemyConfig {
    type: EnemyType;
    shape: 'square' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'octagon' | 'tiny_squares';
    color: string;
    baseHp: number;
    baseSpeed: number;
    baseDamage: number;
    radiusBase: number;
    unlockTime: number; // seconds
}

const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
    swarmer: {
        type: 'swarmer', shape: 'square', color: '#ef4444',
        baseHp: 30, baseSpeed: 70, baseDamage: 10, radiusBase: 12, unlockTime: 0
    },
    brute: {
        type: 'brute', shape: 'circle', color: '#f97316',
        baseHp: 150, baseSpeed: 30, baseDamage: 25, radiusBase: 22, unlockTime: 60
    },
    shooter: {
        type: 'shooter', shape: 'diamond', color: '#a855f7',
        baseHp: 60, baseSpeed: 20, baseDamage: 15, radiusBase: 14, unlockTime: 120
    },
    shielder: {
        type: 'shielder', shape: 'hexagon', color: '#06b6d4',
        baseHp: 80, baseSpeed: 40, baseDamage: 10, radiusBase: 16, unlockTime: 180
    },
    phasewraith: {
        type: 'phasewraith', shape: 'triangle', color: '#8b5cf6',
        baseHp: 50, baseSpeed: 70, baseDamage: 20, radiusBase: 13, unlockTime: 300
    },
    bulwark_drone: {
        type: 'bulwark_drone', shape: 'octagon', color: '#94a3b8',
        baseHp: 200, baseSpeed: 25, baseDamage: 15, radiusBase: 18, unlockTime: 420
    },
    glitch_swarm: {
        type: 'glitch_swarm', shape: 'tiny_squares', color: '#ec4899',
        baseHp: 8, baseSpeed: 100, baseDamage: 6, radiusBase: 7, unlockTime: 540
    }
};

export { ENEMY_CONFIGS };

export class Enemy {
    public x: number;
    public y: number;
    public radius: number;
    public hp: number;
    public maxHp: number;
    public damage: number;
    public speed: number;
    public color: string;
    public isDead: boolean = false;
    public enemyType: EnemyType;
    public shape: string;
    public stunTimer: number = 0;
    public attackCooldown: number = 0;
    public isFleeing: boolean = false;

    // Shielder: orientation angle (the "front" of the shield)
    private shieldAngle: number = 0;
    private shieldTurnRate: number = Math.PI / 2; // 90°/s

    // Shooter: fire timer
    private shootTimer: number = 2;
    public projectiles: { x: number, y: number, vx: number, vy: number, damage: number, life: number }[] = [];

    // Phasewraith: teleport timer
    private teleportTimer: number = 3;

    // Bulwark Drone: shield-cast
    private bulwarkShieldTimer: number = 5;
    private bulwarkShieldActive: boolean = false;
    private bulwarkShieldDuration: number = 0;
    private bulwarkChargeProgress: number = 0;

    // Damage reduction (from bulwark shield)
    private damageReduction: number = 1.0;

    constructor(x: number, y: number, timeScale: number, type: EnemyType = 'swarmer') {
        this.x = x;
        this.y = y;
        this.enemyType = type;
        
        const config = ENEMY_CONFIGS[type];
        this.shape = config.shape;
        this.color = config.color;
        this.radius = config.radiusBase + (type === 'swarmer' ? Math.random() * 4 : 0);
        // Speed scales gracefully with time, capped at 1.6x base speed max
        const speedScale = Math.min(1.6, 1 + (timeScale - 1) * 0.03);
        this.speed = config.baseSpeed * (type === 'swarmer' ? (0.8 + Math.random() * 0.4) : 1) * speedScale;
        this.maxHp = config.baseHp * timeScale;
        this.hp = this.maxHp;
        this.damage = config.baseDamage;

        // Random start angle for shielder
        if (type === 'shielder') {
            this.shieldAngle = Math.random() * Math.PI * 2;
        }
    }

    // Override HP subtraction for damage reduction
    public takeDamageFrom(amount: number, fromAngle?: number): number {
        // Shielder: reduce damage from the front
        if (this.enemyType === 'shielder' && fromAngle !== undefined) {
            const angleDiff = Math.abs(Math.atan2(
                Math.sin(fromAngle - this.shieldAngle),
                Math.cos(fromAngle - this.shieldAngle)
            ));
            if (angleDiff < Math.PI / 3) {
                // Hit the shield — block 80% of damage
                amount *= 0.2;
            }
        }

        // Bulwark shield active — 70% reduction
        if (this.bulwarkShieldActive) {
            amount *= 0.3;
        }

        const dmgDealt = Math.max(0, Math.min(this.hp, amount * this.damageReduction));
        this.hp -= amount * this.damageReduction;
        return dmgDealt;
    }

    public update(dt: number, player: Player, canTakeDamage: boolean = true) {
        if (this.isDead) return;

        if (this.isFleeing) {
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const dist = Math.hypot(dx, dy) || 1;
            
            // Flee at triple speed
            this.x += (dx / dist) * this.speed * 3 * dt;
            this.y += (dy / dist) * this.speed * 3 * dt;
            
            // Despawn if far enough away (approx 1500px from center)
            if (this.x < -500 || this.x > 2500 || this.y < -500 || this.y > 2500) {
                this.isDead = true;
            }
            return; // Skip normal AI and shooting
        }

        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
        } else {
            if (this.attackCooldown > 0) this.attackCooldown -= dt;
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.hypot(dx, dy);

            switch (this.enemyType) {
                case 'swarmer':
                    this.updateSwarmer(dt, dx, dy, dist, player, canTakeDamage);
                    break;
                case 'brute':
                    this.updateBrute(dt, dx, dy, dist, player, canTakeDamage);
                    break;
                case 'shooter':
                    this.updateShooter(dt, dx, dy, dist, player, canTakeDamage);
                    break;
                case 'shielder':
                    this.updateShielder(dt, dx, dy, dist, player, canTakeDamage);
                    break;
                case 'phasewraith':
                    this.updatePhasewraith(dt, dx, dy, dist, player, canTakeDamage);
                    break;
                case 'bulwark_drone':
                    this.updateBulwarkDrone(dt, dx, dy, dist, player, canTakeDamage);
                    break;
                case 'glitch_swarm':
                    this.updateSwarmer(dt, dx, dy, dist, player, canTakeDamage);
                    break;
            }
        }

        // Update enemy projectiles (Shooter)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
                continue;
            }
            // Check collision with player
            const pDist = Math.hypot(p.x - player.x, p.y - player.y);
            if (pDist < player.radius + 4 && canTakeDamage) {
                if (player.takeDamage(p.damage)) {
                    this.projectiles.splice(i, 1);
                }
            }
        }
    }

    // --- Swarmer: direct chase, self-destructs on contact ---
    private updateSwarmer(dt: number, dx: number, dy: number, dist: number, player: Player, canTakeDamage: boolean) {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        if (dist < this.radius + player.radius && canTakeDamage) {
            if (player.takeDamage(this.damage)) {
                this.isDead = true;
            } else {
                // Bounce back if player has i-frames
                this.x -= (dx / dist || 0) * 15;
                this.y -= (dy / dist || 0) * 15;
            }
        }
    }

    // --- Brute: slow, high HP, direct walk ---
    private updateBrute(dt: number, dx: number, dy: number, dist: number, player: Player, canTakeDamage: boolean) {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        if (dist < this.radius + player.radius && canTakeDamage && this.attackCooldown <= 0) {
            if (player.takeDamage(this.damage)) {
                this.attackCooldown = 1.0;
            } else {
                this.x -= (dx / dist || 0) * 15;
                this.y -= (dy / dist || 0) * 15;
            }
        }
    }

    // --- Shooter: keeps distance, fires projectile every 2s ---
    private updateShooter(dt: number, dx: number, dy: number, dist: number, player: Player, canTakeDamage: boolean) {
        const preferredDist = 200;
        if (dist > preferredDist + 30) {
            // Move closer
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        } else if (dist < preferredDist - 30) {
            // Back away
            this.x -= (dx / dist) * this.speed * dt * 0.5;
            this.y -= (dy / dist) * this.speed * dt * 0.5;
        }
        // Strafe slightly
        this.x += (-dy / dist) * this.speed * 0.3 * dt;
        this.y += (dx / dist) * this.speed * 0.3 * dt;

        this.shootTimer -= dt;
        if (this.shootTimer <= 0) {
            this.shootTimer = 2;
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.projectiles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * 200,
                vy: Math.sin(angle) * 200,
                damage: this.damage,
                life: 3
            });
        }

        // Contact damage
        if (dist < this.radius + player.radius && canTakeDamage) {
            if (player.takeDamage(this.damage * 0.5)) {
                this.isDead = true;
            } else {
                this.x -= (dx / dist || 0) * 15;
                this.y -= (dy / dist || 0) * 15;
            }
        }
    }

    // --- Shielder: strafes, shield faces player, weak point on rear ---
    private updateShielder(dt: number, dx: number, dy: number, dist: number, player: Player, canTakeDamage: boolean) {
        // Slowly turn shield to face player
        const targetAngle = Math.atan2(dy, dx);
        const angleDiff = Math.atan2(
            Math.sin(targetAngle - this.shieldAngle),
            Math.cos(targetAngle - this.shieldAngle)
        );
        this.shieldAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.shieldTurnRate * dt);

        // Strafe in an arc around target
        const perpX = -dy / (dist || 1);
        const perpY = dx / (dist || 1);
        
        if (dist > 100) {
            // Approach + strafe
            this.x += (dx / dist) * this.speed * 0.4 * dt + perpX * this.speed * 0.6 * dt;
            this.y += (dy / dist) * this.speed * 0.4 * dt + perpY * this.speed * 0.6 * dt;
        } else {
            // Pure strafe
            this.x += perpX * this.speed * dt;
            this.y += perpY * this.speed * dt;
        }

        if (dist < this.radius + player.radius && canTakeDamage) {
            if (player.takeDamage(this.damage)) {
                this.isDead = true;
            } else {
                this.x -= (dx / dist || 0) * 15;
                this.y -= (dy / dist || 0) * 15;
            }
        }
    }

    // --- Phasewraith: teleports 150px toward player every 3s ---
    private updatePhasewraith(dt: number, dx: number, dy: number, dist: number, player: Player, canTakeDamage: boolean) {
        this.teleportTimer -= dt;
        
        // Move slowly between teleports
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * 0.3 * dt;
            this.y += (dy / dist) * this.speed * 0.3 * dt;
        }

        if (this.teleportTimer <= 0) {
            this.teleportTimer = 3;
            // Teleport 150px toward player
            if (dist > 150) {
                this.x += (dx / dist) * 150;
                this.y += (dy / dist) * 150;
            } else {
                // If close, teleport right next to player
                this.x = player.x + (dx / dist) * -(player.radius + this.radius + 5);
                this.y = player.y + (dy / dist) * -(player.radius + this.radius + 5);
            }
        }

        if (dist < this.radius + player.radius && canTakeDamage) {
            if (player.takeDamage(this.damage)) {
                this.isDead = true;
            } else {
                this.x -= (dx / dist || 0) * 15;
                this.y -= (dy / dist || 0) * 15;
            }
        }
    }

    // --- Bulwark Drone: periodically casts 2s damage-reduction shield ---
    private updateBulwarkDrone(dt: number, dx: number, dy: number, dist: number, player: Player, canTakeDamage: boolean) {
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }

        if (this.bulwarkShieldActive) {
            this.bulwarkShieldDuration -= dt;
            if (this.bulwarkShieldDuration <= 0) {
                this.bulwarkShieldActive = false;
                this.bulwarkChargeProgress = 0;
            }
        } else {
            this.bulwarkShieldTimer -= dt;
            if (this.bulwarkShieldTimer <= 0 && this.bulwarkShieldTimer > -1.5) {
                // Charge-up phase (1.5s)
                this.bulwarkChargeProgress = Math.min(1, this.bulwarkChargeProgress + dt / 1.5);
            }
            if (this.bulwarkShieldTimer <= -1.5) {
                // Activate shield
                this.bulwarkShieldActive = true;
                this.bulwarkShieldDuration = 2;
                this.bulwarkShieldTimer = 5 + Math.random() * 3;
            }
        }

        if (dist < this.radius + player.radius && canTakeDamage && this.attackCooldown <= 0) {
            if (player.takeDamage(this.damage)) {
                this.attackCooldown = 1.0;
            } else {
                this.x -= (dx / dist || 0) * 15;
                this.y -= (dy / dist || 0) * 15;
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (this.isDead) return;
        
        ctx.save();

        switch (this.shape) {
            case 'square':
                this.drawSquare(ctx);
                break;
            case 'circle':
                this.drawCircle(ctx);
                break;
            case 'diamond':
                this.drawDiamond(ctx);
                break;
            case 'hexagon':
                this.drawHexagon(ctx);
                break;
            case 'triangle':
                this.drawTriangle(ctx);
                break;
            case 'octagon':
                this.drawOctagon(ctx);
                break;
            case 'tiny_squares':
                this.drawTinySquares(ctx);
                break;
        }

        // HP bar for enemies with > 50 base HP
        if (this.maxHp > 40 && this.hp < this.maxHp) {
            this.drawHpBar(ctx);
        }

        // Draw enemy projectiles
        for (const p of this.projectiles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    private drawSquare(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        ctx.strokeStyle = this.darken(this.color);
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }

    private drawCircle(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.darken(this.color);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    private drawDiamond(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius);
        ctx.lineTo(this.x + this.radius, this.y);
        ctx.lineTo(this.x, this.y + this.radius);
        ctx.lineTo(this.x - this.radius, this.y);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.darken(this.color);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    private drawHexagon(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = this.x + this.radius * Math.cos(angle);
            const hy = this.y + this.radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.darken(this.color);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw shield facing indicator (brighter facet on rear = weak point)
        const rearAngle = this.shieldAngle + Math.PI;
        const rearX = this.x + this.radius * 0.7 * Math.cos(rearAngle);
        const rearY = this.y + this.radius * 0.7 * Math.sin(rearAngle);
        ctx.beginPath();
        ctx.arc(rearX, rearY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#67e8f9'; // bright cyan weak point
        ctx.fill();

        // Shield front indicator
        const frontX = this.x + this.radius * 1.2 * Math.cos(this.shieldAngle);
        const frontY = this.y + this.radius * 1.2 * Math.sin(this.shieldAngle);
        ctx.beginPath();
        ctx.arc(frontX, frontY, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6,182,212,0.6)';
        ctx.fill();
    }

    private drawTriangle(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius);
        ctx.lineTo(this.x + this.radius * 0.87, this.y + this.radius * 0.5);
        ctx.lineTo(this.x - this.radius * 0.87, this.y + this.radius * 0.5);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.darken(this.color);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Teleport flash effect
        if (this.teleportTimer < 0.5) {
            ctx.globalAlpha = 0.3 + (0.5 - this.teleportTimer);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = '#c4b5fd';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    private drawOctagon(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i - Math.PI / 8;
            const ox = this.x + this.radius * Math.cos(angle);
            const oy = this.y + this.radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(ox, oy);
            else ctx.lineTo(ox, oy);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.darken(this.color);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bulwark shield charge-up ring
        if (this.bulwarkChargeProgress > 0 && !this.bulwarkShieldActive) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 6, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * this.bulwarkChargeProgress));
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Active shield glow
        if (this.bulwarkShieldActive) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(226,232,240,0.6)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#e2e8f0';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    private drawTinySquares(ctx: CanvasRenderingContext2D) {
        // Draw as a small cluster
        const offsets = [
            { x: 0, y: 0 },
            { x: -6, y: -6 },
            { x: 6, y: -6 },
            { x: -6, y: 6 },
            { x: 6, y: 6 },
        ];
        ctx.fillStyle = this.color;
        const jitter = Math.sin(Date.now() / 80) * 2;
        for (const off of offsets) {
            const sx = this.x + off.x + (off.x ? jitter * Math.sign(off.x) : 0);
            const sy = this.y + off.y + (off.y ? jitter * Math.sign(off.y) : 0);
            ctx.fillRect(sx - 3, sy - 3, 6, 6);
        }
    }

    private drawHpBar(ctx: CanvasRenderingContext2D) {
        const barWidth = this.radius * 2;
        const barHeight = 3;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - 8;
        const hpPct = Math.max(0, this.hp / this.maxHp);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpPct, barHeight);
    }

    private darken(hex: string): string {
        // Simple darken — shift each channel
        try {
            const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 60);
            const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 60);
            const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 60);
            return `rgb(${r},${g},${b})`;
        } catch {
            return '#333';
        }
    }
}
