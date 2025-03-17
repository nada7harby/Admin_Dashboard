class AddCategoryPage {
    constructor() {
        this.baseUrl = "https://virlo.vercel.app";
        this.token = localStorage.getItem("adminToken");
        this.amenities = [];

        if (!this.token) {
            window.location.href = "./pages/login.html";
            return;
        }

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.form = document.getElementById('addCategoryForm');
        this.categoryNameInput = document.getElementById('categoryName');
        this.iconOneInput = document.getElementById('iconOne');
        this.iconTwoInput = document.getElementById('iconTwo');
        this.iconOnePreview = document.getElementById('iconOnePreview');
        this.iconTwoPreview = document.getElementById('iconTwoPreview');
        this.amenityInput = document.getElementById('amenityInput');
        this.addAmenityBtn = document.getElementById('addAmenityBtn');
        this.amenityList = document.getElementById('amenityList');
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // إضافة عنصر جديد إلى amenities
        this.addAmenityBtn.addEventListener('click', () => {
            const amenity = this.amenityInput.value.trim();
            if (amenity) {
                this.addAmenity(amenity);
                this.amenityInput.value = '';
            }
        });

        // إضافة عنصر عند الضغط على Enter
        this.amenityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const amenity = this.amenityInput.value.trim();
                if (amenity) {
                    this.addAmenity(amenity);
                    this.amenityInput.value = '';
                }
            }
        });

        // حذف عنصر من amenities
        this.amenityList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.vr-btn--error');
            if (deleteBtn) {
                const index = parseInt(deleteBtn.dataset.index);
                this.amenities.splice(index, 1);
                this.renderAmenities();
            }
        });

        // معاينة الأيقونات
        this.iconOneInput.addEventListener('change', () => {
            this.updateIconPreview(this.iconOneInput, this.iconOnePreview);
        });

        this.iconTwoInput.addEventListener('change', () => {
            this.updateIconPreview(this.iconTwoInput, this.iconTwoPreview);
        });
    }

    addAmenity(amenity) {
        this.amenities.push(amenity);
        this.renderAmenities();
    }

    renderAmenities() {
        this.amenityList.innerHTML = this.amenities
            .map((amenity, index) => `
                <li class="vr-amenity-item">
                    <span>${amenity}</span>
                    <button type="button" class="vr-btn vr-btn--icon vr-btn--error" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `).join('');
    }

    updateIconPreview(input, previewElement) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Icon preview" style="max-width: 50px; max-height: 50px;">`;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            categoryName: this.categoryNameInput.value,
            iconOne: "",  // سنتركها فارغة كما في المثال
            iconTwo: "",  // سنتركها فارغة كما في المثال
            amenities: this.amenities
        };

        try {
            const response = await fetch(`${this.baseUrl}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': this.token
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to add category');
            }

            this.showToast('success', 'Category added successfully');
            setTimeout(() => {
                window.location.href = 'categories.html';
            }, 1500);
        } catch (error) {
            console.error('Error adding category:', error);
            this.showToast('error', 'Failed to add category');
        }
    }

    showToast(type, message) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `vr-toast vr-toast--${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// تهيئة الصفحة عند تحميل المستند
window.addEventListener('DOMContentLoaded', () => {
    window.addCategoryPage = new AddCategoryPage();
}); 