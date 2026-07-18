import { Player } from '../entities/Player';
import { WEAPONS, type WeaponData } from '../data/weapons';
import { PASSIVES, type PassiveData } from '../data/passives';
import { EvolutionSystem } from '../systems/EvolutionSystem';

export class LevelUpUI {
    private screen = document.getElementById('levelup-screen')!;
    private grid = document.getElementById('levelup-grid')!;
    private onPick: () => void;

    // TODO: implement reroll/banish charges
    private banishedIds: Set<string> = new Set();

    constructor(onPick: () => void) {
        this.onPick = onPick;
    }

    public show(player: Player) {
        const pool = this.buildPool(player);
        const choices = pool.sort(() => Math.random() - 0.5).slice(0, 3);
        
        this.grid.innerHTML = '';

        if (choices.length === 0) {
            // Nothing to upgrade, just give some credits
            this.hide();
            this.onPick();
            return;
        }

        choices.forEach(choice => {
            const card = document.createElement('button');
            card.className = 'levelup-card';
            
            const isWeapon = choice.type === 'weapon';
            const data = choice.data;
            const nextLvl = choice.nextLevel;
            const isMax = nextLvl === data.maxLevel;
            
            card.innerHTML = `
                <div class="lu-icon">${data.icon}</div>
                <div class="lu-name">${data.name} <span style="color:#fbbf24; font-size:0.8em">LVL ${nextLvl}</span></div>
                <div class="lu-desc">${isMax ? 'MAX LEVEL' : data.description}</div>
            `;
            
            card.addEventListener('click', () => {
                if (isWeapon) {
                    const w = player.weapons.find(x => x.id === data.id);
                    if (w) w.level = nextLvl;
                    else player.weapons.push({ id: data.id, level: 1, evolved: false });
                } else {
                    const p = player.passives.find(x => x.id === data.id);
                    if (p) p.level = nextLvl;
                    else player.passives.push({ id: data.id, level: 1 });
                    
                    // Apply passive effect for the new level
                    (data as PassiveData).apply(player, nextLvl, null);
                }
                
                EvolutionSystem.checkEvolutions(player);
                
                this.hide();
                this.onPick();
            });
            this.grid.appendChild(card);
        });

        this.screen.classList.remove('hidden');
    }

    private buildPool(player: Player) {
        const pool: { type: 'weapon' | 'passive', data: WeaponData | PassiveData, nextLevel: number }[] = [];
        
        // Weapons
        const hasOpenWeaponSlot = player.weapons.length < 6;
        for (const wData of WEAPONS) {
            if (this.banishedIds.has(wData.id)) continue;
            
            const w = player.weapons.find(x => x.id === wData.id);
            if (w) {
                if (w.level < wData.maxLevel && !w.evolved) {
                    pool.push({ type: 'weapon', data: wData, nextLevel: w.level + 1 });
                }
            } else if (hasOpenWeaponSlot) {
                pool.push({ type: 'weapon', data: wData, nextLevel: 1 });
            }
        }
        
        // Passives
        const hasOpenPassiveSlot = player.passives.length < 6;
        for (const pData of PASSIVES) {
            if (this.banishedIds.has(pData.id)) continue;
            
            const p = player.passives.find(x => x.id === pData.id);
            if (p) {
                if (p.level < pData.maxLevel) {
                    pool.push({ type: 'passive', data: pData, nextLevel: p.level + 1 });
                }
            } else if (hasOpenPassiveSlot) {
                pool.push({ type: 'passive', data: pData, nextLevel: 1 });
            }
        }
        
        return pool;
    }

    public hide() {
        this.screen.classList.add('hidden');
    }
}
