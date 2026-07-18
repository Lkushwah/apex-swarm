// -----------------------------------------------------------------
// SaveManager – handles localStorage persistence of credits + upgrades
// -----------------------------------------------------------------

export interface SaveData {
    credits: number;
    upgrades: Record<string, number>;
    cores: number;
    unlockedCosmetics: string[];
    equippedCosmetic: string | null;
    dailyStreak: number;
    lastLoginDate: string | null;
}

const SAVE_KEY = 'apex_swarm_save';

const DEFAULT_SAVE: SaveData = {
    credits: 0,
    upgrades: {},
    cores: 0,
    unlockedCosmetics: ['default'],
    equippedCosmetic: 'default',
    dailyStreak: 0,
    lastLoginDate: null
};

export class SaveManager {
    private data: SaveData;

    constructor() {
        this.data = this.load();
    }

    private load(): SaveData {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return { ...DEFAULT_SAVE, ...parsed, upgrades: parsed.upgrades || {} };
            }
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

    // --- Phase 4 Additions ---
    
    public getCores(): number {
        return this.data.cores ?? 0;
    }

    public addCores(amount: number) {
        this.data.cores = (this.data.cores ?? 0) + Math.floor(amount);
        this.save();
    }

    public hasCosmetic(id: string): boolean {
        return this.data.unlockedCosmetics?.includes(id) ?? false;
    }

    public unlockCosmetic(id: string) {
        if (!this.data.unlockedCosmetics) this.data.unlockedCosmetics = ['default'];
        if (!this.data.unlockedCosmetics.includes(id)) {
            this.data.unlockedCosmetics.push(id);
            this.save();
        }
    }

    public equipCosmetic(id: string) {
        if (this.hasCosmetic(id)) {
            this.data.equippedCosmetic = id;
            this.save();
        }
    }

    public getEquippedCosmetic(): string | null {
        return this.data.equippedCosmetic ?? 'default';
    }

    public processDailyLogin(): { isNewDay: boolean, streak: number } {
        const today = new Date().toDateString();
        let isNewDay = false;

        if (this.data.lastLoginDate !== today) {
            isNewDay = true;
            if (this.data.lastLoginDate) {
                const last = new Date(this.data.lastLoginDate);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - last.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    this.data.dailyStreak = (this.data.dailyStreak ?? 0) + 1;
                } else if (diffDays > 1) {
                    this.data.dailyStreak = 1; // reset streak
                }
            } else {
                this.data.dailyStreak = 1;
            }
            this.data.lastLoginDate = today;
            this.save();
        }

        return { isNewDay, streak: this.data.dailyStreak ?? 1 };
    }
}
