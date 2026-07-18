import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { MissileProjectile, PlasmaOrbProjectile, ChainLightningProjectile, ScytheArcProjectile } from '../entities/Projectiles';
import { Enemy } from '../entities/Enemy';

export class WeaponSystem {
    private player: Player;
    
    public apexDamageBonus: number = 0; // set by main.ts from ApexSystem

    // Track cooldowns for each weapon id
    private cooldowns: Record<string, number> = {};

    constructor(player: Player) {
        this.player = player;
    }

    public update(dt: number, enemies: Enemy[], projectiles: Projectile[]) {
        for (const w of this.player.weapons) {
            if (!this.cooldowns[w.id]) this.cooldowns[w.id] = 0;
            this.cooldowns[w.id] -= dt;

            if (this.cooldowns[w.id] <= 0 && enemies.length > 0) {
                this.fireWeapon(w, enemies, projectiles);
            }
        }
    }

    private fireWeapon(w: {id: string, level: number, evolved: boolean}, enemies: Enemy[], projectiles: Projectile[]) {
        // Find closest enemy
        let closest: Enemy | null = null;
        let minDist = Infinity;
        
        for (const e of enemies) {
            if (e.isDead) continue;
            const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if (dist < minDist) {
                minDist = dist;
                closest = e;
            }
        }

        if (!closest) return;

        const dx = closest.x - this.player.x;
        const dy = closest.y - this.player.y;
        const angle = Math.atan2(dy, dx);
        
        const effectiveDamageMult = this.player.damageMultiplier + this.apexDamageBonus;
        
        let baseRate = 0.5;

        if (w.id === 'kinetic_blaster') {
            baseRate = Math.max(0.2, 0.5 - (w.level * 0.04));
            const baseDmg = 25 * (1 + w.level * 0.15);
            const dmg = baseDmg * effectiveDamageMult;
            const speed = 400;

            // Multi-projectile: +1 every 2 levels (fan spread at 3+)
            const projectileCount = 1 + Math.floor(w.level / 2);
            if (projectileCount === 1) {
                projectiles.push(new Projectile(this.player.x, this.player.y, angle, dmg, speed));
            } else {
                const spreadAngle = Math.PI / 12; // 15° spread per projectile
                const startAngle = angle - (spreadAngle * (projectileCount - 1)) / 2;
                for (let i = 0; i < projectileCount; i++) {
                    projectiles.push(new Projectile(this.player.x, this.player.y, startAngle + spreadAngle * i, dmg, speed));
                }
            }
            // Recoil
            this.player.x -= Math.cos(angle) * 3;
            this.player.y -= Math.sin(angle) * 3;

        } else if (w.id === 'plasma_orbit') {
            baseRate = 0.8;
            const baseDmg = 15 * (1 + w.level * 0.15);
            const orbs = Math.min(6, 1 + Math.floor(w.level / 2));
            for (let i = 0; i < orbs; i++) {
                projectiles.push(new PlasmaOrbProjectile(this.player, (Math.PI * 2 / orbs) * i, baseDmg * effectiveDamageMult, this.player.orbitBonus));
            }

        } else if (w.id === 'chain_lightning') {
            baseRate = 1.0;
            const baseDmg = 40 * (1 + w.level * 0.1);
            const jumps = 1 + w.level;
            projectiles.push(new ChainLightningProjectile(this.player.x, this.player.y, angle, baseDmg * effectiveDamageMult, 800, jumps, this.player.chainFalloffReduction));

        } else if (w.id === 'missile_barrage') {
            baseRate = 1.2 - (w.level * 0.05); // Scales fire rate
            const baseDmg = 80 * (1 + w.level * 0.12);
            const radius = 40 * (1 + this.player.splashBonus);
            const missileCount = 1 + Math.floor(w.level / 3);
            for (let i = 0; i < missileCount; i++) {
                const spreadAngle = angle + (i - Math.floor(missileCount / 2)) * 0.3;
                projectiles.push(new MissileProjectile(this.player.x, this.player.y, spreadAngle, baseDmg * effectiveDamageMult, 320, radius));
            }

        } else if (w.id === 'glitch_scythe') {
            baseRate = Math.max(0.4, 0.8 - (w.level * 0.05));
            const baseDmg = 35 * (1 + w.level * 0.12);
            projectiles.push(new ScytheArcProjectile(this.player, angle, baseDmg * effectiveDamageMult));

        } else if (w.id === 'drone_swarm') {
            // Simplified drone: fires multiple auto-targeting projectiles
            baseRate = 0.6;
            const baseDmg = 10 * (1 + w.level * 0.15);
            const droneCount = Math.min(5, 1 + Math.floor(w.level / 2));
            
            // Target different enemies if possible
            const sortedEnemies = [...enemies].filter(e => !e.isDead).sort((a, b) => {
                const distA = Math.hypot(a.x - this.player.x, a.y - this.player.y);
                const distB = Math.hypot(b.x - this.player.x, b.y - this.player.y);
                return distA - distB;
            });

            for (let i = 0; i < droneCount && i < sortedEnemies.length; i++) {
                const target = sortedEnemies[i];
                const dAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
                const p = new Projectile(
                    this.player.x + (Math.random() - 0.5) * 30,
                    this.player.y + (Math.random() - 0.5) * 30,
                    dAngle, baseDmg * effectiveDamageMult, 350
                );
                p.color = '#a3e635'; // Lime green for drones
                p.radius = 3;
                projectiles.push(p);
            }
        }

        this.cooldowns[w.id] = baseRate * this.player.fireRateMultiplier;
    }
}
