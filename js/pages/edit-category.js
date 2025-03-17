class EditCategoryPage {
  constructor() {
    this.baseUrl = "https://virlo.vercel.app";
    this.token = localStorage.getItem("adminToken");
    this.categoryId = new URLSearchParams(window.location.search).get("id");
    this.amenities = [];
    if (!this.token) {
      window.location.href = "./login.html";
      return;
    }

    if (!this.categoryId) {
      window.location.href = "categories.html";
      return;
    }

    this.initializeElements();
    this.loadCategory();
    this.setupEventListeners();
  }

  initializeElements() {
    this.form = document.getElementById("editCategoryForm");
    this.categoryNameInput = document.getElementById("categoryName");
    this.iconOneInput = document.getElementById("iconOne");
    this.iconTwoInput = document.getElementById("iconTwo");
    this.iconOnePreview = document.getElementById("iconOnePreview");
    this.iconTwoPreview = document.getElementById("iconTwoPreview");
    this.amenityInput = document.getElementById("amenityInput");
    this.addAmenityBtn = document.getElementById("addAmenityBtn");
    this.amenityList = document.getElementById("amenityList");
  }

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // إضافة عنصر جديد إلى amenities
    if (this.addAmenityBtn) {
      this.addAmenityBtn.addEventListener("click", () => {
        const amenity = this.amenityInput.value.trim();
        if (amenity) {
          this.addAmenity(amenity);
          this.amenityInput.value = "";
        }
      });
    }

    // حذف عنصر من amenities
    if (this.amenityList) {
      this.amenityList.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".vr-btn--error");
        if (deleteBtn) {
          const index = parseInt(deleteBtn.dataset.index);
          this.amenities.splice(index, 1);
          this.renderAmenities();
        }
      });
    }
  }

  addAmenity(amenity) {
    this.amenities.push(amenity);
    this.renderAmenities();
  }

  async loadCategory() {
    try {
      const response = await fetch(`${this.baseUrl}/categories/${this.categoryId}`, {
        method: "GET",
        headers: {
          "token": this.token
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load category");
      }

      const category = await response.json();
      this.fillFormData(category);
    } catch (error) {
      console.error("Error loading category:", error);
      this.showToast("error", "Failed to load category data");
    }
  }

  fillFormData(category) {
    this.categoryNameInput.value = category.categoryName || "";

    // تحديث معاينة الأيقونات إذا كانت موجودة
    if (category.iconOne) {
      this.iconOnePreview.innerHTML = `<img src="${category.iconOne}" alt="Icon 1" style="max-width: 50px; max-height: 50px;">`;
    }
    if (category.iconTwo) {
      this.iconTwoPreview.innerHTML = `<img src="${category.iconTwo}" alt="Icon 2" style="max-width: 50px; max-height: 50px;">`;
    }

    // تعبئة amenities إذا كانت موجودة
    if (category.amenities && Array.isArray(category.amenities)) {
      this.amenities = category.amenities;
      this.renderAmenities();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const formData = {
        categoryName: this.categoryNameInput.value,
        iconOne: "",
        iconTwo: "",
        amenities: this.amenities
      };

      const response = await fetch(`${this.baseUrl}/categories/${this.categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "token": this.token
        },
        body: JSON.stringify(formData),
        redirect: "follow"
      });

      const responseData = await response.text();
      console.log("Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData || "Failed to update category");
      }

      this.showToast("success", "Category updated successfully");
      setTimeout(() => {
        window.location.href = "categories.html";
      }, 1500);
    } catch (error) {
      console.error("Error updating category:", error);
      this.showToast("error", error.message);
    }
  }

  renderAmenities() {
    if (!this.amenityList) return;
    
    this.amenityList.innerHTML = this.amenities
      .map((amenity, index) => `
        <li class="vr-amenity-item">
          <span>${amenity}</span>
          <button type="button" class="vr-btn vr-btn--icon vr-btn--error" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </li>
      `).join("");
  }

  showToast(type, message) {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `vr-toast vr-toast--${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// تهيئة الصفحة عند تحميل المستند
window.addEventListener("DOMContentLoaded", () => {
  window.editCategoryPage = new EditCategoryPage();
});
