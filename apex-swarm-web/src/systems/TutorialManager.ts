import { TutorialUI } from '../ui/TutorialUI';

export type TutorialType = 'APEX_METER' | 'WEAPON_EVOLUTION' | 'DRONES';

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
