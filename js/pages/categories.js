class CategoriesPage {
  constructor() {
      this.baseUrl = "https://virlo.vercel.app";
      this.token = localStorage.getItem("adminToken");
      this.initializeElements();
      this.loadCategories();
      this.setupEventListeners();

      // تحقق من وجود token
      if (!this.token) {
          alert("You are not authorized. Redirecting to login...");
          window.location.href = "./login.html"; // إعادة توجيه إلى صفحة تسجيل الدخول
      }
  }

  initializeElements() {
    this.categoriesGrid = document.getElementById("categoriesGrid");
    this.addCategoryBtn = document.getElementById("addCategoryBtn");
    this.addCategoryModal = document.getElementById("addCategoryModal");
    this.modalCloseBtn = this.addCategoryModal?.querySelector(".vr-modal__close");
    this.addCategoryForm = document.getElementById("addCategoryForm");

    // إضافة عناصر المودال الجديد
    this.editCategoryModal = document.getElementById("editCategoryModal");
    this.editCategoryForm = document.getElementById("editCategoryForm");

    // إضافة modal عرض التفاصيل
    this.viewCategoryModal = document.getElementById("viewCategoryModal");
    this.viewCategoryContent = document.getElementById("viewCategoryContent");
    this.viewModalCloseBtn = this.viewCategoryModal?.querySelector(".vr-modal__close");

    // تحقق من وجود العناصر
    if (!this.categoriesGrid || !this.addCategoryBtn || !this.addCategoryModal || !this.modalCloseBtn || !this.addCategoryForm || !this.editCategoryModal || !this.editCategoryForm || !this.viewCategoryModal) {
        console.error("One or more elements are missing in the DOM.");
    }
}

  async loadCategories() {
      try {
          this.categoriesGrid.innerHTML = '<div class="vr-loading">Loading categories...</div>';
          const response = await fetch(`${this.baseUrl}/categories`, {
              headers: {
                  token: `${this.token}`,
              },
          });

          if (!response.ok) {
              throw new Error("Failed to fetch categories");
          }

          const data = await response.json();
          this.renderCategories(data);
      } catch (error) {
          console.error("Error loading categories:", error);
          this.categoriesGrid.innerHTML = '<div class="vr-error">Error loading categories</div>';
      }
  }
  renderCategories(categories) {
    this.categories = categories; // تخزين الفئات في متغير

    if (!categories || categories.length === 0) {
        this.categoriesGrid.innerHTML = '<div class="vr-empty">No categories found</div>';
        return;
    }

    this.categoriesGrid.innerHTML = `
        <table class="vr-table vr-categories-table">
            <thead>
                <tr>
                    <th>Category Name</th>
                    <th>Icon 1</th>
                    <th>View</th>
                    <th>Delete</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                ${categories
                    .map(
                        (category) => `
                        <tr data-id="${category._id}">
                            <td>${category.categoryName || "Untitled"}</td>
                            <td>${
                                category.iconOne
                                    ? `<img src="${category.iconOne}" alt="Icon 1" onerror="this.style.display='none'">`
                                    : ""
                            }</td>
                            <td>
                                <button class="vr-btn vr-btn--icon vr-btn--info" data-action="view" data-id="${category._id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                            <td>
                                <button class="vr-btn vr-btn--icon vr-btn--error" data-action="delete" data-id="${category._id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                            <td>
                                <button class="vr-btn vr-btn--icon vr-btn--edit" data-action="edit" data-id="${category._id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `
                    )
                    .join("")}
            </tbody>
        </table>
    `;
}
setupEventListeners() {
    // حدث النقر على زر "Add Category"
    if (this.addCategoryBtn) {
        this.addCategoryBtn.addEventListener("click", () => {
            this.openAddCategoryModal();
        });
    }

    // حدث النقر على زر إغلاق المودال
    if (this.modalCloseBtn) {
        this.modalCloseBtn.addEventListener("click", () => {
            this.closeAddCategoryModal();
        });
    }

    // حدث إرسال النموذج
    if (this.addCategoryForm) {
        this.addCategoryForm.addEventListener("submit", (event) => {
            event.preventDefault();
            this.saveCategory();
        });
    }

    // حدث النقر على الأزرار داخل الجدول (حذف أو تعديل)
    this.categoriesGrid.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (button) {
            const action = button.getAttribute("data-action"); // الحصول على الإجراء (edit أو delete)
            const categoryId = button.getAttribute("data-id"); // الحصول على id الفئة

            if (action === "delete") {
                this.deleteCategory(categoryId); // استدعاء دالة الحذف مع id الفئة
            } else if (action === "edit") {
                this.currentEditCategoryId = categoryId; // تخزين الـ ID
                this.editCategory(categoryId); // استدعاء دالة التعديل مع id الفئة
            } else if (action === "view") {
                this.viewCategory(categoryId);
            }
        }
    });

    // حدث إرسال نموذج التعديل
    if (this.editCategoryForm) {
        this.editCategoryForm.addEventListener("submit", (event) => {
            event.preventDefault();
            this.updateCategory(this.currentEditCategoryId);
        });
    }

    // إضافة مستمع أحداث لزر إغلاق modal العرض
    if (this.viewModalCloseBtn) {
        this.viewModalCloseBtn.addEventListener("click", () => {
            this.closeViewModal();
        });
    }
}
  openAddCategoryModal() {
      if (this.addCategoryModal) {
          this.addCategoryModal.style.display = "flex";
          console.log("jjj");
          
      }
  }

  closeAddCategoryModal() {
      if (this.addCategoryModal) {
          this.addCategoryModal.style.display = "none";
      }
  }

  async saveCategory() {
      const categoryName = document.getElementById("categoryName").value;
      const iconOne = document.getElementById("iconOne").value;
      const iconTwo = document.getElementById("iconTwo").value;

      try {
          const response = await fetch(`${this.baseUrl}/categories`, {
              method: "POST",
              headers: {
                  token: `${this.token}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  categoryName,
                  iconOne,
                  iconTwo,
              }),
          });

          if (!response.ok) {
              throw new Error("Failed to save category");
          }

          this.closeAddCategoryModal();
          this.loadCategories(); // إعادة تحميل الفئات بعد الإضافة
      } catch (error) {
          console.error("Error saving category:", error);
          alert(`Error saving category: ${error.message}`);
      }
  }

  async deleteCategory(categoryId) {
      try {
          // تحقق من وجود token
          if (!this.token) {
              throw new Error("No token found");
          }

          // تحقق من صلاحية token
          const payload = JSON.parse(atob(this.token.split(".")[1])); // فك تشفير الـ token يدويًا
          const currentTime = Date.now() / 1000; // الوقت الحالي بالثواني
          if (payload.exp < currentTime) {
              throw new Error("Token expired");
          }

          const response = await fetch(`${this.baseUrl}/categories/${categoryId}`, {
              method: "DELETE",
              headers: {
                  token: `${this.token}`,
                  "Content-Type": "application/json",
              },
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "Failed to delete category");
          }

          this.loadCategories();
      } catch (error) {
          console.error("Error deleting category:", error);
          alert(`Error deleting category: ${error.message}`);

          // إذا كان الخطأ بسبب 401 أو انتهاء صلاحية الـ token، قم بإعادة توجيه المستخدم إلى صفحة تسجيل الدخول
          if (error.message.includes("401") || error.message.includes("Token expired")) {
              window.location.href = "./login.html";
          }
      }
  }

  openEditCategoryModal(category) {
    if (this.editCategoryModal) {
        // تعبئة البيانات الحالية في النموذج
        document.getElementById("editCategoryName").value = category.categoryName || "";
        document.getElementById("editIconOne").value = category.iconOne || "";
        document.getElementById("editIconTwo").value = category.iconTwo || "";

        // فتح المودال
        this.editCategoryModal.style.display = "flex";
    }
}

closeEditCategoryModal() {
    if (this.editCategoryModal) {
        this.editCategoryModal.style.display = "none";
    }
}
async updateCategory(categoryId) {
    const categoryName = document.getElementById("editCategoryName").value;
    const iconOne = document.getElementById("editIconOne").value;
    const iconTwo = document.getElementById("editIconTwo").value;

    try {
        const response = await fetch(`${this.baseUrl}/categories/${categoryId}`, {
            method: "PUT",
            headers: {
                token: `${this.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                categoryName,
                iconOne,
                iconTwo,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update category");
        }

        this.closeEditCategoryModal();
        this.loadCategories(); // إعادة تحميل الفئات بعد التحديث
    } catch (error) {
        console.error("Error updating category:", error);
        alert(`Error updating category: ${error.message}`);
    }
}
editCategory(categoryId) {
    window.location.href = `edit-category.html?id=${categoryId}`;
}

viewCategory(categoryId) {
    console.log("kkk");
    
    window.location.href = `view-category.html?id=${categoryId}`;
}

// async viewCategory(categoryId) {
//     try {
//         const response = await fetch(`${this.baseUrl}/categories/${categoryId}`, {
//             method: "GET",
//             headers: {
//                 token: this.token
//             },
//             redirect: "follow"
//         });

//         if (!response.ok) {
//             throw new Error("Failed to fetch category details");
//         }

//         const category = await response.json();
//         this.showCategoryDetails(category);
//     } catch (error) {
//         console.error("Error fetching category details:", error);
//         alert("Error fetching category details");
//     }
// }

showCategoryDetails(category) {
    if (this.viewCategoryContent && this.viewCategoryModal) {
        const amenitiesList = category.amenities && category.amenities.length > 0
            ? `<ul class="vr-amenities-list">
                ${category.amenities.map(amenity => `<li>${amenity}</li>`).join("")}
               </ul>`
            : '<p>No amenities available</p>';

        this.viewCategoryContent.innerHTML = `
            <div class="vr-category-details">
                <h2>${category.categoryName || "Untitled"}</h2>
                <div class="vr-category-icons">
                    ${category.iconOne ? `
                        <div class="vr-icon-preview">
                            <h3>Icon 1</h3>
                            <img src="${category.iconOne}" alt="Icon 1" onerror="this.style.display='none'">
                        </div>
                    ` : ''}
                    ${category.iconTwo ? `
                        <div class="vr-icon-preview">
                            <h3>Icon 2</h3>
                            <img src="${category.iconTwo}" alt="Icon 2" onerror="this.style.display='none'">
                        </div>
                    ` : ''}
                </div>
                <div class="vr-amenities-section">
                    <h3>Amenities</h3>
                    ${amenitiesList}
                </div>
            </div>
        `;

        this.viewCategoryModal.style.display = "flex";
    }
}

// closeViewModal() {
//     if (this.viewCategoryModal) {
//         this.viewCategoryModal.style.display = "none";
//     }
// }
}

// إنشاء مثيل من الصفحة عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
  window.categoriesPage = new CategoriesPage();
});