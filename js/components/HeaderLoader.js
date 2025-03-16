class HeaderLoader {
    constructor() {
        this.init();
        this.setupLogout();
        this.loadUserInfo();
        this.checkAuth();
    }
    static async loadHeader() {
        try {
            console.log('Loading header...'); // رسالة تصحيح
            const response = await fetch("../components/header.html");
            if (!response.ok) {
                throw new Error('Failed to load header');
            }
            const html = await response.text();
            console.log('Header loaded successfully'); // رسالة تصحيح

            const headerPlaceholder = document.querySelector("header.vr-admin-header");
            if (headerPlaceholder) {
                console.log('Header placeholder found'); // رسالة تصحيح
                headerPlaceholder.outerHTML = html;
                this.initializeHeader();
            } else {
                console.error('Header placeholder not found'); // رسالة تصحيح
            }
        } catch (error) {
            console.error("Error loading header:", error);
            this.redirectToLogin();
        }
    }

    static initializeHeader() {
        const header = new Header();
        this.setupLogoutHandler();
    }

    static setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutModal = document.getElementById('logoutModal');
        const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
        const closeButtons = document.querySelectorAll('[data-dismiss="modal"]');

        if (logoutBtn && logoutModal) {
            logoutBtn.addEventListener('click', () => {
                logoutModal.style.display = 'flex';
            });

            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    logoutModal.style.display = 'none';
                });
            });

            confirmLogoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });

            window.addEventListener('click', (e) => {
                if (e.target === logoutModal) {
                    logoutModal.style.display = 'none';
                }
            });
        } else {
            console.error('Logout button or modal not found');
        }
    }

    static checkAuth() {
        const token = localStorage.getItem('token');
        return !!token;
    }

    static handleLogout() {
        try {
            localStorage.clear();
            if (window.toastService) {
                window.toastService.show('تم تسجيل الخروج بنجاح', 'success');
            }
            this.redirectToLogin();
        } catch (error) {
            console.error('Error during logout:', error);
            if (window.toastService) {
                window.toastService.show('حدث خطأ أثناء تسجيل الخروج', 'error');
            }
        }
    }

    // static redirectToLogin() {
    //     window.location.href = 'login.html';
    // }
}

document.addEventListener("DOMContentLoaded", () => {
    HeaderLoader.loadHeader();
});