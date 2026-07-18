// -----------------------------------------------------------------
// SaveManager – handles localStorage persistence of credits + upgrades
// -----------------------------------------------------------------

export interface SaveData {
    credits: number;
    upgrades: Record<string, number>;
}

const SAVE_KEY = 'apex_swarm_save';

const DEFAULT_SAVE: SaveData = {
    credits: 0,
    upgrades: {}
};

export class SaveManager {
    private data: SaveData;

    constructor() {
        this.data = this.load();
    }

    private load(): SaveData {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) return JSON.parse(raw) as SaveData;
        } catch {
            // ignore
        }
        return { ...DEFAULT_SAVE, upgrades: {} };
    }

    private save() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    }

    public getCredits(): number {
        return this.data.credits;
    }

    public addCredits(amount: number) {
        this.data.credits += Math.floor(amount);
        this.save();
    }

    public getUpgradeLevel(id: string): number {
        return this.data.upgrades[id] ?? 0;
    }

    public purchaseUpgrade(id: string, cost: number): boolean {
        if (this.data.credits < cost) return false;
        this.data.credits -= cost;
        this.data.upgrades[id] = (this.data.upgrades[id] ?? 0) + 1;
        this.save();
        return true;
    }
}
