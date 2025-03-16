/**
 * Admin Authentication Service
 * Handles admin-specific authentication operations
 */
class AdminAuthService {
    constructor() {
        this.API_URL = 'https://virlo.vercel.app';
        this.TOKEN_KEY = 'vr_admin_token';
        this.USER_KEY = 'vr_admin_user';
        
        // Initialize auth state
        this.init();
    }

    init() {
        // Check if there's a stored token
        const token = this.getToken();
        if (token) {
            // Validate token
            this.validateToken(token);
        }
    }

    /**
     * Admin login
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise}
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store auth data
            this.setAuthData(data.token, data.user);

            return data;
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    }

    /**
     * Store authentication data
     * @param {string} token 
     * @param {Object} user 
     */
    setAuthData(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    /**
     * Clear authentication data
     */
    clearAuthData() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    /**
     * Get stored token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get stored admin user data
     * @returns {Object|null}
     */
    getUser() {
        try {
            const userData = localStorage.getItem(this.USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing admin user data:', error);
            return null;
        }
    }

    /**
     * Check if admin is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = this.getToken();
        return !!token;
    }

    /**
     * Validate stored token
     * @param {string} token 
     */
    async validateToken(token) {
        try {
            const response = await fetch(`${this.API_URL}/admin/validate-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.clearAuthData();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * Admin logout
     */
    logout() {
        this.clearAuthData();
        window.location.href = '/admin/login.html';
    }

    /**
     * Get auth headers for API requests
     * @returns {Object}
     */
    getAuthHeaders() {
        const token = this.getToken();
        return token ? {
            'Authorization': `Bearer ${token}`
        } : {};
    }

    /**
     * Check if current user has specific permission
     * @param {string} permission 
     * @returns {boolean}
     */
    hasPermission(permission) {
        const user = this.getUser();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    }

    /**
     * Update admin profile
     * @param {Object} profileData 
     * @returns {Promise}
     */
    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.API_URL}/admin/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update stored user data
            const currentUser = this.getUser();
            this.setAuthData(this.getToken(), { ...currentUser, ...data.user });

            return data;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }

    /**
     * Change admin password
     * @param {string} oldPassword 
     * @param {string} newPassword 
     * @returns {Promise}
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const response = await fetch(`${this.API_URL}/admin/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            return data;
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    }
}

// Create global instance
window.adminAuthService = new AdminAuthService(); 