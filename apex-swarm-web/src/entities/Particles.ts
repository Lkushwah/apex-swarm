// -------------------------------------------------------
// Particles & Floating Text — visual feedback system
// -------------------------------------------------------

export class Particle {
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public life: number;
    public maxLife: number;
    public color: string;
    public size: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 120;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 0.25 + Math.random() * 0.35;
        this.maxLife = this.life;
        this.color = color;
        this.size = 2 + Math.random() * 3;
    }

    public update(dt: number): boolean {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        this.size = Math.max(0, this.size - dt * 5);
        return this.life > 0;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

export class FloatingText {
    public x: number;
    public y: number;
    public text: string;
    public color: string;
    public life: number;
    public maxLife: number;
    public vy: number;

    constructor(x: number, y: number, text: string, color: string = '#ffffff', life: number = 0.6) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.vy = -35;
    }

    public update(dt: number): boolean {
        this.y += this.vy * dt;
        this.life -= dt;
        return this.life > 0;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.text.includes('CRIT') ? '16' : '13'}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

export class ApexShard {
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public life: number;
    public maxLife: number;
    public size: number;
    private hue: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 80;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 40; // bias upward
        this.life = 0.4 + Math.random() * 0.5;
        this.maxLife = this.life;
        this.size = 1.5 + Math.random() * 2.5;
        this.hue = Math.random() < 0.5 ? 30 : 0; // gold or red
    }

    public update(dt: number): boolean {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 60 * dt; // slight gravity
        this.life -= dt;
        return this.life > 0;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const sat = 90 + Math.floor(alpha * 10);
        const light = 50 + Math.floor((1 - alpha) * 30);
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsl(${this.hue}, ${sat}%, ${light}%)`;
        ctx.fillStyle = `hsl(${this.hue}, ${sat}%, ${light}%)`;
        
        // Diamond shape
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Date.now() / 100 + this.hue);
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.6, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

// Helper to batch-create particles
export function createParticles(arr: Particle[], x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
        arr.push(new Particle(x, y, color));
    }
}

export function createApexShards(arr: ApexShard[], x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
        arr.push(new ApexShard(x, y));
    }
}
