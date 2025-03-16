// Authentication Guard Service

class AuthGuard {
    constructor() {
        this.authService = window.authService;
        this.toastService = window.toastService;
    }

    async checkAuth() {
        try {
            const isAuthenticated = await this.authService.isAuthenticated();
            if (!isAuthenticated) {
                this.toastService.error('Please login to access this page');
                // Store the current page URL to redirect back after login
                sessionStorage.setItem('redirectUrl', window.location.pathname);
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            this.toastService.error('Authentication check failed');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return false;
        }
    }

    async guardRoute() {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            return false;
        }
        return true;
    }
}

// Create global instance
window.authGuard = new AuthGuard(); 