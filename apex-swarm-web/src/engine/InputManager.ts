export class InputManager {
    private pointerPosition: { x: number, y: number } = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    private isPointerDown: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        window.addEventListener('pointermove', (e) => {
            this.pointerPosition.x = e.clientX;
            this.pointerPosition.y = e.clientY;
        });

        canvas.addEventListener('pointerdown', () => {
            this.isPointerDown = true;
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

    public update() {
        // Any per-frame input processing can go here
    }
}
