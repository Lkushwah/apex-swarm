// -------------------------------------------------------
// Upgrade Definitions – single source of truth for the GDD
// -------------------------------------------------------

export interface RunUpgrade {
    id: string;
    name: string;
    icon: string;
    description: string;
    apply: (player: any) => void;
}

export interface PermUpgrade {
    id: string;
    name: string;
    icon: string;
    description: string;
    maxLevel: number;
    baseCost: number;
    costPerLevel: number;
    apply: (player: any, level: number) => void;
}

// Per-run draft upgrades (shown at level-up)
export const RUN_UPGRADES: RunUpgrade[] = [
    {
        id: 'dmg_up',
        name: 'Damage Up',
        icon: '⚔️',
        description: 'Increase all weapon damage by 25%.',
        apply: (p) => { p.damageMultiplier += 0.25; }
    },
    {
        id: 'fire_rate_up',
        name: 'Fire Rate Up',
        icon: '⚡',
        description: 'Fire 20% faster.',
        apply: (p) => { p.fireRateMultiplier *= 0.8; }
    },
    {
        id: 'speed_up',
        name: 'Speed Up',
        icon: '👟',
        description: 'Move 15% faster.',
        apply: (p) => { p.speedMultiplier += 0.15; }
    },
    {
        id: 'hp_up',
        name: 'HP Restore',
        icon: '❤️',
        description: 'Restore 20% of Max HP.',
        apply: (p) => { p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.2); }
    },
    {
        id: 'apex_charge',
        name: 'Apex Charge',
        icon: '🔥',
        description: 'Increases APEX MODE duration by 3 seconds.',
        apply: (p) => { p.apexDurationBonus = (p.apexDurationBonus || 0) + 3; }
    },
];

// Permanent upgrades (bought in the shop between runs)
export const PERM_UPGRADES: PermUpgrade[] = [
    {
        id: 'perm_hp',
        name: 'Iron Shell',
        icon: '🛡️',
        description: '+10 Max HP per level.',
        maxLevel: 10,
        baseCost: 50,
        costPerLevel: 25,
        apply: (p, lvl) => { p.maxHp += 10 * lvl; p.hp += 10 * lvl; }
    },
    {
        id: 'perm_dmg',
        name: 'War Core',
        icon: '🗡️',
        description: '+5% Damage per level.',
        maxLevel: 10,
        baseCost: 75,
        costPerLevel: 35,
        apply: (p, lvl) => { p.damageMultiplier += 0.05 * lvl; }
    },
    {
        id: 'perm_speed',
        name: 'Drift Engine',
        icon: '💨',
        description: '+5% Movement Speed per level.',
        maxLevel: 5,
        baseCost: 60,
        costPerLevel: 30,
        apply: (p, lvl) => { p.speedMultiplier += 0.05 * lvl; }
    },
    {
        id: 'perm_fire_rate',
        name: 'Rapid Coil',
        icon: '🔩',
        description: '5% faster Fire Rate per level.',
        maxLevel: 5,
        baseCost: 80,
        costPerLevel: 40,
        apply: (p, lvl) => { p.fireRateMultiplier *= Math.pow(0.95, lvl); }
    },
    {
        id: 'perm_magnet',
        name: 'Gem Magnet',
        icon: '🧲',
        description: '+20px XP Gem magnet radius per level.',
        maxLevel: 5,
        baseCost: 40,
        costPerLevel: 20,
        apply: (p, lvl) => { p.magnetRadius = (p.magnetRadius || 100) + 20 * lvl; }
    },
    {
        id: 'perm_apex',
        name: 'Apex Amplifier',
        icon: '🔥',
        description: '+5% APEX MODE damage and duration per level.',
        maxLevel: 5,
        baseCost: 100,
        costPerLevel: 50,
        apply: (_p, _lvl) => { /* Applied by ApexSystem */ }
    },
    {
        id: 'perm_credits',
        name: 'Credit Surge',
        icon: '💰',
        description: '+10% Credits earned per run per level.',
        maxLevel: 5,
        baseCost: 90,
        costPerLevel: 45,
        apply: (_p, _lvl) => { /* Applied by SaveManager at run end */ }
    }
];
