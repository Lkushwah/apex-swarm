import { SaveManager } from '../core/SaveManager';
import { Player } from '../entities/Player';

export interface CosmeticDef {
    id: string;
    name: string;
    cost: number;
    color: string;
}

export const COSMETICS: CosmeticDef[] = [
    { id: 'default', name: 'Standard Unit', cost: 0, color: '#38bdf8' },
    { id: 'crimson', name: 'Crimson Fury', cost: 100, color: '#ef4444' },
    { id: 'void', name: 'Void Walker', cost: 250, color: '#a855f7' },
    { id: 'gold', name: 'Golden Apex', cost: 500, color: '#fbbf24' },
    { id: 'glitch', name: 'Glitch Entity', cost: 1000, color: '#10b981' }
];

export class CosmeticsUI {
    private container: HTMLElement;
    private saveManager: SaveManager;
    private onClose: () => void;
    private player?: Player;

    constructor(saveManager: SaveManager, player: Player | undefined, onClose: () => void) {
        this.saveManager = saveManager;
        this.player = player;
        this.onClose = onClose;
        this.container = document.getElementById('cosmetics-screen')!;
        this.render();
    }

    public setPlayer(p: Player) {
        this.player = p;
    }

    public show() {
        this.container.classList.remove('hidden');
        this.render();
    }

    private render() {
        const cores = this.saveManager.getCores();
        const equipped = this.saveManager.getEquippedCosmetic();

        this.container.innerHTML = `
            <div class="lu-glow" style="background: radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%);"></div>
            <h2 class="lu-title" style="color: #a855f7;">COSMETICS</h2>
            <p class="lu-subtitle">Cores available: 💎 ${cores}</p>
            <div id="cosmetics-grid" class="levelup-grid" style="grid-template-columns: repeat(3, 1fr);">
            </div>
            <div style="margin-top: 24px;">
                <button id="cosmetics-close-btn" class="btn btn-secondary">BACK</button>
            </div>
        `;

        const grid = document.getElementById('cosmetics-grid')!;
        
        COSMETICS.forEach(c => {
            const isUnlocked = this.saveManager.hasCosmetic(c.id);
            const isEquipped = equipped === c.id;

            const card = document.createElement('div');
            card.className = 'card upgrade-card';
            card.style.borderColor = isEquipped ? '#a855f7' : (isUnlocked ? '#334155' : '#1e293b');
            if (isEquipped) card.style.boxShadow = '0 0 15px rgba(168,85,247,0.4)';

            card.innerHTML = `
                <div class="card-title" style="color: ${c.color}">${c.name}</div>
                <div class="card-desc">
                    <div style="width: 30px; height: 30px; background: ${c.color}; margin: 10px auto; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"></div>
                </div>
                ${isEquipped ? `<button class="btn btn-secondary" disabled style="border-color:#a855f7; color:#a855f7">EQUIPPED</button>` :
                  isUnlocked ? `<button class="btn btn-primary equip-btn" data-id="${c.id}">EQUIP</button>` :
                  `<button class="btn ${cores >= c.cost ? 'btn-primary' : 'btn-secondary'} buy-btn" data-id="${c.id}" ${cores < c.cost ? 'disabled' : ''}>BUY (💎 ${c.cost})</button>`
                }
            `;
            grid.appendChild(card);
        });

        document.getElementById('cosmetics-close-btn')!.addEventListener('click', () => {
            this.container.classList.add('hidden');
            this.onClose();
        });

        grid.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLElement).getAttribute('data-id')!;
                const cosmetic = COSMETICS.find(c => c.id === id)!;
                if (cores >= cosmetic.cost) {
                    this.saveManager.addCores(-cosmetic.cost);
                    this.saveManager.unlockCosmetic(id);
                    this.saveManager.equipCosmetic(id);
                    if (this.player) this.player.color = cosmetic.color;
                    this.render();
                }
            });
        });

        grid.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLElement).getAttribute('data-id')!;
                const cosmetic = COSMETICS.find(c => c.id === id)!;
                this.saveManager.equipCosmetic(id);
                if (this.player) this.player.color = cosmetic.color;
                this.render();
            });
        });
    }
}
