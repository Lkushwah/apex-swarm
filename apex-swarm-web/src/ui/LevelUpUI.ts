import { Player } from '../entities/Player';
import { WEAPONS, type WeaponData } from '../data/weapons';
import { PASSIVES, type PassiveData } from '../data/passives';
import { EvolutionSystem } from '../systems/EvolutionSystem';

export class LevelUpUI {
    private screen = document.getElementById('levelup-screen')!;
    private grid = document.getElementById('levelup-grid')!;
    private rerollBtn = document.getElementById('reroll-btn')! as HTMLButtonElement;
    private banishBtn = document.getElementById('banish-btn')! as HTMLButtonElement;
    private onPick: () => void;

    // Reroll/Banish state
    private banishedIds: Set<string> = new Set();
    private rerollCharges: number = 1;
    private banishCharges: number = 1;
    private currentPlayer: Player | null = null;
    private isBanishMode: boolean = false;

    constructor(onPick: () => void) {
        this.onPick = onPick;

        this.rerollBtn.addEventListener('click', () => {
            if (this.rerollCharges > 0 && this.currentPlayer) {
                this.rerollCharges--;
                this.show(this.currentPlayer);
            }
        });

        this.banishBtn.addEventListener('click', () => {
            if (this.banishCharges > 0) {
                this.isBanishMode = !this.isBanishMode;
                this.updateButtonLabels();
                // Toggle visual state on cards
                const cards = this.grid.querySelectorAll('.levelup-card');
                cards.forEach(c => {
                    (c as HTMLElement).style.borderColor = this.isBanishMode ? '#ef4444' : '#334155';
                });
            }
        });
    }

    // Called at run start to set charges from perm upgrades
    public setCharges(rerollCharges: number, banishCharges: number) {
        this.rerollCharges = rerollCharges;
        this.banishCharges = banishCharges;
        this.banishedIds.clear();
        this.isBanishMode = false;
    }

    public show(player: Player) {
        this.currentPlayer = player;
        const pool = this.buildPool(player);
        const choices = pool.sort(() => Math.random() - 0.5).slice(0, 3);
        
        this.grid.innerHTML = '';
        this.updateButtonLabels();

        if (choices.length === 0) {
            // Nothing to upgrade, just resume
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
                if (this.isBanishMode) {
                    // Banish this item from the pool
                    this.banishedIds.add(data.id);
                    this.banishCharges--;
                    this.isBanishMode = false;
                    // Re-show with new pool (minus banished item)
                    this.show(player);
                    return;
                }

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

    private updateButtonLabels() {
        this.rerollBtn.textContent = `REROLL (${this.rerollCharges})`;
        this.rerollBtn.disabled = this.rerollCharges <= 0;
        this.rerollBtn.style.opacity = this.rerollCharges > 0 ? '1' : '0.4';

        this.banishBtn.textContent = this.isBanishMode ? 'PICK TO BANISH' : `BANISH (${this.banishCharges})`;
        this.banishBtn.disabled = this.banishCharges <= 0 && !this.isBanishMode;
        this.banishBtn.style.opacity = (this.banishCharges > 0 || this.isBanishMode) ? '1' : '0.4';
        this.banishBtn.style.borderColor = this.isBanishMode ? '#ef4444' : '';
        this.banishBtn.style.color = this.isBanishMode ? '#ef4444' : '';
    }

    private buildPool(player: Player) {
        const pool: { type: 'weapon' | 'passive', data: WeaponData | PassiveData, nextLevel: number }[] = [];
        
        // Weapons
        const maxWeapons = player.maxWeaponSlots ?? 6;
        const hasOpenWeaponSlot = player.weapons.length < maxWeapons;
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
        const maxPassives = player.maxPassiveSlots ?? 6;
        const hasOpenPassiveSlot = player.passives.length < maxPassives;
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
        this.isBanishMode = false;
    }
}
