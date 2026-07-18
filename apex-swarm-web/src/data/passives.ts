export interface PassiveData {
    id: string;
    name: string;
    icon: string;
    description: string;
    maxLevel: number;
    evolutionPartner?: string;
    apply: (player: any, level: number, weaponSystem: any) => void;
}

export const PASSIVES: PassiveData[] = [
    {
        id: 'targeting_module',
        name: 'Targeting Module',
        icon: '🎯',
        description: '+10% crit chance, +25% crit dmg per level',
        maxLevel: 5,
        evolutionPartner: 'kinetic_blaster',
        apply: (player, level, _ws) => {
            player.critChance = 0.10 * level;
            player.critDamage = 1.5 + (0.25 * level);
        }
    },
    {
        id: 'mass_core',
        name: 'Mass Core',
        icon: '🌀',
        description: '+10% orbit weapon size & damage per level',
        maxLevel: 5,
        evolutionPartner: 'plasma_orbit',
        apply: (player, level, _ws) => {
            player.orbitBonus = 0.10 * level;
        }
    },
    {
        id: 'conductor_coil',
        name: 'Conductor Coil',
        icon: '🔗',
        description: '+15% chain range, -10% chain falloff per level',
        maxLevel: 5,
        evolutionPartner: 'chain_lightning',
        apply: (player, level, _ws) => {
            player.chainBonus = 0.15 * level;
            player.chainFalloffReduction = 0.10 * level;
        }
    },
    {
        id: 'warhead',
        name: 'Warhead',
        icon: '💥',
        description: '+20% splash radius per level',
        maxLevel: 5,
        evolutionPartner: 'missile_barrage',
        apply: (player, level, _ws) => {
            player.splashBonus = 0.20 * level;
        }
    },
    {
        id: 'bloodline_edge',
        name: 'Bloodline Edge',
        icon: '🩸',
        description: '+4% lifesteal on melee hits per level',
        maxLevel: 5,
        evolutionPartner: 'glitch_scythe',
        apply: (player, level, _ws) => {
            player.meleeLifesteal = 0.04 * level;
        }
    },
    {
        id: 'swarm_link',
        name: 'Swarm Link',
        icon: '📡',
        description: '+1 drone HP regen/s, -10% respawn time per level',
        maxLevel: 5,
        evolutionPartner: 'drone_swarm',
        apply: (player, level, _ws) => {
            player.droneRegen = 1 * level;
            player.droneRespawnBonus = 0.10 * level;
        }
    },
    {
        id: 'iron_plate',
        name: 'Iron Plate',
        icon: '🛡️',
        description: '+3 flat Armor per level',
        maxLevel: 5,
        apply: (player, level, _ws) => {
            player.armor = 3 * level;
        }
    },
    {
        id: 'apex_capacitor',
        name: 'Apex Capacitor',
        icon: '🔋',
        description: '+8% faster Apex Meter fill rate per level',
        maxLevel: 5,
        apply: (_player, _level, _ws) => {
            // Wired in main.ts: reads player.passives for apex_capacitor level
            // and sets apexSystem.fillRateBonus = level * 0.08
        }
    },
    {
        id: 'momentum_drive',
        name: 'Momentum Drive',
        icon: '👟',
        description: '+6% Move Speed per level, +1 dash charge at max',
        maxLevel: 5,
        apply: (player, level, _ws) => {
            player.speedMultiplier += 0.06 * level;
            if (level === 5) player.maxDashCharges = 2;
        }
    },
    {
        id: 'vampiric_core',
        name: 'Vampiric Core',
        icon: '❤️',
        description: 'Heal 1% of damage dealt as HP per level',
        maxLevel: 5,
        apply: (player, level, _ws) => {
            player.globalLifesteal = 0.01 * level;
        }
    }
];
