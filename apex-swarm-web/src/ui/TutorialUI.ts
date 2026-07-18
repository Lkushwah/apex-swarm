export class TutorialUI {
    private container: HTMLElement;
    private titleEl: HTMLElement;
    private messageEl: HTMLElement;
    private imgEl: HTMLImageElement;
    public onDismiss: (() => void) | null = null;

    constructor() {
        this.container = document.getElementById('tutorial-screen')!;
        
        this.container.innerHTML = `
            <div class="lu-glow" style="background: radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%);"></div>
            <h2 id="tutorial-title" class="lu-title" style="color: #fbbf24; font-size: 36px; margin-bottom: 20px;">TUTORIAL</h2>
            
            <div style="background: rgba(0,0,0,0.8); border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; max-width: 500px; text-align: center; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
                <img id="tutorial-img" src="" style="max-width: 100%; max-height: 200px; margin-bottom: 20px; display: none; border-radius: 4px;" />
                <p id="tutorial-message" style="color: #ffffff; font-size: 20px; line-height: 1.5; font-family: monospace; margin-bottom: 30px;">
                    Tutorial Message here.
                </p>
                <button id="tutorial-btn" class="btn btn-primary" style="font-size: 24px; border-color: #fbbf24; color: #fbbf24;">GOT IT!</button>
            </div>
        `;

        this.titleEl = document.getElementById('tutorial-title')!;
        this.messageEl = document.getElementById('tutorial-message')!;
        this.imgEl = document.getElementById('tutorial-img') as HTMLImageElement;

        document.getElementById('tutorial-btn')!.addEventListener('click', () => {
            this.hide();
            if (this.onDismiss) this.onDismiss();
        });
    }

    public show(title: string, message: string, imageSrc?: string) {
        this.titleEl.innerText = title.toUpperCase();
        this.messageEl.innerHTML = message;
        
        if (imageSrc) {
            this.imgEl.src = imageSrc;
            this.imgEl.style.display = 'block';
        } else {
            this.imgEl.style.display = 'none';
        }

        this.container.classList.remove('hidden');
    }

    public hide() {
        this.container.classList.add('hidden');
    }
}
