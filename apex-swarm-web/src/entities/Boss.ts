import { Player } from './Player';

export type BossType = 'core_sentinel' | 'void_weaver' | 'swarm_hive' | 'chrono_wraith' | 'apex_predator';

export interface BossMinionRequest {
    type: string;  // EnemyType — resolved in main.ts
    count: number;
    x: number;
    y: number;
}

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
    public state: 'spawning' | 'phase1' | 'phase2' | 'phase3' | 'dying' = 'spawning';
    public stateTimer: number = 0;
    public attackCooldown: number = 0;
    public name: string;

    // Boss projectiles
    public projectiles: BossProjectile[] = [];

    // Telegraphs (visual warning circles)
    public telegraphs: { x: number, y: number, radius: number, timer: number, maxTimer: number, color: string }[] = [];

    // Minion spawn queue — processed by main.ts
    public minionQueue: BossMinionRequest[] = [];

    // Void zones (damaging areas left by Void Weaver)
    public voidZones: { x: number, y: number, radius: number, timer: number, damage: number }[] = [];

    // Time distortion fields (Chrono Wraith)
    public distortionFields: { x: number, y: number, radius: number, timer: number }[] = [];

    // Death animation
    private deathTimer: number = 0;
    private deathRotation: number = 0;

    // Specific AI vars
    private attackTimer: number = 0;
    private attackCycle: number = 0;
    private minionTimer: number = 0;

    // Swarm Hive regen shield
    private regenShieldHP: number = 0;
    private regenShieldMaxHP: number = 2000;
    private regenShieldTimer: number = 0;
    private isRegenerating: boolean = false;

    // Chrono Wraith dash state
    private isDashing: boolean = false;
    private dashTarget: { x: number, y: number } = { x: 0, y: 0 };
    private dashTrail: { x: number, y: number, timer: number }[] = [];

    // Boss reward config
    public rewardLevelUps: number = 1;
    public rewardCredits: number = 100;
    public rewardCores: number = 5;
    public rewardHealFull: boolean = false;
    public rewardApexRefill: boolean = false;

    constructor(x: number, y: number, type: BossType, timeScale: number) {
        this.x = x;
        this.y = y;
        this.bossType = type;

        switch (type) {
            case 'core_sentinel':
                this.name = "The Core Sentinel";
                this.color = '#fbbf24';
                this.radius = 45;
                this.maxHp = 3000 * timeScale;
                this.damage = 25;
                this.speed = 25;
                this.rewardLevelUps = 1;
                this.rewardCredits = 100;
                this.rewardCores = 5;
                break;
            case 'void_weaver':
                this.name = "The Void Weaver";
                this.color = '#7c3aed';
                this.radius = 38;
                this.maxHp = 8000 * timeScale;
                this.damage = 35;
                this.speed = 60;
                this.rewardLevelUps = 1;
                this.rewardCredits = 200;
                this.rewardCores = 10;
                break;
            case 'swarm_hive':
                this.name = "The Swarm Hive";
                this.color = '#22c55e';
                this.radius = 55;
                this.maxHp = 12000 * timeScale;
                this.damage = 20;
                this.speed = 15;
                this.rewardLevelUps = 1;
                this.rewardCredits = 350;
                this.rewardCores = 15;
                this.rewardHealFull = true;
                break;
            case 'chrono_wraith':
                this.name = "The Chrono Wraith";
                this.color = '#67e8f9';
                this.radius = 32;
                this.maxHp = 18000 * timeScale;
                this.damage = 45;
                this.speed = 120;
                this.rewardLevelUps = 2;
                this.rewardCredits = 500;
                this.rewardCores = 25;
                break;
            case 'apex_predator':
                this.name = "The Apex Predator";
                this.color = '#f43f5e';
                this.radius = 35;
                this.maxHp = 25000 * timeScale;
                this.damage = 50;
                this.speed = 100;
                this.rewardLevelUps = 2;
                this.rewardCredits = 750;
                this.rewardCores = 40;
                this.rewardHealFull = true;
                this.rewardApexRefill = true;
                break;
        }

        this.hp = this.maxHp;
        this.stateTimer = 3.0; // 3 seconds invulnerable spawn intro
    }

    public takeDamage(amount: number): number {
        if (this.state === 'spawning' || this.state === 'dying') return 0;

        // If Swarm Hive has regen shield active, damage the shield first
        if (this.bossType === 'swarm_hive' && this.isRegenerating && this.regenShieldHP > 0) {
            this.regenShieldHP -= amount;
            if (this.regenShieldHP <= 0) {
                this.isRegenerating = false;
                this.regenShieldHP = 0;
                this.regenShieldTimer = 8; // Cooldown before next shield
            }
            return amount;
        }

        const dmgDealt = Math.max(0, Math.min(this.hp, amount));
        this.hp -= amount;

        // Phase transitions
        const hpPct = this.hp / this.maxHp;
        if (hpPct < 0.5 && this.state === 'phase1') {
            this.state = 'phase2';
            this.stateTimer = 1.5;
            this.stunTimer = 0.8;
            this.attackTimer = 0; // Reset attack cycle
        }
        if (this.hasPhase3() && hpPct < 0.25 && this.state === 'phase2') {
            this.state = 'phase3';
            this.stateTimer = 1.0;
            this.stunTimer = 0.8;
            this.attackTimer = 0;
        }

        return dmgDealt;
    }

    private hasPhase3(): boolean {
        return this.bossType === 'chrono_wraith' || this.bossType === 'apex_predator';
    }

    public update(dt: number, player: Player, canTakeDamage: boolean) {
        if (this.isDead) return;

        // Death animation
        if (this.state === 'dying') {
            this.deathTimer -= dt;
            this.deathRotation += dt * 15;
            this.radius = Math.max(5, this.radius - dt * 40);
            if (this.deathTimer <= 0) {
                this.isDead = true;
            }
            return;
        }

        // Update telegraphs
        for (let i = this.telegraphs.length - 1; i >= 0; i--) {
            this.telegraphs[i].timer -= dt;
            if (this.telegraphs[i].timer <= 0) {
                this.telegraphs.splice(i, 1);
            }
        }

        // Update void zones
        for (let i = this.voidZones.length - 1; i >= 0; i--) {
            const vz = this.voidZones[i];
            vz.timer -= dt;
            if (vz.timer <= 0) {
                this.voidZones.splice(i, 1);
                continue;
            }
            // Damage player if inside
            const dist = Math.hypot(vz.x - player.x, vz.y - player.y);
            if (dist < vz.radius + player.radius && canTakeDamage) {
                player.takeDamage(vz.damage * dt);
            }
        }

        // Update distortion fields
        for (let i = this.distortionFields.length - 1; i >= 0; i--) {
            const df = this.distortionFields[i];
            df.timer -= dt;
            if (df.timer <= 0) {
                this.distortionFields.splice(i, 1);
                continue;
            }
            // Slow player if inside
            const dist = Math.hypot(df.x - player.x, df.y - player.y);
            if (dist < df.radius) {
                player.speedMultiplier = Math.max(0.3, player.speedMultiplier * 0.6);
            }
        }

        // Update dash trail
        for (let i = this.dashTrail.length - 1; i >= 0; i--) {
            this.dashTrail[i].timer -= dt;
            if (this.dashTrail[i].timer <= 0) {
                this.dashTrail.splice(i, 1);
                continue;
            }
            // Trail damage
            const dist = Math.hypot(this.dashTrail[i].x - player.x, this.dashTrail[i].y - player.y);
            if (dist < 15 && canTakeDamage) {
                player.takeDamage(this.damage * 0.3 * dt);
            }
        }

        // Handle projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];

            if (p.isHoming) {
                const angle = Math.atan2(player.y - p.y, player.x - p.x);
                const currentAngle = Math.atan2(p.vy, p.vx);
                let diff = angle - currentAngle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                const maxTurn = 2.0 * dt;
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
            return;
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        switch (this.bossType) {
            case 'core_sentinel':
                this.updateCoreSentinel(dt, dx, dy, dist, player);
                break;
            case 'void_weaver':
                this.updateVoidWeaver(dt, dx, dy, dist, player);
                break;
            case 'swarm_hive':
                this.updateSwarmHive(dt, dx, dy, dist, player);
                break;
            case 'chrono_wraith':
                this.updateChronoWraith(dt, dx, dy, dist, player);
                break;
            case 'apex_predator':
                this.updateApexPredator(dt, dx, dy, dist, player);
                break;
        }

        // Contact Damage (all bosses)
        if (dist < this.radius + player.radius && canTakeDamage && this.attackCooldown <= 0) {
            if (player.takeDamage(this.damage)) {
                this.attackCooldown = 0.5;
            }
        }

        // Check death
        if (this.hp <= 0) {
            this.beginDeath();
        }
    }

    private beginDeath() {
        this.state = 'dying';
        this.deathTimer = 1.0;
        this.deathRotation = 0;
        this.projectiles = [];
        this.voidZones = [];
        this.distortionFields = [];
    }

    // ---- CORE SENTINEL (Level 5) ----
    private updateCoreSentinel(dt: number, dx: number, dy: number, dist: number, _player: Player) {
        // Move slowly toward player
        if (dist > this.radius * 2) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }

        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            if (this.state === 'phase1') {
                this.attackTimer = 3.5;
                this.addTelegraph(this.x, this.y, 150, 0.5, 'rgba(251,191,36,0.2)');
                setTimeout(() => this.fireRing(10, 150), 500);
            } else if (this.state === 'phase2') {
                this.attackTimer = 2.5;
                if (this.attackCycle % 2 === 0) {
                    this.addTelegraph(this.x, this.y, 180, 0.5, 'rgba(251,191,36,0.3)');
                    setTimeout(() => this.fireRing(16, 180), 500);
                } else {
                    this.fireBurstTarget(_player, 3);
                }
                this.attackCycle++;
                this.speed = 35; // Slight speed increase
            }
        }
    }

    // ---- VOID WEAVER (Level 10) ----
    private updateVoidWeaver(dt: number, dx: number, dy: number, dist: number, player: Player) {
        // Moves toward player moderately
        if (dist > 200) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }

        this.attackTimer -= dt;
        this.minionTimer -= dt;

        if (this.state === 'phase1') {
            // Teleport + cross burst
            if (this.attackTimer <= 0) {
                this.attackTimer = 4.0;
                // Teleport to random position near player
                const angle = Math.random() * Math.PI * 2;
                const teleportDist = 150 + Math.random() * 100;
                this.x = player.x + Math.cos(angle) * teleportDist;
                this.y = player.y + Math.sin(angle) * teleportDist;
                // Clamp to screen
                this.x = Math.max(50, Math.min(750, this.x));
                this.y = Math.max(50, Math.min(1250, this.y));
                // Fire 4-way cross
                this.fireCross(4, 200);
            }
            // Spawn 2 phasewraiths every 8s
            if (this.minionTimer <= 0) {
                this.minionTimer = 8;
                this.minionQueue.push({ type: 'phasewraith', count: 2, x: this.x, y: this.y });
            }
        } else if (this.state === 'phase2') {
            // Faster teleport + 8-way + void zones + shielder minions
            if (this.attackTimer <= 0) {
                this.attackTimer = 2.5;
                const prevX = this.x;
                const prevY = this.y;
                const angle = Math.random() * Math.PI * 2;
                const teleportDist = 120 + Math.random() * 80;
                this.x = player.x + Math.cos(angle) * teleportDist;
                this.y = player.y + Math.sin(angle) * teleportDist;
                this.x = Math.max(50, Math.min(750, this.x));
                this.y = Math.max(50, Math.min(1250, this.y));
                // Leave void zone at old position
                this.voidZones.push({ x: prevX, y: prevY, radius: 60, timer: 3.0, damage: 15 });
                // 8-way cross
                this.fireCross(8, 220);
            }
            if (this.minionTimer <= 0) {
                this.minionTimer = 6;
                this.minionQueue.push({ type: 'shielder', count: 3, x: this.x, y: this.y });
            }
        }
    }

    // ---- SWARM HIVE (Level 15) ----
    private updateSwarmHive(dt: number, _dx: number, _dy: number, _dist: number, player: Player) {
        // Stationary — drifts very slowly toward center of screen
        const centerX = 400;
        const centerY = 400;
        const toCenterDx = centerX - this.x;
        const toCenterDy = centerY - this.y;
        const toCenterDist = Math.hypot(toCenterDx, toCenterDy);
        if (toCenterDist > 50) {
            this.x += (toCenterDx / toCenterDist) * this.speed * dt;
            this.y += (toCenterDy / toCenterDist) * this.speed * dt;
        }

        this.attackTimer -= dt;
        this.minionTimer -= dt;

        // Regen shield mechanics
        if (this.state === 'phase2' && !this.isRegenerating) {
            this.regenShieldTimer -= dt;
            if (this.regenShieldTimer <= 0) {
                this.isRegenerating = true;
                this.regenShieldHP = this.regenShieldMaxHP;
            }
        }
        if (this.isRegenerating) {
            // Heal 1% maxHP per second while shield is up
            this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.01 * dt);
        }

        if (this.state === 'phase1') {
            // Slow homing spores
            if (this.attackTimer <= 0) {
                this.attackTimer = 2.0;
                this.fireHomingSpores(3, player);
            }
            // Spawn glitch swarm clusters
            if (this.minionTimer <= 0) {
                this.minionTimer = 4;
                this.minionQueue.push({ type: 'glitch_swarm', count: 5, x: this.x, y: this.y });
            }
        } else if (this.state === 'phase2') {
            if (this.attackTimer <= 0) {
                this.attackTimer = 1.5;
                this.fireHomingSpores(5, player);
            }
            if (this.minionTimer <= 0) {
                this.minionTimer = 2.5;
                this.minionQueue.push({ type: 'glitch_swarm', count: 5, x: this.x, y: this.y });
            }
        }
    }

    // ---- CHRONO WRAITH (Level 20) ----
    private updateChronoWraith(dt: number, dx: number, dy: number, dist: number, player: Player) {
        this.attackTimer -= dt;

        if (this.state === 'phase1') {
            // Dash at player every 3s
            if (this.attackTimer <= 0 && !this.isDashing) {
                this.attackTimer = 3.0;
                this.isDashing = true;
                this.dashTarget = { x: player.x, y: player.y };
                this.fireHoming(2);
            }

            if (this.isDashing) {
                const dashDx = this.dashTarget.x - this.x;
                const dashDy = this.dashTarget.y - this.y;
                const dashDist = Math.hypot(dashDx, dashDy);
                if (dashDist > 20) {
                    const dashSpeed = 400;
                    this.x += (dashDx / dashDist) * dashSpeed * dt;
                    this.y += (dashDy / dashDist) * dashSpeed * dt;
                    // Leave trail
                    this.dashTrail.push({ x: this.x, y: this.y, timer: 2.0 });
                } else {
                    this.isDashing = false;
                }
            } else {
                // Orbit player
                if (dist > 250) {
                    this.x += (dx / dist) * this.speed * dt;
                    this.y += (dy / dist) * this.speed * dt;
                }
            }
        } else if (this.state === 'phase2') {
            // Faster dashes + time distortion field
            if (this.attackTimer <= 0 && !this.isDashing) {
                this.attackTimer = 2.0;
                this.isDashing = true;
                this.dashTarget = { x: player.x, y: player.y };
                this.fireHoming(2);
                this.addTelegraph(this.x, this.y, 200, 0.3, 'rgba(103,232,249,0.2)');
                this.distortionFields.push({ x: this.x, y: this.y, radius: 200, timer: 5.0 });
            }

            if (this.isDashing) {
                const dashDx = this.dashTarget.x - this.x;
                const dashDy = this.dashTarget.y - this.y;
                const dashDist = Math.hypot(dashDx, dashDy);
                if (dashDist > 20) {
                    const dashSpeed = 500;
                    this.x += (dashDx / dashDist) * dashSpeed * dt;
                    this.y += (dashDy / dashDist) * dashSpeed * dt;
                    this.dashTrail.push({ x: this.x, y: this.y, timer: 2.0 });
                    // Fire ring during dash
                    if (Math.random() < 0.1) this.fireRing(6, 150);
                } else {
                    this.isDashing = false;
                }
            } else {
                if (dist > 200) {
                    this.x += (dx / dist) * this.speed * dt;
                    this.y += (dy / dist) * this.speed * dt;
                }
            }
        } else if (this.state === 'phase3') {
            // Extremely fast dashes, 3 distortion fields, homing stream
            if (this.attackTimer <= 0 && !this.isDashing) {
                this.attackTimer = 1.5;
                this.isDashing = true;
                this.dashTarget = { x: player.x, y: player.y };
                this.fireHoming(3);
                // Place 3 distortion fields
                for (let i = 0; i < 3; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const r = 100 + Math.random() * 150;
                    this.distortionFields.push({
                        x: player.x + Math.cos(a) * r,
                        y: player.y + Math.sin(a) * r,
                        radius: 150,
                        timer: 5.0
                    });
                }
            }

            if (this.isDashing) {
                const dashDx = this.dashTarget.x - this.x;
                const dashDy = this.dashTarget.y - this.y;
                const dashDist = Math.hypot(dashDx, dashDy);
                if (dashDist > 20) {
                    const dashSpeed = 600;
                    this.x += (dashDx / dashDist) * dashSpeed * dt;
                    this.y += (dashDy / dashDist) * dashSpeed * dt;
                    this.dashTrail.push({ x: this.x, y: this.y, timer: 2.0 });
                } else {
                    this.isDashing = false;
                }
            } else {
                this.x += (dx / dist) * this.speed * 1.5 * dt;
                this.y += (dy / dist) * this.speed * 1.5 * dt;
            }
        }
    }

    // ---- APEX PREDATOR (Level 25) ----
    private updateApexPredator(dt: number, dx: number, dy: number, dist: number, player: Player) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;

        this.attackTimer -= dt;
        this.minionTimer -= dt;

        if (this.state === 'phase1') {
            if (this.attackTimer <= 0) {
                this.attackTimer = 1.5;
                this.fireBurstTarget(player, 3);
            }
        } else if (this.state === 'phase2') {
            this.speed = 160;
            if (this.attackTimer <= 0) {
                this.attackTimer = 1.5;
                if (this.attackCycle % 2 === 0) {
                    this.fireRing(12, 250);
                } else {
                    this.fireHoming(2);
                }
                this.attackCycle++;
            }
            // Summon brute every 10s
            if (this.minionTimer <= 0) {
                this.minionTimer = 10;
                this.minionQueue.push({ type: 'brute', count: 1, x: this.x, y: this.y });
            }
        } else if (this.state === 'phase3') {
            this.speed = 220;
            if (this.attackTimer <= 0) {
                this.attackTimer = 1.5;
                // Simultaneous ring + homing
                this.fireRing(16, 250);
                this.fireHoming(3);
            }
        }
    }

    // ---- Attack methods ----
    private fireRing(count: number, speed: number) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.projectiles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: this.damage * 0.4,
                life: 5,
                isHoming: false,
                color: this.color
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
                damage: this.damage * 0.6,
                life: 3,
                isHoming: false,
                color: this.color
            });
        }
    }

    private fireCross(arms: number, speed: number) {
        for (let i = 0; i < arms; i++) {
            const angle = (Math.PI * 2 / arms) * i;
            this.projectiles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: this.damage * 0.5,
                life: 4,
                isHoming: false,
                color: '#a78bfa'
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
                isHoming: true,
                color: '#a855f7'
            });
        }
    }

    private fireHomingSpores(count: number, player: Player) {
        for (let i = 0; i < count; i++) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x) + (Math.random() - 0.5) * 0.8;
            this.projectiles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                damage: this.damage * 0.6,
                life: 8,
                isHoming: true,
                color: '#86efac'
            });
        }
    }

    private addTelegraph(x: number, y: number, radius: number, duration: number, color: string) {
        this.telegraphs.push({ x, y, radius, timer: duration, maxTimer: duration, color });
    }

    // ---- DRAW ----
    public draw(ctx: CanvasRenderingContext2D, screenWidth: number, screenHeight: number) {
        ctx.save();

        // Draw void zones
        for (const vz of this.voidZones) {
            const alpha = Math.min(0.6, vz.timer / 3.0 * 0.6);
            ctx.beginPath();
            ctx.arc(vz.x, vz.y, vz.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(124,58,237,${alpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(167,139,250,${alpha + 0.2})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw distortion fields
        for (const df of this.distortionFields) {
            const alpha = Math.min(0.3, df.timer / 5.0 * 0.3);
            ctx.beginPath();
            ctx.arc(df.x, df.y, df.radius, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(df.x, df.y, 0, df.x, df.y, df.radius);
            gradient.addColorStop(0, `rgba(103,232,249,${alpha * 2})`);
            gradient.addColorStop(1, `rgba(103,232,249,0)`);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // Draw dash trail
        for (const t of this.dashTrail) {
            const alpha = t.timer / 2.0;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(103,232,249,${alpha * 0.4})`;
            ctx.fill();
        }

        // Draw telegraphs
        for (const tg of this.telegraphs) {
            const progress = 1 - (tg.timer / tg.maxTimer);
            const currentRadius = tg.radius * progress;
            ctx.beginPath();
            ctx.arc(tg.x, tg.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = tg.color;
            ctx.fill();
            ctx.strokeStyle = tg.color.replace(/[\d.]+\)$/, '0.8)');
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Pulse effect if spawning or stunned
        if (this.state === 'spawning') {
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 100);
        }

        // Death animation
        if (this.state === 'dying') {
            ctx.globalAlpha = this.deathTimer;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.deathRotation);
            ctx.translate(-this.x, -this.y);
        }

        // Draw boss body
        this.drawBody(ctx);

        // Boss projectiles
        for (const p of this.projectiles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.isHoming ? 6 : 5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        // Boss HP bar (drawn outside save/restore for screen-space coordinates)
        if (this.state !== 'dying' && this.state !== 'spawning') {
            this.drawBossHPBar(ctx, screenWidth, screenHeight);
        }
    }

    private drawBody(ctx: CanvasRenderingContext2D) {
        const timeSec = Date.now() / 1000;

        // --- Outer Tech Shield / Energy Aura ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = this.color.replace(/[\d.]+\)$/, '0.3)') || 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rotating outer tick ring
        ctx.translate(this.x, this.y);
        ctx.rotate(timeSec * 0.8);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const rx = Math.cos(angle) * (this.radius * 1.2);
            const ry = Math.sin(angle) * (this.radius * 1.2);
            ctx.rect(rx - 3, ry - 3, 6, 6);
        }
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();

        // --- Main Boss Body ---
        ctx.beginPath();

        switch (this.bossType) {
            case 'core_sentinel':
                // Heavy rotating 12-point spiked star
                for (let i = 0; i < 12; i++) {
                    const r = i % 2 === 0 ? this.radius : this.radius * 0.65;
                    const angle = (Math.PI * 2 / 12) * i + (timeSec * 0.5);
                    if (i === 0) ctx.moveTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                    else ctx.lineTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                }
                ctx.closePath();
                break;

            case 'void_weaver':
                // Web-like pattern — 8-point geometric star with inner weave
                for (let i = 0; i < 8; i++) {
                    const r = i % 2 === 0 ? this.radius : this.radius * 0.5;
                    const angle = (Math.PI * 2 / 8) * i + Math.sin(timeSec * 1.5) * 0.4;
                    if (i === 0) ctx.moveTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                    else ctx.lineTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                }
                ctx.closePath();
                break;

            case 'swarm_hive':
                // Large hexagonal cluster with inner honeycomb
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i + Math.sin(timeSec * 0.5) * 0.1;
                    const hx = this.x + this.radius * Math.cos(angle);
                    const hy = this.y + this.radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                break;

            case 'chrono_wraith':
                // Crackling energy form — irregular shifting multi-point shape
                for (let i = 0; i < 10; i++) {
                    const jitter = Math.sin(timeSec * 8 + i * 2.3) * this.radius * 0.2;
                    const r = this.radius + jitter;
                    const angle = (Math.PI * 2 / 10) * i + Math.sin(timeSec * 2) * 0.3;
                    if (i === 0) ctx.moveTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                    else ctx.lineTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                }
                ctx.closePath();
                break;

            case 'apex_predator':
                // Sharp 10-pointed star with razor edges
                for (let i = 0; i < 10; i++) {
                    const r = i % 2 === 0 ? this.radius * 1.1 : this.radius * 0.4;
                    const angle = (Math.PI * 2 / 10) * i - (timeSec * 1.2);
                    if (i === 0) ctx.moveTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                    else ctx.lineTo(this.x + r * Math.cos(angle), this.y + r * Math.sin(angle));
                }
                ctx.closePath();
                break;
        }

        // Fill color & glow
        let fillColor = this.color;
        if (this.stunTimer > 0) fillColor = '#ffffff';
        if (this.state === 'phase2') {
            const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
            ctx.globalAlpha = (ctx.globalAlpha || 1) * pulse;
        }
        if (this.state === 'phase3') {
            fillColor = '#ffffff';
        }

        ctx.fillStyle = fillColor;
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // --- Inner Glowing Core ---
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.state === 'phase2' ? '#ef4444' : this.state === 'phase3' ? '#f59e0b' : '#000000';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Swarm Hive regen shield visual
        if (this.bossType === 'swarm_hive' && this.isRegenerating) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(74,222,128,${0.5 + 0.5 * Math.sin(Date.now() / 200)})`;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#4ade80';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Shield HP bar (small, above boss)
            const shieldPct = this.regenShieldHP / this.regenShieldMaxHP;
            const barW = this.radius * 1.5;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.x - barW / 2, this.y - this.radius - 20, barW, 4);
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(this.x - barW / 2, this.y - this.radius - 20, barW * shieldPct, 4);
        }
    }

    private drawBossHPBar(ctx: CanvasRenderingContext2D, screenWidth: number, _screenHeight: number) {
        const barWidth = screenWidth * 0.7;
        const barHeight = 14;
        const barX = (screenWidth - barWidth) / 2;
        const barY = 55; // Just below top HUD

        const hpPct = Math.max(0, this.hp / this.maxHp);

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 4);
        ctx.fill();

        // HP fill
        const hpColor = hpPct > 0.5 ? this.color : hpPct > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillStyle = hpColor;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth * hpPct, barHeight, 3);
        ctx.fill();

        // Phase markers
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        const p2x = barX + barWidth * 0.5;
        ctx.fillRect(p2x, barY, 2, barHeight);
        if (this.hasPhase3()) {
            const p3x = barX + barWidth * 0.25;
            ctx.fillRect(p3x, barY, 2, barHeight);
        }

        // Boss name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.toUpperCase(), screenWidth / 2, barY - 5);

        // Phase indicator dots
        const dotY = barY + barHeight + 10;
        const phases = this.hasPhase3() ? 3 : 2;
        const currentPhaseNum = this.state === 'phase1' ? 1 : this.state === 'phase2' ? 2 : 3;
        for (let i = 0; i < phases; i++) {
            ctx.beginPath();
            ctx.arc(screenWidth / 2 - (phases - 1) * 8 + i * 16, dotY, 4, 0, Math.PI * 2);
            ctx.fillStyle = (i + 1) <= currentPhaseNum ? this.color : 'rgba(255,255,255,0.3)';
            ctx.fill();
        }
    }
}

interface BossProjectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    life: number;
    isHoming: boolean;
    color: string;
}
