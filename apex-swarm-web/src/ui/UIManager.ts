// -------------------------------------------------------
// UIManager – central DOM overlay controller
// -------------------------------------------------------

export class UIManager {
    // Screens
    private mainMenu = document.getElementById('main-menu')!;
    private levelUpScreen = document.getElementById('levelup-screen')!;
    private gameOverScreen = document.getElementById('gameover-screen')!;
    private hud = document.getElementById('hud')!;
    private apexBanner = document.getElementById('apex-banner')!;

    // HUD elements
    private hpFill = document.getElementById('hp-fill')!;
    private xpFill = document.getElementById('xp-fill')!;
    private levelText = document.getElementById('level-text')!;
    private timeText = document.getElementById('time-text')!;
    private hudCredits = document.getElementById('hud-credits')!;

    // Game Over elements
    private survivalTimeText = document.getElementById('survival-time')!;
    private creditsEarnedText = document.getElementById('credits-earned')!;
    private hudCores = document.getElementById('hud-cores');

    // Apex elements
    private apexTimerBar = document.getElementById('apex-timer-bar')!;
    private apexMeterFill = document.getElementById('apex-meter-fill')!;
    private apexTriggerBtn = document.getElementById('apex-trigger-btn')!;

    // Boss elements
    private bossUI = document.getElementById('boss-ui')!;
    private bossName = document.getElementById('boss-name')!;
    private bossHpFill = document.getElementById('boss-hp-fill')!;
    private bossWarning = document.getElementById('boss-warning')!;

    public showMainMenu() {
        this.hideAll();
        this.mainMenu.classList.remove('hidden');
    }

    public showHUD() {
        this.hideAll();
        this.hud.classList.remove('hidden');
    }

    public showGameOver(time: number, kills: number, level: number, weapons: any[], passives: any[], credits: number, cores: number) {
        this.hideAll();
        this.gameOverScreen.classList.remove('hidden');
        this.survivalTimeText.innerText = `Survived: ${this.formatTime(time)}`;
        this.creditsEarnedText.innerText = `+${credits} Credits | +${cores} Cores`;
        
        const statsDiv = document.getElementById('run-stats');
        if (statsDiv) {
            let html = `<div style="margin-bottom: 8px;"><strong>Level Reached:</strong> ${level}</div>`;
            html += `<div style="margin-bottom: 8px;"><strong>Kills:</strong> ${kills}</div>`;
            
            html += `<div style="margin-bottom: 4px; color: #fbbf24;"><strong>Weapons</strong></div>`;
            if (weapons && weapons.length > 0) {
                html += `<ul style="margin: 0 0 8px 0; padding-left: 20px;">`;
                for (const w of weapons) {
                    html += `<li>${w.id.replace('_', ' ').toUpperCase()} (Lv.${w.level}) ${w.evolved ? '⭐' : ''}</li>`;
                }
                html += `</ul>`;
            } else {
                html += `<div style="margin-bottom: 8px; color: #94a3b8;">None</div>`;
            }
            
            html += `<div style="margin-bottom: 4px; color: #38bdf8;"><strong>Passives</strong></div>`;
            if (passives && passives.length > 0) {
                html += `<ul style="margin: 0; padding-left: 20px;">`;
                for (const p of passives) {
                    html += `<li>${p.id.replace('_', ' ').toUpperCase()} (Lv.${p.level})</li>`;
                }
                html += `</ul>`;
            } else {
                html += `<div style="color: #94a3b8;">None</div>`;
            }
            
            statsDiv.innerHTML = html;
        }
    }

    public showApexBanner(timePercent: number) {
        this.apexBanner.classList.remove('hidden');
        this.apexTimerBar.style.width = `${Math.max(0, timePercent * 100)}%`;
    }

    public hideApexBanner() {
        this.apexBanner.classList.add('hidden');
    }

    public showBossWarning() {
        this.bossWarning.classList.remove('hidden');
        setTimeout(() => {
            this.bossWarning.classList.add('hidden');
        }, 3000);
    }

    public updateBossHP(name: string, hp: number, maxHp: number) {
        this.bossUI.classList.remove('hidden');
        this.bossName.innerText = name.toUpperCase();
        this.bossHpFill.style.width = `${Math.max(0, (hp / maxHp) * 100)}%`;
    }

    public hideBossUI() {
        this.bossUI.classList.add('hidden');
        this.bossWarning.classList.add('hidden');
    }

    private apexMeterTrack = document.querySelector('.apex-meter-track') as HTMLElement;

    public updateHUD(hp: number, maxHp: number, xp: number, xpToNext: number, level: number, time: number, credits: number, apexMeter: number, cores: number) {
        this.hpFill.style.width = `${Math.max(0, (hp / maxHp) * 100)}%`;
        this.xpFill.style.width = `${Math.min(100, (xp / xpToNext) * 100)}%`;
        this.levelText.innerText = `LVL ${level}`;
        this.timeText.innerText = this.formatTime(time);
        this.hudCredits.innerText = String(credits);
        if (this.hudCores) this.hudCores.innerText = String(cores);

        this.apexMeterFill.style.width = `${Math.min(100, apexMeter)}%`;
        if (apexMeter >= 100) {
            this.apexTriggerBtn.classList.remove('hidden');
            this.apexTriggerBtn.innerText = "APEX READY";
            this.apexMeterTrack.style.boxShadow = '0 0 15px #ef4444';
            this.apexMeterTrack.style.borderColor = '#ef4444';
        } else {
            this.apexTriggerBtn.classList.add('hidden');
            this.apexMeterTrack.style.boxShadow = 'none';
            this.apexMeterTrack.style.borderColor = '#f59e0b';
        }
    }


    private hideAll() {
        this.mainMenu.classList.add('hidden');
        this.levelUpScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.apexBanner.classList.add('hidden');
        this.bossUI.classList.add('hidden');
        this.bossWarning.classList.add('hidden');
        // NOTE: powerUpgradesScreen is managed separately
    }

    public formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
