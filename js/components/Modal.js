/**
 * Modal Component
 */
class Modal {
    constructor(id) {
        this.modal = document.getElementById(id);
        this.isOpen = false;
        
        if (!this.modal) {
            throw new Error(`Modal with id "${id}" not found`);
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close button
        const closeButtons = this.modal.querySelectorAll('.vr-modal__close, [data-dismiss="modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.hide());
        });

        // Click outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    }

    show() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Trigger show event
        const event = new CustomEvent('modal:show', { detail: { modal: this } });
        this.modal.dispatchEvent(event);
    }

    hide() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        this.isOpen = false;
        
        // Trigger hide event
        const event = new CustomEvent('modal:hide', { detail: { modal: this } });
        this.modal.dispatchEvent(event);
    }

    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    setTitle(title) {
        const titleElement = this.modal.querySelector('.vr-modal__title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    setContent(content) {
        const contentElement = this.modal.querySelector('.vr-modal__content');
        if (contentElement) {
            if (typeof content === 'string') {
                contentElement.innerHTML = content;
            } else {
                contentElement.innerHTML = '';
                contentElement.appendChild(content);
            }
        }
    }

    setLoading(loading) {
        const submitBtn = this.modal.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (loading) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            } else {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }
    }

    onShow(callback) {
        this.modal.addEventListener('modal:show', callback);
    }

    onHide(callback) {
        this.modal.addEventListener('modal:hide', callback);
    }
}

// Export for use in other files
window.Modal = Modal; 