// -------------------------------------------------------
// PowerUpgradesUI – the permanent upgrade shop modal
// -------------------------------------------------------

import { PERM_UPGRADES } from '../data/upgrades';
import { SaveManager } from '../core/SaveManager';

export class PowerUpgradesUI {
    private container: HTMLElement;
    private onClose: () => void;
    private saveManager: SaveManager;

    constructor(saveManager: SaveManager, onClose: () => void) {
        this.saveManager = saveManager;
        this.onClose = onClose;
        this.container = document.getElementById('power-upgrades-screen')!;
        this.build();
    }

    public show() {
        this.refresh();
        this.container.classList.remove('hidden');
    }

    public hide() {
        this.container.classList.add('hidden');
    }

    private getCost(id: string): number {
        const def = PERM_UPGRADES.find(u => u.id === id)!;
        const level = this.saveManager.getUpgradeLevel(id);
        return def.baseCost + level * def.costPerLevel;
    }

    private build() {
        this.container.innerHTML = `
            <div class="overlay-panel">
                <div class="panel-header">
                    <h2 class="panel-title">
                        ⚡ POWER UPGRADES
                    </h2>
                    <div class="credits-display" id="pu-credits">
                        💰 <span id="pu-credits-value">0</span> Credits
                    </div>
                </div>
                <div class="upgrade-grid" id="pu-grid"></div>
                <button class="close-btn" id="pu-close">← BACK TO MENU</button>
            </div>
        `;

        document.getElementById('pu-close')!.addEventListener('click', () => {
            this.hide();
            this.onClose();
        });
        
        this.refresh();
    }

    public refresh() {
        const grid = document.getElementById('pu-grid')!;
        const creditsEl = document.getElementById('pu-credits-value')!;
        const currentCredits = this.saveManager.getCredits();
        creditsEl.textContent = String(currentCredits);

        grid.innerHTML = '';

        PERM_UPGRADES.forEach(upg => {
            const level = this.saveManager.getUpgradeLevel(upg.id);
            const cost = this.getCost(upg.id);
            const isMaxed = level >= upg.maxLevel;
            const canAfford = currentCredits >= cost && !isMaxed;

            const card = document.createElement('div');
            card.className = `upg-card ${isMaxed ? 'maxed' : canAfford ? 'affordable' : 'locked'}`;
            card.innerHTML = `
                <div class="upg-icon">${upg.icon}</div>
                <div class="upg-name">${upg.name}</div>
                <div class="upg-desc">${upg.description}</div>
                <div class="upg-progress">
                    <div class="upg-pips">
                        ${Array.from({length: upg.maxLevel}, (_, i) =>
                            `<div class="pip ${i < level ? 'filled' : ''}"></div>`
                        ).join('')}
                    </div>
                    <span class="upg-level">Lv ${level}/${upg.maxLevel}</span>
                </div>
                <button class="upg-btn ${isMaxed ? 'btn-maxed' : canAfford ? 'btn-buy' : 'btn-locked'}"
                    data-id="${upg.id}" ${!canAfford ? 'disabled' : ''}>
                    ${isMaxed ? 'MAXED' : `💰 ${cost}`}
                </button>
            `;
            grid.appendChild(card);
        });

        // Attach buy handlers
        grid.querySelectorAll<HTMLButtonElement>('.upg-btn[data-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id!;
                const cost = this.getCost(id);
                if (this.saveManager.purchaseUpgrade(id, cost)) {
                    this.refresh();
                }
            });
        });
    }
}
