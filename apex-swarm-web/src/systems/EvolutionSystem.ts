import { Player } from '../entities/Player';
import { WEAPONS } from '../data/weapons';

export class EvolutionSystem {
    public static checkEvolutions(player: Player): boolean {
        let evolvedSomething = false;

        for (const w of player.weapons) {
            if (w.evolved) continue;
            
            if (w.level >= 8) {
                // Find matching weapon data
                const wData = WEAPONS.find(x => x.id === w.id);
                if (wData) {
                    const reqPassiveId = wData.passivePartner;
                    const p = player.passives.find(x => x.id === reqPassiveId);
                    if (p && p.level >= 5) {
                        // Evolve it!
                        w.evolved = true;
                        evolvedSomething = true;
                        
                        // We could trigger a screen flash or SFX here.
                        // For now we just return true so main.ts can handle UI effects.
                    }
                }
            }
        }
        
        return evolvedSomething;
    }
}
