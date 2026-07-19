import { TutorialUI } from '../ui/TutorialUI';

export type TutorialType = 'MOVEMENT_AND_DASH' | 'COLLECTING_XP' | 'LEVELING_UP' | 'CREDITS_AND_CORES' | 'APEX_METER' | 'WEAPON_EVOLUTION' | 'DRONES';

export class TutorialManager {
    private ui: TutorialUI;
    private seenTutorials: Set<string>;

    constructor(ui: TutorialUI) {
        this.ui = ui;
        this.seenTutorials = new Set();
        
        try {
            const saved = localStorage.getItem('apex_swarm_tutorials');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.seenTutorials = new Set(parsed);
                }
            }
        } catch {
            // ignore
        }
    }

    public hasSeen(type: TutorialType): boolean {
        return this.seenTutorials.has(type);
    }

    public showTutorial(type: TutorialType, onDismiss: () => void) {
        if (this.hasSeen(type)) {
            onDismiss();
            return;
        }

        this.seenTutorials.add(type);
        localStorage.setItem('apex_swarm_tutorials', JSON.stringify(Array.from(this.seenTutorials)));

        this.ui.onDismiss = onDismiss;

        switch (type) {
            case 'MOVEMENT_AND_DASH':
                this.ui.show(
                    'Welcome to Apex Swarm',
                    'Move your <span style="color:#38bdf8; font-weight:bold;">Pointer or Finger</span> to navigate.<br/><br/>Your weapons <span style="color:#f59e0b; font-weight:bold;">fire automatically</span>.<br/><br/>Double tap or press <span style="color:#fbbf24;">SHIFT</span> to Dash and evade enemies!'
                );
                break;
            case 'COLLECTING_XP':
                this.ui.show(
                    'Gather Power',
                    'Defeated enemies drop <span style="color:#4ade80; font-weight:bold;">XP Gems</span>.<br/><br/>Collect them to level up and gain new Weapons and Passives!'
                );
                break;
            case 'LEVELING_UP':
                this.ui.show(
                    'Level Up!',
                    'You have leveled up! Choose an upgrade from the draft.<br/><br/>Try to find <span style="color:#f59e0b; font-weight:bold;">combinations</span> of Weapons and Passives that synergize.'
                );
                break;
            case 'CREDITS_AND_CORES':
                this.ui.show(
                    'Meta Progression',
                    'You found a <span style="color:#fbbf24; font-weight:bold;">Credit</span>!<br/><br/>Credits are used between runs in the <span style="color:#f59e0b; font-weight:bold;">Power Upgrades</span> menu to boost your base stats permanently.'
                );
                break;
            case 'APEX_METER':
                this.ui.show(
                    'Apex Ready!',
                    'Your <span style="color:#ef4444; font-weight:bold;">APEX METER</span> is full!<br/><br/>Click the <span style="color:#ef4444; font-weight:bold;">APEX</span> button or press <span style="color:#fbbf24;">SPACEBAR</span> / <span style="color:#fbbf24;">DOUBLE TAP</span> to unleash your power.<br/><br/>While active, you are invincible, deal massive damage, and move faster!'
                );
                break;
            case 'WEAPON_EVOLUTION':
                this.ui.show(
                    'Weapon Evolution',
                    'You have maxed out a weapon while holding its required passive item!<br/><br/>Your weapon has <span style="color:#a855f7; font-weight:bold;">EVOLVED</span> into a far more powerful form.'
                );
                break;
            case 'DRONES':
                this.ui.show(
                    'Drones Deployed',
                    'You acquired a Drone!<br/><br/>Drones float around you and provide automatic supporting fire or utility. Upgrade them to increase their effectiveness.'
                );
                break;
        }
    }
}
