export class GameLoop {
    private lastTime: number = 0;
    private isRunning: boolean = false;
    private updateFn: (dt: number) => void;
    private renderFn: () => void;

    constructor(updateFn: (dt: number) => void, renderFn: () => void) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    public stop() {
        this.isRunning = false;
    }

    private loop(timestamp: number) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds, cap at 0.1s to prevent huge jumps
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.updateFn(dt);
        this.renderFn();

        requestAnimationFrame(this.loop.bind(this));
    }
}
