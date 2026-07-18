import { Player } from './Player';

export class Collectible {
    public x: number;
    public y: number;
    public radius: number = 6;
    public color: string;
    public xpValue: number;
    public isCollected: boolean = false;
    private magnetSpeed: number = 0;
    public type: 'xp' | 'credit';

    constructor(x: number, y: number, type: 'xp' | 'credit' = 'xp') {
        this.x = x;
        this.y = y;
        this.type = type;
        if (type === 'xp') {
            this.color = '#4ade80'; // Green 400
            this.xpValue = 35;
        } else {
            this.color = '#fbbf24'; // Amber 400
            this.xpValue = 0;
        }
    }

    public update(dt: number, player: Player, magnetRadius: number = 100): boolean {
        if (this.isCollected) return false;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        
        if (dist < magnetRadius) {
            this.magnetSpeed += 500 * dt;
            this.x += ((player.x - this.x) / dist) * this.magnetSpeed * dt;
            this.y += ((player.y - this.y) / dist) * this.magnetSpeed * dt;
        }

        if (dist < player.radius + this.radius) {
            this.isCollected = true;
            return true;
        }

        return false;
    }

    public draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(time * 2); 
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius, 0);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius, 0);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}
