class AdminLogin {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.submitButton = document.getElementById('loginButton');
        this.rememberMe = document.getElementById('rememberMe');
        
        this.init();
    }

    init() {
        if (window.adminAuthService?.isAuthenticated()) {
            window.location.href = '/admin';
            return;
        }

        // Initialize components
        this.initializeComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Restore saved username if exists
        this.restoreSavedusername();
    }

    initializeComponents() {
        // Initialize password toggle
        const toggleButtons = document.querySelectorAll('.vr-password-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Clear errors on input
        this.usernameInput.addEventListener('input', () => this.clearError(this.usernameInput));
        this.passwordInput.addEventListener('input', () => this.clearError(this.passwordInput));
    }

    clearError(input) {
        input.classList.remove('error');
        const errorElement = document.getElementById(`${input.id}Error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    showError(input, message) {
        input.classList.add('error');
        const errorElement = document.getElementById(`${input.id}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validate username
        if (!this.usernameInput.value) {
            this.showError(this.usernameInput, 'username is required');
            isValid = false;
        } else if (!this.isValidusername(this.usernameInput.value)) {
            this.showError(this.usernameInput, 'Please enter a valid username address');
            isValid = false;
        }

        // Validate password
        if (!this.passwordInput.value) {
            this.showError(this.passwordInput, 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    isValidusername(username) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    }

    setLoading(loading) {
        if (loading) {
            this.submitButton.classList.add('loading');
            this.submitButton.disabled = true;
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.disabled = false;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        try {
            this.setLoading(true);

            const response = await window.adminAuthService.login(
                this.usernameInput.value,
                this.passwordInput.value
            );

            // Save username if remember me is checked
            if (this.rememberMe.checked) {
                localStorage.setItem('vr_admin_username', this.usernameInput.value);
            } else {
                localStorage.removeItem('vr_admin_username');
            }

            // Show success message
            window.toastService?.success('Login successful');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            window.toastService?.error(error.message || 'Login failed');
        } finally {
            this.setLoading(false);
        }
    }

    restoreSavedusername() {
        const savedusername = localStorage.getItem('vr_admin_username');
        if (savedusername) {
            this.usernameInput.value = savedusername;
            this.rememberMe.checked = true;
        }
    }
}

// Initialize login page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminLogin = new AdminLogin();
}); 