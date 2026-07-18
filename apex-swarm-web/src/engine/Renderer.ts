export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cw: number = 0;
    private ch: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Failed to get 2D context");
        this.ctx = context;
        this.resize();
    }

    public resize() {
        this.cw = window.innerWidth;
        this.ch = window.innerHeight;
        this.canvas.width = this.cw;
        this.canvas.height = this.ch;
    }

    public clear() {
        this.ctx.fillStyle = '#0f172a'; // Slate 900
        this.ctx.fillRect(0, 0, this.cw, this.ch);
    }

    public drawGrid(offset: {x: number, y: number} = {x: 0, y: 0}) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        const gridSize = 40;
        
        const offsetX = -(offset.x % gridSize);
        const offsetY = -(offset.y % gridSize);

        this.ctx.beginPath();
        for (let x = offsetX; x < this.cw; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.ch);
        }
        for (let y = offsetY; y < this.ch; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.cw, y);
        }
        this.ctx.stroke();
    }

    public getContext() {
        return this.ctx;
    }

    public getDimensions() {
        return { width: this.cw, height: this.ch };
    }

    public drawApexGlow() {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
        const gradient = this.ctx.createRadialGradient(
            this.cw / 2, this.ch / 2, Math.min(this.cw, this.ch) * 0.3,
            this.cw / 2, this.ch / 2, Math.max(this.cw, this.ch) * 0.8
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `rgba(239,68,68,${0.15 + pulse * 0.1})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.cw, this.ch);
    }
}
