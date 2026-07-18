export class InputManager {
    private pointerPosition: { x: number, y: number } = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    private isPointerDown: boolean = false;
    private lastPointerDownTime: number = 0;
    private doubleTapCallbacks: (() => void)[] = [];

    constructor(canvas: HTMLCanvasElement) {
        window.addEventListener('pointermove', (e) => {
            this.pointerPosition.x = e.clientX;
            this.pointerPosition.y = e.clientY;
        });

        canvas.addEventListener('pointerdown', () => {
            this.isPointerDown = true;
            const now = performance.now();
            if (now - this.lastPointerDownTime < 300) {
                this.doubleTapCallbacks.forEach(cb => cb());
            }
            this.lastPointerDownTime = now;
        });

        window.addEventListener('pointerup', () => {
            this.isPointerDown = false;
        });
    }

    public getPointerPosition() {
        return this.pointerPosition;
    }

    public isDown() {
        return this.isPointerDown;
    }

    public onDoubleTap(callback: () => void) {
        this.doubleTapCallbacks.push(callback);
    }

    public update() {
        // Any per-frame input processing can go here
    }
}
