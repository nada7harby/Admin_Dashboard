/**
 * Toast Notification Component
 */
class Toast {
    constructor() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'vr-toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `vr-toast vr-toast--${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="vr-toast__icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="vr-toast__content">
                <div class="vr-toast__message">${message}</div>
            </div>
            <button class="vr-toast__close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Setup close button
        const closeBtn = toast.querySelector('.vr-toast__close');
        closeBtn.addEventListener('click', () => this.close(toast));

        // Auto close
        setTimeout(() => this.close(toast), duration);

        return toast;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    close(toast) {
        toast.classList.add('vr-toast--hiding');
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getIcon(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-exclamation-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            default:
                return 'fa-info-circle';
        }
    }
}

// Create global instance
window.toastService = new Toast(); 