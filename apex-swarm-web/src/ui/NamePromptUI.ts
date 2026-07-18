import { SaveManager } from '../core/SaveManager';
import { firebaseManager } from '../core/FirebaseManager';

export class NamePromptUI {
    private container: HTMLElement;
    private saveManager: SaveManager;
    public onNameSet: (() => void) | null = null;
    public onSkip: (() => void) | null = null;

    constructor(saveManager: SaveManager) {
        this.saveManager = saveManager;
        this.container = document.getElementById('name-prompt-screen')!;
        this.render();
    }

    public show() {
        this.container.classList.remove('hidden');
        const input = document.getElementById('pilot-name-input') as HTMLInputElement;
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }

    public hide() {
        this.container.classList.add('hidden');
    }

    private render() {
        this.container.innerHTML = `
            <div class="lu-glow" style="background: radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%);"></div>
            <h2 class="lu-title" style="color: #38bdf8;">REGISTER PILOT</h2>
            <p class="lu-subtitle" style="margin-bottom: 30px;">Enter a display name for the global leaderboards.</p>
            
            <input type="text" id="pilot-name-input" maxlength="16" placeholder="Enter Pilot Name" style="font-family: monospace; font-size: 24px; text-align: center; padding: 10px; background: #1e293b; color: #ffffff; border: 2px solid #38bdf8; border-radius: 8px; outline: none; margin-bottom: 20px;">
            
            <div style="display: flex; gap: 16px; justify-content: center;">
                <button id="pilot-name-submit" class="btn btn-primary" style="font-size: 24px;">CONFIRM</button>
                <button id="pilot-name-skip" class="btn btn-secondary" style="font-size: 24px;">PLAY ANONYMOUSLY</button>
            </div>
        `;

        document.getElementById('pilot-name-submit')!.addEventListener('click', () => {
            const input = document.getElementById('pilot-name-input') as HTMLInputElement;
            const name = input.value.trim();
            if (name.length > 0) {
                this.saveManager.setDisplayName(name);
                this.hide();
                // Sync immediately
                firebaseManager.syncData(name, this.saveManager.getRawData());
                if (this.onNameSet) this.onNameSet();
            }
        });

        document.getElementById('pilot-name-skip')!.addEventListener('click', () => {
            const result = window.confirm("You are about to play anonymously. Your high scores will not be submitted to the global leaderboards. Continue?");
            if (result) {
                this.hide();
                if (this.onSkip) this.onSkip();
            }
        });
    }
}
