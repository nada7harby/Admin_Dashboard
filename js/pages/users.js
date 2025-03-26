// Users Page Script

// Initialize components
const userModal = new Modal('userModal');
const toast = window.toastService;
// const authGuard = window.authGuard;

// DOM Elements
const addUserBtn = document.getElementById('addUserBtn');
const userForm = document.getElementById('userForm');
const usersTableBody = document.getElementById('usersTableBody');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');

// State
let currentPage = 1;
let totalPages = 1;
let editingUserId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // if (!await authGuard.guardRoute()) return;
    
    loadUsers();
    setupEventListeners();
});

function setupEventListeners() {
    // Add User Button
    addUserBtn.addEventListener('click', async () => {
        // if (!await authGuard.guardRoute()) return;

        editingUserId = null;
        userForm.reset();
        userModal.setTitle('Add New User');
        userModal.show();
});

    // Form Submit
    userForm.addEventListener('submit', handleUserSubmit);

    // Pagination
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
}

// User Management
async function handleUserSubmit(e) {
    e.preventDefault();
    
    // if (!await authGuard.guardRoute()) return;
    
    try {
        const submitBtn = userForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');

        const formData = new FormData(userForm);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
            status: formData.get('status'),
            password: formData.get('password')
        };

        if (editingUserId) {
            await apiService.put(`/users/${editingUserId}`, userData);
            toast.success('User updated successfully');
        } else {
            await apiService.post('/users', userData);
            toast.success('User created successfully');
        }

        userModal.hide();
        loadUsers();
    } catch (error) {
        console.error('Error submitting user:', error);
        toast.error('Failed to save user');
    } finally {
        submitBtn.classList.remove('loading');
    }
}

async function editUser(userId) {
    // if (!await authGuard.guardRoute()) return;

    try {
        const user = await apiService.get(`/users/${userId}`);
        editingUserId = userId;
        
        // Fill form
        userForm.elements.name.value = user.name;
        userForm.elements.email.value = user.email;
        userForm.elements.role.value = user.role;
        userForm.elements.status.value = user.status;
        userForm.elements.password.value = ''; // Don't fill password

        userModal.setTitle('Edit User');
        userModal.show();
    } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Failed to load user');
    }
}

async function deleteUser(userId) {
    // if (!await authGuard.guardRoute()) return;

    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        await apiService.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
    }
}

// Users Management
async function loadUsers(params = {}) {
    // Constants
    const API_URL = "https://virlo.vercel.app/admin/all";
    const LOADING_HTML = `
        <tr>
            <td colspan="6" class="vr-table__empty">
                <div class="vr-spinner"></div>
                Loading users...
            </td>
        </tr>
    `;
    const ERROR_HTML = `
        <tr>
            <td colspan="6" class="vr-table__empty">
                Failed to load admins. Please try again.
            </td>
        </tr>
    `;

    try {
        // Show loading state
        usersTableBody.innerHTML = LOADING_HTML;

        // Get token with validation
        const token = localStorage.getItem("adminToken");
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Prepare request
        const myHeaders = new Headers();
        myHeaders.append("token", token);
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        // Fetch data with timeout
        const response = await Promise.race([
            fetch(API_URL, requestOptions),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
        )])

        // Handle response
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Validate response structure
        if (!result.data || !Array.isArray(result.data)) {
            throw new Error('Invalid data format received');
        }
console.log(result.data);

        // Render users
        renderUsers(result.data);

    } catch (error) {
        console.error('Admin loading error:', error);
        
        // Enhanced error handling
        let errorMessage = 'Failed to load admins';
        if (error.message.includes('token')) {
            errorMessage = 'Authentication required';
            // Redirect to login if token is invalid
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timeout. Please check your connection';
        }

        toast.error(errorMessage);
        usersTableBody.innerHTML = ERROR_HTML;
        
        // Add retry button
        const retryBtn = document.createElement('button');
        retryBtn.className = 'vr-btn vr-btn--sm vr-btn--outline';
        retryBtn.textContent = 'Retry';
        retryBtn.onclick = () => loadUsers(params);
        usersTableBody.querySelector('.vr-table__empty').appendChild(retryBtn);
    }
}

function renderUsers(users) {
    if (!users?.length) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="vr-table__empty">
                    No admins found
                </td>
            </tr>
        `;
        return;
    }

    usersTableBody.innerHTML = users.map(user => {
        // تحديد الدور بناءً على isSuperAdmin
        const role = user.isSuperAdmin ? 'Super Admin' : 'Admin';
        
        // تحديد الأيقونة بناءً على الدور
        const roleIcon = user.isSuperAdmin 
            ? '<i class="fas fa-crown text-warning"></i>' 
            : '<i class="fas fa-user-shield text-primary"></i>';

        return `
        <tr data-user-id="${user._id}">
            <td>${user.username}</td>
            <td>
                ${roleIcon}
                <span class="ml-2">${role}</span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                ${user.permissions?.length ? 
                  user.permissions.join(' , ') : 'All Permissions'}
            </td>
           
            <td class="text-right">
                <button class="vr-btn vr-btn--sm vr-btn--icon edit-user" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="vr-btn vr-btn--sm vr-btn--icon vr-btn--danger delete-user" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}
// Pagination
// function updatePagination(pagination) {
//     currentPage = pagination.currentPage;
//     totalPages = pagination.totalPages;
    
//     currentPageSpan.textContent = currentPage;
//     totalPagesSpan.textContent = totalPages;
    
//     prevPageBtn.disabled = currentPage === 1;
//     nextPageBtn.disabled = currentPage === totalPages;
// }

// function changePage(page) {
//     if (page < 1 || page > totalPages) return;
//     currentPage = page;
//     loadUsers({ page });
// }

// Utility Functions
// ثوابت التطبيق
const API_URL = "https://virlo.vercel.app/admin/all";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyIiwicGVybWlzc2lvbnMiOlsic3VwZXIiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJpYXQiOjE3MjY4NjE4MTZ9.K1czZfEBBtmLgHv9d-nOhQEVpSGZhD1lxRGfL1M72SA";

// عناصر DOM
const statCards = {
  totalAdmins: document.getElementById('totalAdmins'),
  superAdmins: document.getElementById('superAdmins'),
  regularAdmins: document.getElementById('regularAdmins'),
  adminsWithPermissions: document.getElementById('adminsWithPermissions')
};

// دالة لإنشاء رؤوس الطلب
function createHeaders() {
  const headers = new Headers();
  headers.append("token", TOKEN);
  headers.append("Content-Type", "application/json");
  return headers;
}

// دالة لعرض حالة التحميل
function showLoadingState() {
  Object.values(statCards).forEach(card => {
    card.textContent = "Loading...";
    card.classList.add("loading");
  });
}

// دالة لإخفاء حالة التحميل
function hideLoadingState() {
  Object.values(statCards).forEach(card => {
    card.classList.remove("loading");
  });
}
// أضف هذه الدوال في الجزء الخاص بمعالجة الفلترة
async function applyFilters() {
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
console.log(roleFilter);

    const filters = {
        role: roleFilter,
        status: statusFilter,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
        dateTo: dateTo ? new Date(dateTo).toISOString() : null
    };
console.log(filters);

    await loadUsers(filters);
}

// تعديل دالة loadUsers لدعم الفلترة
// async function loadUsers(filters = {}) {
//     // ... (الكود الحالي يبقى كما هو حتى جزء fetch)

//     try {
//         // إضافة الفلترات إلى URL إذا كانت موجودة
//         let url = API_URL;
//         const queryParams = new URLSearchParams();

//         if (filters.role) {
//             queryParams.append('role', filters.role);
//         }
//         if (filters.status) {
//             queryParams.append('status', filters.status);
//         }
//         if (filters.dateFrom) {
//             queryParams.append('dateFrom', filters.dateFrom);
//         }
//         if (filters.dateTo) {
//             queryParams.append('dateTo', filters.dateTo);
//         }

//         if (queryParams.toString()) {
//             url += `?${queryParams.toString()}`;
//         }

//         // ... (باقي الكود الحالي)
//     } catch (error) {
//         // ... (معالجة الأخطاء الحالية)
//     }
// }

// تعديل دالة setupEventListeners لإضافة مستمع لزر الفلترة
function setupEventListeners() {
    // ... (الأحداث الحالية)

    // Filter Button
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
}
// دالة لعرض الأخطاء
function showErrorState(error) {
  console.error("Admin stats error:", error);
  Object.values(statCards).forEach(card => {
    card.textContent = "Error loading";
    card.classList.add("error");
  });
}

// دالة رئيسية لجلب وعرض إحصائيات الأدمن
async function fetchAdminStats() {
  try {
    showLoadingState();
    
    const response = await fetch(API_URL, {
      method: "GET",
      headers: createHeaders(),
      redirect: "follow"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch admin data");
    }

    const result = await response.json();
    
    // تحليل البيانات
    const totalAdmins = result.total;
    const superAdmins = result.data.filter(admin => admin.isSuperAdmin).length;
    const regularAdmins = totalAdmins - superAdmins;
    const adminsWithPermissions = result.data.filter(admin => 
      admin.permissions && admin.permissions.length > 0
    ).length;

    // عرض البيانات مع تأثير
    statCards.totalAdmins.textContent = totalAdmins;
    statCards.superAdmins.textContent = superAdmins;
    statCards.regularAdmins.textContent = regularAdmins;
    statCards.adminsWithPermissions.textContent = adminsWithPermissions;

    // إضافة تأثيرات بصرية
    Object.values(statCards).forEach(card => {
      card.classList.add("updated");
      setTimeout(() => card.classList.remove("updated"), 1000);
    });

  } catch (error) {
    showErrorState(error);
  } finally {
    hideLoadingState();
  }
}

// دالة للتحديث التلقائي كل 5 دقائق
function setupAutoRefresh() {
  fetchAdminStats(); // جلب البيانات فورًا
  setInterval(fetchAdminStats, 5 * 60 * 1000); // تحديث كل 5 دقائق
}

// بدء التشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', setupAutoRefresh);
  
  // تشغيل الدالة عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', fetchAdminStats);
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
} 