import { firebaseManager } from '../core/FirebaseManager';

export class FeedbackUI {
    private container: HTMLElement;

    constructor() {
        this.container = document.getElementById('feedback-screen')!;
    }

    public show() {
        this.render();
        this.container.classList.remove('hidden');
    }

    public hide() {
        this.container.classList.add('hidden');
    }

    private render() {
        let selectedRating = 0;
        
        this.container.innerHTML = `
          <div class="menu-bg-glow" style="background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(0,0,0,0) 70%);"></div>
          <h2 style="color: #f59e0b; text-align: center; font-size: 32px; margin-bottom: 8px; text-shadow: 0 0 10px rgba(245,158,11,0.5);">GIVE FEEDBACK</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px; text-align: center; max-width: 400px; line-height: 1.5; margin-left: auto; margin-right: auto;">We want to hear from you! Let us know what you think about the game, any bugs you found, or features you want to see.</p>
          
          <div style="width: 90%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; position: relative; margin-left: auto; margin-right: auto;">
            <!-- Rating Select -->
            <div style="text-align: center;">
              <label style="color: #e2e8f0; font-size: 14px; display: block; margin-bottom: 8px; font-weight: bold; letter-spacing: 0.05em;">HOW WOULD YOU RATE THE GAME?</label>
              <div id="feedback-rating-stars" style="display: flex; gap: 12px; justify-content: center; font-size: 32px; cursor: pointer; user-select: none;">
                <span data-star="1" style="color: #4b5563; transition: color 0.2s;">★</span>
                <span data-star="2" style="color: #4b5563; transition: color 0.2s;">★</span>
                <span data-star="3" style="color: #4b5563; transition: color 0.2s;">★</span>
                <span data-star="4" style="color: #4b5563; transition: color 0.2s;">★</span>
                <span data-star="5" style="color: #4b5563; transition: color 0.2s;">★</span>
              </div>
            </div>

            <!-- Feedback Text -->
            <div>
              <label style="color: #e2e8f0; font-size: 14px; display: block; margin-bottom: 8px; font-weight: bold; letter-spacing: 0.05em;">YOUR FEEDBACK</label>
              <textarea id="feedback-text" placeholder="Type your thoughts, bugs, or feature requests here..." style="width: 100%; height: 120px; background: rgba(15,23,42,0.8); border: 2px solid #334155; border-radius: 8px; color: #fff; padding: 12px; font-family: inherit; font-size: 14px; outline: none; resize: none; transition: border-color 0.2s; box-sizing: border-box;"></textarea>
            </div>

            <!-- Optional Contact Info -->
            <div>
              <label style="color: #e2e8f0; font-size: 14px; display: block; margin-bottom: 8px; font-weight: bold; letter-spacing: 0.05em;">CONTACT INFO (OPTIONAL)</label>
              <input type="text" id="feedback-contact" placeholder="Email, Discord, or Twitter" style="width: 100%; background: rgba(15,23,42,0.8); border: 2px solid #334155; border-radius: 8px; color: #fff; padding: 12px; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box;" />
            </div>

            <!-- Submit / Back Buttons -->
            <button id="feedback-submit-btn" class="btn btn-primary" style="background: #f59e0b; color: #000; border-color: #f59e0b; font-weight: bold; margin-top: 8px;">SUBMIT FEEDBACK</button>
            <button id="feedback-back-btn" class="btn btn-secondary">BACK</button>
            
            <p id="feedback-status" style="font-size: 14px; margin: 0; text-align: center; display: none; line-height: 1.4;"></p>
          </div>
        `;

        // Star click listeners
        const stars = this.container.querySelectorAll('#feedback-rating-stars span');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt((e.target as HTMLElement).getAttribute('data-star') || '0');
                selectedRating = val;
                this.updateStars(stars, val);
            });
            star.addEventListener('mouseover', (e) => {
                const val = parseInt((e.target as HTMLElement).getAttribute('data-star') || '0');
                this.updateStars(stars, val);
            });
            star.addEventListener('mouseout', () => {
                this.updateStars(stars, selectedRating);
            });
        });

        // Submit listener
        const submitBtn = this.container.querySelector('#feedback-submit-btn') as HTMLButtonElement;
        const backBtn = this.container.querySelector('#feedback-back-btn') as HTMLButtonElement;
        const textInput = this.container.querySelector('#feedback-text') as HTMLTextAreaElement;
        const contactInput = this.container.querySelector('#feedback-contact') as HTMLInputElement;
        const statusText = this.container.querySelector('#feedback-status') as HTMLElement;

        submitBtn.addEventListener('click', async () => {
            const text = textInput.value.trim();
            const contact = contactInput.value.trim();

            if (!text) {
                statusText.style.display = 'block';
                statusText.style.color = '#ef4444';
                statusText.innerText = 'Please write some feedback before submitting!';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerText = 'SUBMITTING...';

            const success = await firebaseManager.saveFeedback(text, selectedRating, contact);
            
            submitBtn.disabled = false;
            submitBtn.innerText = 'SUBMIT FEEDBACK';

            if (success) {
                statusText.style.display = 'block';
                statusText.style.color = '#4ade80';
                statusText.innerText = 'Thank you! Your feedback has been submitted successfully.';
                textInput.value = '';
                contactInput.value = '';
                selectedRating = 0;
                this.updateStars(stars, 0);
                setTimeout(() => {
                    this.hide();
                    document.getElementById('main-menu')?.classList.remove('hidden');
                }, 2000);
            } else {
                statusText.style.display = 'block';
                statusText.style.color = '#ef4444';
                statusText.innerText = 'Failed to submit feedback. Please try again.';
            }
        });

        backBtn.addEventListener('click', () => {
            this.hide();
            document.getElementById('main-menu')?.classList.remove('hidden');
        });
    }

    private updateStars(stars: NodeListOf<Element>, rating: number) {
        stars.forEach(s => {
            const val = parseInt(s.getAttribute('data-star') || '0');
            if (val <= rating) {
                (s as HTMLElement).style.color = '#f59e0b';
            } else {
                (s as HTMLElement).style.color = '#4b5563';
            }
        });
    }
}
