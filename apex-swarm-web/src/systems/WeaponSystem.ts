import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { MissileProjectile, PlasmaOrbProjectile, ChainLightningProjectile, ScytheArcProjectile } from '../entities/Projectiles';
import { Enemy } from '../entities/Enemy';

// Note: In Phase 3, we will add specific projectile subclasses.
// For now, they all shoot basic projectiles with different stats just to verify the system works.
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
        
        let baseDmg = 25;
        let baseRate = 0.5;
        let speed = 400;

        if (w.id === 'kinetic_blaster') {
            baseRate = Math.max(0.2, 0.5 - (w.level * 0.05));
            baseDmg = 25 * (1 + w.level * 0.15);
            const dmg = baseDmg * effectiveDamageMult;
            projectiles.push(new Projectile(this.player.x, this.player.y, angle, dmg, speed));
            this.player.x -= Math.cos(angle) * 3;
            this.player.y -= Math.sin(angle) * 3;
        } else if (w.id === 'plasma_orbit') {
            baseRate = 0.8;
            baseDmg = 15 * w.level;
            const orbs = Math.min(6, 1 + Math.floor(w.level / 2));
            for(let i=0; i<orbs; i++) {
                projectiles.push(new PlasmaOrbProjectile(this.player, (Math.PI * 2 / orbs) * i, baseDmg * effectiveDamageMult, this.player.orbitBonus));
            }
        } else if (w.id === 'chain_lightning') {
            baseRate = 1.0;
            baseDmg = 40;
            const jumps = 1 + w.level;
            projectiles.push(new ChainLightningProjectile(this.player.x, this.player.y, angle, baseDmg * effectiveDamageMult, speed * 2, jumps, this.player.chainFalloffReduction));
        } else if (w.id === 'missile_barrage') {
            baseRate = 1.2;
            baseDmg = 80;
            const radius = 40 * (1 + this.player.splashBonus);
            projectiles.push(new MissileProjectile(this.player.x, this.player.y, angle, baseDmg * effectiveDamageMult, speed * 0.8, radius));
        } else if (w.id === 'glitch_scythe') {
            baseRate = 0.8;
            baseDmg = 35;
            projectiles.push(new ScytheArcProjectile(this.player, angle, baseDmg * effectiveDamageMult));
        } else if (w.id === 'drone_swarm') {
            baseRate = 1.0;
            baseDmg = 10;
            projectiles.push(new Projectile(this.player.x, this.player.y, angle, baseDmg * effectiveDamageMult, speed));
        }

        this.cooldowns[w.id] = baseRate * this.player.fireRateMultiplier;
    }
}
