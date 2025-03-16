class ViewCategoryPage {
    constructor() {
        this.baseUrl = "https://virlo.vercel.app";
        this.token = localStorage.getItem("adminToken");
        this.categoryId = new URLSearchParams(window.location.search).get("id");

        // التحقق من وجود التوكن
        if (!this.token) {
            window.location.href = "/login";
            return;
        }

        // التحقق من وجود معرف الفئة
        if (!this.categoryId) {
            window.location.href = "categories.html";
            return;
        }

        this.initializeElements();
        this.loadCategoryDetails();
    }

    initializeElements() {
        this.detailsContainer = document.querySelector(".vr-category-details-container");
    }

    async loadCategoryDetails() {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${this.categoryId}`, {
                method: "GET",
                headers: {
                    token: this.token
                },
                redirect: "follow"
            });

            if (!response.ok) {
                throw new Error("Failed to fetch category details");
            }

            const category = await response.json();
            this.renderCategoryDetails(category);
        } catch (error) {
            console.error("Error fetching category details:", error);
            this.showError("Failed to load category details");
        }
    }

    renderCategoryDetails(category) {
        const amenitiesList = category.amenities && category.amenities.length > 0
            ? `<div class="vr-details-section">
                <h3>Amenities</h3>
                <ul class="vr-amenities-list">
                    ${category.amenities.map(amenity => `
                        <li class="vr-amenity-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${amenity}</span>
                        </li>
                    `).join("")}
                </ul>
               </div>`
            : '';

        const iconsSection = `
            <div class="vr-details-section">
                <h3>Icons</h3>
                <div class="vr-icons-grid">
                    ${category.iconOne ? `
                        <div class="vr-icon-card">
                            <h4>Icon 1</h4>
                            <div class="vr-icon-preview">
                                <img src="${category.iconOne}" alt="Icon 1" onerror="this.src='../assets/images/placeholder.png'">
                            </div>
                        </div>
                    ` : ''}
                    ${category.iconTwo ? `
                        <div class="vr-icon-card">
                            <h4>Icon 2</h4>
                            <div class="vr-icon-preview">
                                <img src="${category.iconTwo}" alt="Icon 2" onerror="this.src='../assets/images/placeholder.png'">
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.detailsContainer.innerHTML = `
            <div class="vr-card">
                <div class="vr-details-header">
                    <h2>${category.categoryName || "Untitled Category"}</h2>
                    <div class="vr-details-actions">
                        <button class="vr-btn vr-btn--primary" onclick="window.location.href='edit-category.html?id=${category._id}'">
                            <i class="fas fa-edit"></i> Edit Category
                        </button>
                    </div>
                </div>
                ${iconsSection}
                ${amenitiesList}
                <div class="vr-details-section">
                    <h3>Additional Information</h3>
                    <div class="vr-details-grid">
                        <div class="vr-details-item">
                            <span class="vr-details-label">Category ID:</span>
                            <span class="vr-details-value">${category._id}</span>
                        </div>
                       
                        <div class="vr-details-item">
                            <span class="vr-details-label">Last Updated:</span>
                            <span class="vr-details-value">${new Date(category.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.detailsContainer.innerHTML = `
            <div class="vr-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button class="vr-btn vr-btn--primary" onclick="window.location.reload()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// تهيئة الصفحة عند تحميل المستند
window.addEventListener("DOMContentLoaded", () => {
    window.viewCategoryPage = new ViewCategoryPage();
}); 