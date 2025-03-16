/**
 * Storage Service
 * Handles local storage operations with encryption for sensitive data
 */
class StorageService {
    constructor() {
        this.prefix = 'vr_admin_';
    }

    /**
     * Set item in storage
     * @param {string} key 
     * @param {any} value 
     * @param {boolean} encrypt 
     */
    set(key, value, encrypt = false) {
        const storageKey = this.prefix + key;
        const storageValue = encrypt ? this.encrypt(JSON.stringify(value)) : JSON.stringify(value);
        localStorage.setItem(storageKey, storageValue);
    }

    /**
     * Get item from storage
     * @param {string} key 
     * @param {boolean} decrypt 
     * @returns {any}
     */
    get(key, decrypt = false) {
        const storageKey = this.prefix + key;
        const value = localStorage.getItem(storageKey);
        
        if (!value) return null;

        try {
            return JSON.parse(decrypt ? this.decrypt(value) : value);
        } catch (error) {
            console.error('Error parsing storage value:', error);
            return null;
        }
    }

    /**
     * Remove item from storage
     * @param {string} key 
     */
    remove(key) {
        const storageKey = this.prefix + key;
        localStorage.removeItem(storageKey);
    }

    /**
     * Clear all storage items with prefix
     */
    clear() {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        }
    }

    /**
     * Simple encryption
     * @param {string} text 
     * @returns {string}
     */
    encrypt(text) {
        return btoa(text);
    }

    /**
     * Simple decryption
     * @param {string} encoded 
     * @returns {string}
     */
    decrypt(encoded) {
        return atob(encoded);
    }
}

// Create global instance
window.storageService = new StorageService(); 