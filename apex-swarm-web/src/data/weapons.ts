export interface WeaponData {
    id: string;
    name: string;
    icon: string;
    description: string;
    maxLevel: number;
    passivePartner: string;
    evolvedName: string;
    evolvedDesc: string;
}

export const WEAPONS: WeaponData[] = [
    {
        id: 'kinetic_blaster',
        name: 'Kinetic Blaster',
        icon: '🔫',
        description: 'Fires projectiles at nearest enemy.',
        maxLevel: 8,
        passivePartner: 'targeting_module',
        evolvedName: 'Railgun Array',
        evolvedDesc: 'Piercing line-beam through all enemies.'
    },
    {
        id: 'plasma_orbit',
        name: 'Plasma Orbit',
        icon: '🪐',
        description: 'Orbiting plasma orbs around the player.',
        maxLevel: 8,
        passivePartner: 'mass_core',
        evolvedName: 'Singularity Ring',
        evolvedDesc: 'Orbs merge into a rotating ring pulling enemies.'
    },
    {
        id: 'chain_lightning',
        name: 'Chain Lightning',
        icon: '⚡',
        description: 'Lightning chains between enemies.',
        maxLevel: 8,
        passivePartner: 'conductor_coil',
        evolvedName: 'Storm Front',
        evolvedDesc: 'Screen-wide chain pulse that stuns.'
    },
    {
        id: 'missile_barrage',
        name: 'Missile Barrage',
        icon: '🚀',
        description: 'Homing missiles with splash damage.',
        maxLevel: 8,
        passivePartner: 'warhead',
        evolvedName: 'Apocalypse Pod',
        evolvedDesc: 'Missiles split into 3 sub-munitions on impact.'
    },
    {
        id: 'glitch_scythe',
        name: 'Glitch Scythe',
        icon: '🗡️',
        description: 'Wide melee arc swing in direction of enemies.',
        maxLevel: 8,
        passivePartner: 'bloodline_edge',
        evolvedName: 'Reality Tear',
        evolvedDesc: '360° pulse with lifesteal on every hit.'
    },
    {
        id: 'drone_swarm',
        name: 'Drone Swarm',
        icon: '🛸',
        description: 'Autonomous drones target enemies.',
        maxLevel: 8,
        passivePartner: 'swarm_link',
        evolvedName: 'Hive Mind',
        evolvedDesc: 'Uncapped drones with slow tracking lasers.'
    }
];
