import { SaveManager } from '../core/SaveManager';

export const ACHIEVEMENTS_LIST = [
    { id: 'survive_1m', title: 'Novice Survivor', description: 'Survive for 1 minute.', icon: '⏱️' },
    { id: 'survive_5m', title: 'Veteran Survivor', description: 'Survive for 5 minutes.', icon: '⏳' },
    { id: 'survive_10m', title: 'Apex Survivor', description: 'Survive for 10 minutes.', icon: '🏆' },
    { id: 'level_10', title: 'Power Surge', description: 'Reach Level 10.', icon: '⚡' },
    { id: 'level_25', title: 'Unstoppable', description: 'Reach Level 25.', icon: '🔥' },
    { id: 'kill_500', title: 'Swarm Bane', description: 'Defeat 500 enemies in one run.', icon: '⚔️' },
    { id: 'kill_2000', title: 'Exterminator', description: 'Defeat 2000 enemies in one run.', icon: '💀' }
];

export class AchievementsUI {
    private container: HTMLElement;
    private saveManager: SaveManager;

    constructor(saveManager: SaveManager) {
        this.saveManager = saveManager;
        this.container = document.getElementById('achievements-screen')!;
    }

    public show() {
        this.render();
        this.container.classList.remove('hidden');
    }

    public hide() {
        this.container.classList.add('hidden');
    }

    private render() {
        const stats = this.saveManager.getStats();

        let html = `
            <div class="menu-bg-glow"></div>
            <h2 style="color: #4ade80; text-align: center; margin-bottom: 20px; font-size: 32px; text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);">ACHIEVEMENTS</h2>
            
            <div style="background: rgba(0,0,0,0.6); padding: 15px; border-radius: 8px; border: 1px solid #4ade80; margin-bottom: 20px; text-align: center;">
                <h3 style="color: #fff; margin-bottom: 10px;">Personal Best</h3>
                <div style="display: flex; justify-content: space-around; color: #a1a1aa;">
                    <div><span style="color: #fff; font-size: 20px;">${Math.floor(stats.maxSurvivalTime / 60)}:${Math.floor(stats.maxSurvivalTime % 60).toString().padStart(2, '0')}</span><br>Max Time</div>
                    <div><span style="color: #fff; font-size: 20px;">${stats.maxLevel}</span><br>Max Level</div>
                    <div><span style="color: #fff; font-size: 20px;">${stats.maxKills}</span><br>Max Kills</div>
                </div>
            </div>

            <div style="max-height: 50vh; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; padding-right: 10px;">
        `;

        ACHIEVEMENTS_LIST.forEach(ach => {
            const isUnlocked = this.saveManager.hasAchievement(ach.id);
            const bgColor = isUnlocked ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)';
            const borderColor = isUnlocked ? '#4ade80' : '#52525b';
            const opacity = isUnlocked ? '1' : '0.5';

            html += `
                <div style="background: ${bgColor}; border: 1px solid ${borderColor}; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 15px; opacity: ${opacity};">
                    <div style="font-size: 32px;">${ach.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: ${isUnlocked ? '#4ade80' : '#a1a1aa'}; font-size: 18px;">${ach.title}</div>
                        <div style="color: #a1a1aa; font-size: 14px;">${ach.description}</div>
                    </div>
                    ${isUnlocked ? '<div style="color: #4ade80; font-weight: bold;">UNLOCKED</div>' : '<div style="color: #52525b;">LOCKED</div>'}
                </div>
            `;
        });

        html += `
            </div>
            <div style="text-align: center;">
                <button id="close-achievements-btn" class="btn btn-primary" style="background: #4ade80; border-color: #4ade80; color: #000;">CLOSE</button>
            </div>
        `;

        this.container.innerHTML = html;

        document.getElementById('close-achievements-btn')?.addEventListener('click', () => {
            this.hide();
        });
    }
}
