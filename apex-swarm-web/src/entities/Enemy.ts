import { Player } from './Player';

export class Enemy {
    public x: number;
    public y: number;
    public radius: number;
    public hp: number;
    public maxHp: number;
    public damage: number;
    public speed: number;
    public color: string = '#ef4444'; // Red 500
    public isDead: boolean = false;

    constructor(x: number, y: number, timeScale: number) {
        this.x = x;
        this.y = y;
        this.radius = 12 + Math.random() * 6;
        this.speed = (50 + Math.random() * 40) * (timeScale * 0.8);
        this.maxHp = 30 * timeScale;
        this.hp = this.maxHp;
        this.damage = 10;
    }

    public update(dt: number, player: Player, canTakeDamage: boolean = true) {
        if (this.isDead) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }

        if (dist < this.radius + player.radius && canTakeDamage) {
            player.takeDamage(this.damage);
            this.isDead = true;
        }
    }


    public draw(ctx: CanvasRenderingContext2D) {
        if (this.isDead) return;
        
        ctx.beginPath();
        ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
