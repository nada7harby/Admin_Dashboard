class DashboardPage {
  constructor() {
    this.baseUrl = "https://virlo.vercel.app";
    this.init();
    this.token = localStorage.getItem("adminToken");
  }

  init() {
    this.loadStats();
    this.loadStatActive();
    this.loadLatestListings();
    this.loadAdminUsers();
    this.setupEventListeners();
  }

  getToken() {
    return localStorage.getItem("adminToken");
  }

  setupEventListeners() {
    // Add event listeners for view all buttons if needed
    const viewAllButtons = document.querySelectorAll(".vr-btn--outline");
    viewAllButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const section = e.target.closest(".vr-admin-section");
        if (section.querySelector(".vr-table")) {
          if (section.querySelector("h2").textContent.includes("Listings")) {
            window.location.href = "listings.html";
          } else if (
            section.querySelector("h2").textContent.includes("Admin")
          ) {
            window.location.href = "users.html";
          }
        }
      });
    });
  }

  async loadStats() {
    try {
        // جلب عدد الأدمن
        const myHeaders = new Headers();
        myHeaders.append("token", this.getToken());
        console.log(this.getToken);
        

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const response = await fetch("https://virlo.vercel.app/admin/all", requestOptions);
        const data = await response.json();

        // عرض عدد الأدمن في الكارد
        const totalUsersElement = document.getElementById('totalUsers');
        if (data.data && Array.isArray(data.data)) {
            totalUsersElement.textContent = data.data.length; // عدد الأدمن
        } else {
            totalUsersElement.textContent = '0'; // إذا لم تكن البيانات متاحة
        }
     
    } catch (error) {
        console.error('Error loading admin stats:', error);
        const totalUsersElement = document.getElementById('totalUsers');
        totalUsersElement.textContent = '0'; // في حالة حدوث خطأ
    }
}


async loadStatActive() {
    try {
        // جلب عدد الأدمن
        const myHeaders = new Headers();
        myHeaders.append("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyIiwicGVybWlzc2lvbnMiOlsic3VwZXIiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJpYXQiOjE3MjY4NjE4MTZ9.K1czZfEBBtmLgHv9d-nOhQEVpSGZhD1lxRGfL1M72SA");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        // جلب جميع الـ Listings
        const response = await fetch("https://virlo.vercel.app/listing/?lastValue=16", requestOptions);
        const data = await response.json();

        // تصفية الـ Listings النشطة (isActive: true)
        const activeListings = data.listings.filter(listing => listing.isActive === true);

        // عرض عدد الـ Active Listings في الكارد
        const activeListingsElement = document.getElementById('activeListings');
        if (activeListings && Array.isArray(activeListings)) {
            activeListingsElement.textContent = activeListings.length; // عدد الـ Active Listings
        } else {
            activeListingsElement.textContent = '0'; // إذا لم تكن البيانات متاحة
        }
    } catch (error) {
        console.error('Error loading active listings stats:', error);
        const activeListingsElement = document.getElementById('activeListings');
        activeListingsElement.textContent = '0'; // في حالة حدوث خطأ
    }
}
  async loadLatestListings() {
    try {
      const response = await fetch(
        "https://virlo.vercel.app/listing/?lastValue=16"
      );
      const data = await response.json();

      // الحصول على آخر 4 listings
      const latestListings = data.listings.slice(0, 4);

      console.log(latestListings);

      const tableBody = document.getElementById("latestListingsTable");

      if (!latestListings || latestListings.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="5" class="vr-table__empty">No listings found</td></tr>';
        return;
      }

      // عرض البيانات في الجدول
      tableBody.innerHTML = latestListings
        .map(
          (listing) => `
                <tr>
                    <td>${listing.listingName || "N/A"}</td>
                    <td>${
                      listing.categoryId?.categoryName || "Uncategorized"
                    }</td>
                    <td> <span class="vr-badge ${
                      listing.isActive
                        ? "vr-badge--primary"
                        : "vr-badge--warning"
                    }">
                            ${listing.isPosted ? "Posted" : "InPosted"}
                        </span></td>
                    <td>
                        <span class="vr-badge ${
                          listing.isActive
                            ? "vr-badge--success"
                            : "vr-badge--warning"
                        }">
                            ${listing.isActive ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td>
                        <button class="vr-btn vr-btn--icon" onclick="window.location.href='listings.html?id=${
                          listing._id
                        }'">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `
        )
        .join("");
    } catch (error) {
      console.error("Error loading listings:", error);
      const tableBody = document.getElementById("latestListingsTable");
      tableBody.innerHTML =
        '<tr><td colspan="5" class="vr-table__empty">Error loading listings</td></tr>';
    }
  }
  showAdminModal(admin) {
    // Fill modal with admin data
    document.getElementById("modalUsername").textContent = admin.username;
    document.getElementById("modalRole").textContent = admin.isSuperAdmin
      ? "Super Admin"
      : "Admin";
    document.getElementById("modalPermissions").textContent =
      admin.permissions.join(", ") || "No permissions";
    document.getElementById("modalCreatedAt").textContent = new Date(
      admin.createdAt
    ).toLocaleDateString();

    // Show the modal using Bootstrap
    const adminModal = new bootstrap.Modal(
      document.getElementById("adminModal")
    );
    adminModal.show();
  }
  async loadAdminUsers() {
    console.log(this.getToken());

    try {
      const myHeaders = new Headers();
      myHeaders.append("token", this.getToken());

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      const response = await fetch(
        "https://virlo.vercel.app/admin/all",
        requestOptions
      );
      const data = await response.json();

      const tableBody = document.getElementById("adminUsersTable");

      if (!data.data || data.data.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="5" class="vr-table__empty">No admin users found</td></tr>';
        return;
      }

      tableBody.innerHTML = data.data
        .map(
          (admin) => `
                <tr>
                    <td>${admin.username}</td>
                    <td>
                        <span class="vr-badge ${
                          admin.isSuperAdmin
                            ? "vr-badge--success"
                            : "vr-badge--warning"
                        }">
                            ${admin.isSuperAdmin ? "Super Admin" : "Admin"}
                        </span>
                    </td>
                    <td>
                        <div class="vr-permissions">
                            ${
                              admin.permissions.length
                                ? admin.permissions
                                    .map(
                                      (perm) =>
                                        `<span class="vr-badge vr-badge--info">${perm}</span>`
                                    )
                                    .join("")
                                : '<span class="vr-badge vr-badge--warning">No permissions</span>'
                            }
                        </div>
                    </td>
                    <td>${new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="vr-flex vr-gap-sm">
                            <button class="vr-btn vr-btn--icon" onclick="window.dashboardPage.showAdminModal(${JSON.stringify(
                              admin
                            ).replace(/"/g, "&quot;")})">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${
                              !admin.isSuperAdmin
                                ? `
                            <button class="vr-btn vr-btn--icon vr-btn--danger" onclick="window.dashboardPage.deleteAdmin('${admin._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            `
                                : ""
                            }
                        </div>
                    </td>
                </tr>
            `
        )
        .join("");
    } catch (error) {
      console.error("Error loading admin users:", error);
      const tableBody = document.getElementById("adminUsersTable");
      tableBody.innerHTML =
        '<tr><td colspan="5" class="vr-table__empty">Error loading admin users</td></tr>';

      if (window.toastService) {
        window.toastService.show("Error loading admin users", "error");
      }
    }
  }

  async deleteAdmin(adminId) {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/admin/delete/${adminId}`, {
        method: "DELETE",
        headers: {
          token: `${this.getToken()}`,
        },
      });

      if (response.ok) {
        if (window.toastService) {
          window.toastService.show("Admin deleted successfully", "success");
        }
        this.loadAdminUsers(); // Reload the admin users list
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      if (window.toastService) {
        window.toastService.show(error.message, "error");
      }
    }
  }
}

// Initialize the dashboard when the page loads
window.addEventListener("DOMContentLoaded", () => {
  window.dashboardPage = new DashboardPage();
});
