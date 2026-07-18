export type LogEventType = 
    | 'GAME_START' 
    | 'WEAPON_ACQUIRED' 
    | 'PASSIVE_ACQUIRED' 
    | 'LEVEL_UP' 
    | 'APEX_TRIGGERED' 
    | 'HEAVY_DAMAGE_TAKEN' 
    | 'GAME_OVER';

export interface GameEvent {
    type: LogEventType;
    details: any;
    survivalTime: number;
}

export interface PlayerStatLog {
    survivalTime: number;
    x: number;
    y: number;
    hp: number;
    level: number;
    kills: number;
}

export class AnalyticsLogger {
    public events: GameEvent[] = [];
    public statsTimeline: PlayerStatLog[] = [];
    private lastStatLogTime: number = 0;
    
    // Config
    private readonly STAT_LOG_INTERVAL = 5.0; // Log stats every 5 seconds of survival time

    public logEvent(type: LogEventType, details: any, survivalTime: number) {
        this.events.push({
            type,
            details,
            survivalTime
        });
    }

    public updateStats(survivalTime: number, x: number, y: number, hp: number, level: number, kills: number, force: boolean = false) {
        if (force || survivalTime - this.lastStatLogTime >= this.STAT_LOG_INTERVAL) {
            this.statsTimeline.push({
                survivalTime,
                x: Math.round(x),
                y: Math.round(y),
                hp: Math.round(hp),
                level,
                kills
            });
            this.lastStatLogTime = survivalTime;
        }
    }

    public getRunLog() {
        return {
            events: this.events,
            statsTimeline: this.statsTimeline
        };
    }
}
