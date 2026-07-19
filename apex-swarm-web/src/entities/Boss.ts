import { Player } from './Player';

export type BossType = 'core_sentinel' | 'apex_predator';

export class Boss {
    public x: number;
    public y: number;
    public radius: number;
    public hp: number;
    public maxHp: number;
    public damage: number;
    public speed: number;
    public color: string;
    public isDead: boolean = false;
    public bossType: BossType;
    public stunTimer: number = 0;
    
    // Boss AI State
    public state: 'spawning' | 'phase1' | 'phase2' | 'phase3' = 'spawning';
    public stateTimer: number = 0;
    public attackCooldown: number = 0;
    public name: string;

    // Boss projectiles
    public projectiles: { x: number, y: number, vx: number, vy: number, damage: number, life: number, isHoming?: boolean }[] = [];

    // Specific AI vars
    private attackTimer: number = 0;
    private attackCycle: number = 0;

    constructor(x: number, y: number, type: BossType, timeScale: number) {
        this.x = x;
        this.y = y;
        this.bossType = type;
        
        if (type === 'core_sentinel') {
            this.name = "The Core Sentinel";
            this.color = '#fbbf24'; // Amber
            this.radius = 45;
            this.maxHp = 5000 * timeScale;
            this.damage = 30;
            this.speed = 25;
        } else {
            this.name = "The Apex Predator";
            this.color = '#f43f5e'; // Rose/Red
            this.radius = 35;
            this.maxHp = 15000 * timeScale;
            this.damage = 50;
            this.speed = 100;
        }

        this.hp = this.maxHp;
        this.stateTimer = 3.0; // 3 seconds invulnerable spawn intro
    }

    public takeDamage(amount: number): number {
        if (this.state === 'spawning') return 0; // Invulnerable during spawn
        const dmgDealt = Math.max(0, Math.min(this.hp, amount));
        this.hp -= amount;
        
        // Phase transitions
        if (this.hp < this.maxHp * 0.5 && this.state === 'phase1') {
            this.state = 'phase2';
            this.stateTimer = 2.0; // Enrage pause
            this.stunTimer = 1.0;
        }
        if (this.bossType === 'apex_predator' && this.hp < this.maxHp * 0.25 && this.state === 'phase2') {
            this.state = 'phase3';
            this.stateTimer = 1.5;
            this.stunTimer = 1.0;
        }

        return dmgDealt;
    }

    public update(dt: number, player: Player, canTakeDamage: boolean) {
        if (this.isDead) return;

        // Handle projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            
            if (p.isHoming) {
                const angle = Math.atan2(player.y - p.y, player.x - p.x);
                const currentAngle = Math.atan2(p.vy, p.vx);
                let diff = angle - currentAngle;
                // Normalize diff
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                const maxTurn = 2.0 * dt; // 2 rad per sec
                const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
                const speed = Math.hypot(p.vx, p.vy);
                const newAngle = currentAngle + turn;
                p.vx = Math.cos(newAngle) * speed;
                p.vy = Math.sin(newAngle) * speed;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
                continue;
            }
            const pDist = Math.hypot(p.x - player.x, p.y - player.y);
            if (pDist < player.radius + 6 && canTakeDamage) {
                if (player.takeDamage(p.damage)) {
                    this.projectiles.splice(i, 1);
                }
            }
        }

        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            return;
        }

        if (this.state === 'spawning') {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'phase1';
            }
            return; // Don't move or attack while spawning
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (this.bossType === 'core_sentinel') {
            this.updateCoreSentinel(dt, dx, dy, dist, player);
        } else {
            this.updateApexPredator(dt, dx, dy, dist, player);
        }

        // Contact Damage
        if (dist < this.radius + player.radius && canTakeDamage && this.attackCooldown <= 0) {
            if (player.takeDamage(this.damage)) {
                this.attackCooldown = 0.5;
            }
        }
    }

    private updateCoreSentinel(dt: number, dx: number, dy: number, dist: number, player: Player) {
        // Moves slowly toward player
        if (dist > this.radius * 2) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }

        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            if (this.state === 'phase1') {
                // Ring attack
                this.attackTimer = 3.0;
                this.fireRing(12, 150);
            } else if (this.state === 'phase2') {
                // Faster rings + targeting burst
                this.attackTimer = 2.0;
                if (this.attackCycle % 2 === 0) {
                    this.fireRing(18, 180);
                } else {
                    this.fireBurstTarget(player, 5);
                }
                this.attackCycle++;
            }
        }
    }

    private updateApexPredator(dt: number, dx: number, dy: number, dist: number, player: Player) {
        // Fast, aggressive
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;

        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            if (this.state === 'phase1') {
                this.attackTimer = 2.5;
                this.fireBurstTarget(player, 3);
            } else if (this.state === 'phase2') {
                this.speed = 140; // Enrage speed
                this.attackTimer = 2.0;
                this.fireRing(8, 250);
                this.fireHoming(1);
            } else if (this.state === 'phase3') {
                this.speed = 180;
                this.attackTimer = 1.5;
                this.fireHoming(3);
            }
        }
    }

    private fireRing(count: number, speed: number) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.projectiles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: this.damage * 0.5,
                life: 5
            });
        }
    }

    private fireBurstTarget(player: Player, count: number) {
        const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i - Math.floor(count / 2)) * 0.2;
            this.projectiles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * 300,
                vy: Math.sin(angle) * 300,
                damage: this.damage * 0.75,
                life: 3
            });
        }
    }

    private fireHoming(count: number) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.projectiles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * 150,
                vy: Math.sin(angle) * 150,
                damage: this.damage * 0.5,
                life: 6,
                isHoming: true
            });
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Pulse effect if spawning or stunned
        if (this.state === 'spawning') {
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 100);
        } else if (this.stunTimer > 0) {
            ctx.fillStyle = '#ffffff';
        }

        ctx.beginPath();
        if (this.bossType === 'core_sentinel') {
            // Draw a big spiked circle
            for(let i=0; i<12; i++) {
                const r = i % 2 === 0 ? this.radius : this.radius * 0.7;
                const angle = (Math.PI * 2 / 12) * i + (Date.now() / 1000);
                if (i===0) ctx.moveTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                else ctx.lineTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
            }
            ctx.closePath();
        } else {
            // Apex predator is a sharp star
            for(let i=0; i<10; i++) {
                const r = i % 2 === 0 ? this.radius : this.radius * 0.4;
                const angle = (Math.PI * 2 / 10) * i - (Date.now() / 500);
                if (i===0) ctx.moveTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                else ctx.lineTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
            }
            ctx.closePath();
        }

        ctx.fillStyle = this.stunTimer > 0 ? '#ffffff' : this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Eye / Core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = this.state === 'phase2' ? '#ef4444' : this.state === 'phase3' ? '#ffffff' : '#000000';
        ctx.fill();

        // Projectiles
        for (const p of this.projectiles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.isHoming ? 6 : 5, 0, Math.PI * 2);
            ctx.fillStyle = p.isHoming ? '#a855f7' : '#ef4444';
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.isHoming ? '#a855f7' : '#ef4444';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }
}
