import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { MissileProjectile, PlasmaOrbProjectile, ChainLightningProjectile, ScytheArcProjectile,
         RailgunBeam, SingularityRing, StormFrontPulse, RealityTearPulse, HiveMindLaser } from '../entities/Projectiles';
import { Enemy } from '../entities/Enemy';
import { Drone } from '../entities/Drone';

export class WeaponSystem {
    private player: Player;
    
    public apexDamageBonus: number = 0; // set by main.ts from ApexSystem

    // Track cooldowns for each weapon id
    private cooldowns: Record<string, number> = {};
    
    public drones: Drone[] = [];

    constructor(player: Player) {
        this.player = player;
    }

    public update(dt: number, enemies: Enemy[], projectiles: Projectile[]) {
        for (const w of this.player.weapons) {
            if (w.id === 'drone_swarm') {
                this.updateDrones(w, dt, enemies, projectiles);
                continue;
            }

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
            if (w.evolved) {
                baseRate = 0.5;
                const dmg = 25 * 3 * effectiveDamageMult; // Railgun does big damage
                projectiles.push(new RailgunBeam(this.player.x, this.player.y, angle, dmg));
                // Large recoil
                this.player.x -= Math.cos(angle) * 10;
                this.player.y -= Math.sin(angle) * 10;
            } else {
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
            }

        } else if (w.id === 'plasma_orbit') {
            if (w.evolved) {
                baseRate = 4.0;
                const dmg = 50 * effectiveDamageMult; 
                projectiles.push(new SingularityRing(this.player, dmg));
            } else {
                baseRate = 0.8;
                const baseDmg = 15 * (1 + w.level * 0.15);
                const orbs = Math.min(6, 1 + Math.floor(w.level / 2));
                for (let i = 0; i < orbs; i++) {
                    projectiles.push(new PlasmaOrbProjectile(this.player, (Math.PI * 2 / orbs) * i, baseDmg * effectiveDamageMult, this.player.orbitBonus));
                }
            }

        } else if (w.id === 'chain_lightning') {
            if (w.evolved) {
                baseRate = 2.0;
                const dmg = 80 * effectiveDamageMult;
                projectiles.push(new StormFrontPulse(this.player, dmg));
            } else {
                baseRate = 1.0;
                const baseDmg = 40 * (1 + w.level * 0.1);
                const jumps = 1 + w.level;
                projectiles.push(new ChainLightningProjectile(this.player.x, this.player.y, angle, baseDmg * effectiveDamageMult, 800, jumps, this.player.chainFalloffReduction));
            }

        } else if (w.id === 'missile_barrage') {
            if (w.evolved) {
                baseRate = 1.0;
                const dmg = 120 * effectiveDamageMult;
                const p = new MissileProjectile(this.player.x, this.player.y, angle, dmg, 300, 60);
                (p as any).isApocalypse = true;
                projectiles.push(p);
            } else {
                baseRate = 1.2 - (w.level * 0.05); // Scales fire rate
                const baseDmg = 80 * (1 + w.level * 0.12);
                const radius = 40 * (1 + this.player.splashBonus);
                const missileCount = 1 + Math.floor(w.level / 3);
                for (let i = 0; i < missileCount; i++) {
                    const spreadAngle = angle + (i - Math.floor(missileCount / 2)) * 0.3;
                    projectiles.push(new MissileProjectile(this.player.x, this.player.y, spreadAngle, baseDmg * effectiveDamageMult, 320, radius));
                }
            }

        } else if (w.id === 'glitch_scythe') {
            if (w.evolved) {
                baseRate = 1.0;
                const dmg = 100 * effectiveDamageMult;
                projectiles.push(new RealityTearPulse(this.player, dmg));
            } else {
                baseRate = Math.max(0.4, 0.8 - (w.level * 0.05));
                const baseDmg = 35 * (1 + w.level * 0.12);
                projectiles.push(new ScytheArcProjectile(this.player, angle, baseDmg * effectiveDamageMult));
            }

        this.cooldowns[w.id] = baseRate * this.player.fireRateMultiplier;
    }

    private updateDrones(w: {id: string, level: number, evolved: boolean}, dt: number, enemies: Enemy[], projectiles: Projectile[]) {
        const targetDroneCount = w.evolved ? 10 + w.level : Math.min(5, 1 + Math.floor(w.level / 2));
        
        while (this.drones.length < targetDroneCount) {
            const initialAngle = (Math.PI * 2 / targetDroneCount) * this.drones.length;
            this.drones.push(new Drone(this.player, initialAngle));
        }

        const effectiveDamageMult = this.player.damageMultiplier + this.apexDamageBonus;
        const dmg = 10 * (1 + w.level * 0.15) * effectiveDamageMult;

        for (const drone of this.drones) {
            drone.isEvolved = w.evolved;
            drone.update(dt, enemies, projectiles, null, dmg);
            
            // In evolved mode, draw continuous lasers
            if (drone.isEvolved && (drone as any).targetEnemy && !(drone as any).targetEnemy.isDead) {
                const target = (drone as any).targetEnemy;
                projectiles.push(new HiveMindLaser(drone.x, drone.y, target, dmg * 2)); // High DPS laser
            }
        }
    }
}
