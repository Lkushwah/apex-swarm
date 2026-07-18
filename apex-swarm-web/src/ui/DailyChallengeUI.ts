import { SaveManager } from '../core/SaveManager';

export class DailyChallengeUI {
    private container: HTMLElement;
    private saveManager: SaveManager;
    private onStart: (seed: number, modifiers: string[]) => void;
    private onClose: () => void;

    private currentSeed: number;
    private modifiers: string[] = [];

    constructor(saveManager: SaveManager, onStart: (seed: number, modifiers: string[]) => void, onClose: () => void) {
        this.saveManager = saveManager;
        this.onStart = onStart;
        this.onClose = onClose;
        this.container = document.getElementById('daily-challenge-screen')!;
        
        // Generate daily seed based on Date string
        const todayStr = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < todayStr.length; i++) {
            hash = Math.imul(31, hash) + todayStr.charCodeAt(i) | 0;
        }
        this.currentSeed = hash >>> 0; // unsigned

        // Generate daily modifiers from seed
        this.generateModifiers(this.currentSeed);

        this.render();
    }

    private generateModifiers(seed: number) {
        // Mulberry32 inline just for UI generation
        let s = seed;
        const rand = () => {
            s += 0x6D2B79F5;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };

        const possibleMods = [
            'Enemy HP +50%',
            'Player Speed -20%',
            'No Health Drops',
            'Double Enemy Spawn Rate',
            'Start with 0 Upgrades',
            'Double Damage Taken'
        ];

        this.modifiers = [];
        const numMods = 2 + Math.floor(rand() * 2); // 2 or 3 modifiers
        const pool = [...possibleMods];
        for (let i = 0; i < numMods; i++) {
            const idx = Math.floor(rand() * pool.length);
            this.modifiers.push(pool.splice(idx, 1)[0]);
        }
    }

    public show() {
        this.container.classList.remove('hidden');
        this.render();
    }

    private render() {
        const { streak } = this.saveManager.processDailyLogin();

        this.container.innerHTML = `
            <div class="lu-glow" style="background: radial-gradient(circle, rgba(240,171,252,0.3) 0%, transparent 70%);"></div>
            <h2 class="lu-title" style="color: #f0abfc;">DAILY CHALLENGE</h2>
            <p class="lu-subtitle">Global Seed: #${this.currentSeed}</p>
            <p style="color: #fbbf24; font-weight: bold; margin-bottom: 20px;">🔥 Current Streak: ${streak} Days 🔥</p>
            
            <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px; border: 1px solid #475569; max-width: 400px; margin: 0 auto 30px auto;">
                <h3 style="color: #ef4444; margin-bottom: 15px; font-size: 1.2rem; font-family: 'Rajdhani', sans-serif;">ACTIVE MODIFIERS</h3>
                <ul style="list-style: none; padding: 0; margin: 0; color: #cbd5e1; text-align: left;">
                    ${this.modifiers.map(m => `<li style="margin-bottom: 8px;">⚠️ ${m}</li>`).join('')}
                </ul>
            </div>

            <div style="display: flex; gap: 16px; justify-content: center;">
                <button id="daily-start-btn" class="btn btn-primary" style="background: #f0abfc; color: #000; border-color: #f0abfc;">START CHALLENGE</button>
                <button id="daily-close-btn" class="btn btn-secondary">BACK</button>
            </div>
        `;

        document.getElementById('daily-close-btn')!.addEventListener('click', () => {
            this.container.classList.add('hidden');
            this.onClose();
        });

        document.getElementById('daily-start-btn')!.addEventListener('click', () => {
            this.container.classList.add('hidden');
            this.onStart(this.currentSeed, this.modifiers);
        });
    }
}
