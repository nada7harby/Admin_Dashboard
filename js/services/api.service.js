/**
 * Admin API Service
 * Handles all admin-specific API requests
 */
class ApiService {
    constructor() {
        this.baseUrl = 'https://virlo.vercel.app';
        this.token = localStorage.getItem('adminToken');
    }

    /**
     * Get auth headers for requests
     * @returns {Object}
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Make API request
     * @param {string} endpoint 
     * @param {Object} options 
     * @returns {Promise}
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: this.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'حدث خطأ في الطلب');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Login
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise}
     */
    async login(username, password) {
        const response = await fetch(`${this.baseUrl}/admin/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'فشل تسجيل الدخول');
        }

        this.token = data.token;
        localStorage.setItem('adminToken', data.token);
        return data;
    }

    /**
     * Create admin
     * @param {Object} adminData 
     * @returns {Promise}
     */
    async createAdmin(adminData) {
        return this.request('/admin/create', {
            method: 'POST',
            body: JSON.stringify(adminData)
        });
    }

    /**
     * Get all admins
     * @param {number} page 
     * @param {number} limit 
     * @returns {Promise}
     */
    async getAllAdmins(page = 1, limit = 10) {
        return this.request(`/admin/all?page=${page}&limit=${limit}`);
    }

    /**
     * Update admin
     * @param {string} adminId 
     * @param {Object} updateData 
     * @returns {Promise}
     */
    async updateAdmin(adminId, updateData) {
        return this.request(`/admin/update/${adminId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    /**
     * Delete admin
     * @param {string} adminId 
     * @returns {Promise}
     */
    async deleteAdmin(adminId) {
        return this.request(`/admin/delete/${adminId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Create category
     * @param {Object} categoryData 
     * @returns {Promise}
     */
    async createCategory(categoryData) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    /**
     * Get all categories
     * @param {number} page 
     * @param {number} limit 
     * @returns {Promise}
     */
    async getAllCategories(page = 1, limit = 10) {
        return this.request(`/categories?page=${page}&limit=${limit}`);
    }

    /**
     * Get category by ID
     * @param {string} categoryId 
     * @returns {Promise}
     */
    async getCategoryById(categoryId) {
        return this.request(`/categories/${categoryId}`);
    }

    /**
     * Update category
     * @param {string} categoryId 
     * @param {Object} updateData 
     * @returns {Promise}
     */
    async updateCategory(categoryId, updateData) {
        return this.request(`/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    /**
     * Delete category
     * @param {string} categoryId 
     * @returns {Promise}
     */
    async deleteCategory(categoryId) {
        return this.request(`/categories/${categoryId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get all users
     * @param {number} page 
     * @param {number} limit 
     * @returns {Promise}
     */
    async getAllUsers(page = 1, limit = 10) {
        return this.request(`/users?page=${page}&limit=${limit}`);
    }

    /**
     * Get user by ID
     * @param {string} userId 
     * @returns {Promise}
     */
    async getUserById(userId) {
        return this.request(`/users/${userId}`);
    }

    /**
     * Update user
     * @param {string} userId 
     * @param {Object} updateData 
     * @returns {Promise}
     */
    async updateUser(userId, updateData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    /**
     * Delete user
     * @param {string} userId 
     * @returns {Promise}
     */
    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get all listings
     * @param {number} page 
     * @param {number} limit 
     * @returns {Promise}
     */
    async getAllListings(page = 1, limit = 10) {
        return this.request(`/listings?page=${page}&limit=${limit}`);
    }

    /**
     * Get listing by ID
     * @param {string} listingId 
     * @returns {Promise}
     */
    async getListingById(listingId) {
        return this.request(`/listings/${listingId}`);
    }

    /**
     * Update listing
     * @param {string} listingId 
     * @param {Object} updateData 
     * @returns {Promise}
     */
    async updateListing(listingId, updateData) {
        return this.request(`/listings/${listingId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    /**
     * Delete listing
     * @param {string} listingId 
     * @returns {Promise}
     */
    async deleteListing(listingId) {
        return this.request(`/listings/${listingId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get dashboard stats
     * @returns {Promise}
     */
    async getDashboardStats() {
        return this.request('/admin/stats');
    }

    /**
     * Handle error
     * @param {Error} error 
     * @returns {Object}
     */
    handleError(error) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error.message || 'حدث خطأ غير متوقع'
        };
    }
}

// Create and export a singleton instance
window.apiService = new ApiService(); 