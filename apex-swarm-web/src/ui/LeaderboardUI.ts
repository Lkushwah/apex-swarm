import { firebaseManager, type LeaderboardEntry } from '../core/FirebaseManager';

export class LeaderboardUI {
    private container: HTMLElement;
    public onBack: (() => void) | null = null;
    
    private currentTab: 'survivalTime' | 'totalKills' = 'survivalTime';

    constructor() {
        this.container = document.getElementById('leaderboards-screen')!;
        this.renderBase();
    }

    public show() {
        this.container.classList.remove('hidden');
        this.fetchData();
    }

    public hide() {
        this.container.classList.add('hidden');
    }

    private async fetchData() {
        this.renderLoading();
        const entries = await firebaseManager.getLeaderboard(this.currentTab);
        this.renderData(entries);
    }

    private formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    private renderBase() {
        this.container.innerHTML = `
            <div class="lu-glow" style="background: radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%);"></div>
            <h2 class="lu-title" style="color: #38bdf8;">GLOBAL LEADERBOARDS</h2>
            
            <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 20px;">
                <button id="tab-time" class="btn ${this.currentTab === 'survivalTime' ? 'btn-primary' : 'btn-secondary'}">BEST TIME</button>
                <button id="tab-kills" class="btn ${this.currentTab === 'totalKills' ? 'btn-primary' : 'btn-secondary'}">MOST KILLS</button>
            </div>

            <div id="leaderboard-content" style="background: rgba(0,0,0,0.5); border-radius: 8px; width: 80%; max-width: 600px; height: 350px; overflow-y: auto; margin: 0 auto; padding: 10px;">
            </div>

            <div style="margin-top: 24px;">
                <button id="leaderboard-back-btn" class="btn btn-secondary">BACK</button>
            </div>
        `;

        document.getElementById('leaderboard-back-btn')!.addEventListener('click', () => {
            this.hide();
            if (this.onBack) this.onBack();
        });

        document.getElementById('tab-time')!.addEventListener('click', () => {
            if (this.currentTab !== 'survivalTime') {
                this.currentTab = 'survivalTime';
                this.fetchData();
            }
        });

        document.getElementById('tab-kills')!.addEventListener('click', () => {
            if (this.currentTab !== 'totalKills') {
                this.currentTab = 'totalKills';
                this.fetchData();
            }
        });
    }

    private renderLoading() {
        this.renderBase();
        const content = document.getElementById('leaderboard-content')!;
        content.innerHTML = `<div style="text-align: center; color: #94a3b8; margin-top: 150px;">Loading Data...</div>`;
    }

    private renderData(entries: LeaderboardEntry[]) {
        this.renderBase();
        const content = document.getElementById('leaderboard-content')!;
        
        if (entries.length === 0) {
            content.innerHTML = `<div style="text-align: center; color: #94a3b8; margin-top: 150px;">No scores recorded yet.</div>`;
            return;
        }

        let html = '';
        entries.forEach((entry, idx) => {
            const rankColor = idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#b45309' : '#64748b';
            const bg = idx % 2 === 0 ? '#1e293b' : 'transparent';
            
            const scoreText = this.currentTab === 'survivalTime' 
                ? this.formatTime(entry.survivalTime) 
                : `${entry.totalKills} KILLS`;

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: ${bg}; border-radius: 4px; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <span style="color: ${rankColor}; font-weight: bold; font-size: 20px; width: 40px;">#${idx + 1}</span>
                        <span style="color: #ffffff; font-size: 18px;">${entry.displayName}</span>
                    </div>
                    <div style="color: #38bdf8; font-weight: bold; font-size: 18px;">
                        ${scoreText}
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
    }
}
