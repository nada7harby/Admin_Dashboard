// Users Page Script

// Initialize components
const userModal = new Modal('userModal');
const toast = window.toastService;
const authGuard = window.authGuard;

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
    if (!await authGuard.guardRoute()) return;
    
    loadUsers();
    setupEventListeners();
});

function setupEventListeners() {
    // Add User Button
    addUserBtn.addEventListener('click', async () => {
        if (!await authGuard.guardRoute()) return;

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
    
    if (!await authGuard.guardRoute()) return;
    
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
    if (!await authGuard.guardRoute()) return;

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
    if (!await authGuard.guardRoute()) return;

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
    if (!await authGuard.guardRoute()) return;

    try {
        // Show loading state
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="vr-table__empty">
                    <div class="vr-spinner"></div>
                    Loading users...
                </td>
            </tr>
        `;

        var token = localStorage.getItem("adminToken");

        // Fetch admins from API
        const myHeaders = new Headers();
        myHeaders.append("token", token);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const response = await fetch("https://virlo.vercel.app/admin/all", requestOptions);
        console.log(response);
        
        if (!response.ok) {
            throw new Error('Failed to fetch admins');
        }
        const admins = await response.json();
        console.log(admins);
        
        // Render admins
        renderUsers(admins);
    } catch (error) {
        console.error('Error loading admins:', error);
        toast.error('Failed to load admins');
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="vr-table__empty">
                    Failed to load admins. Please try again.
                </td>
            </tr>
        `;
    }
}

function renderUsers(admins) {
    if (!admins.length) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="vr-table__empty">
                    No admins found.
                </td>
            </tr>
        `;
        return;
    }

    usersTableBody.innerHTML = admins.map(admin => `
        <tr>
            <td>
                <div class="vr-user-info">
                    <img src="${admin.avatar || '/images/avatar.jpg'}" 
                         alt="${admin.name}" 
                         class="vr-user-avatar">
                    <div class="vr-user-details">
                        <h4 class="vr-user-name">${admin.name}</h4>
                        <div class="vr-user-email">${admin.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="vr-badge vr-badge--${admin.role.toLowerCase()}">
                    ${admin.role}
                </span>
            </td>
            <td>
                <span class="vr-badge vr-badge--${admin.status.toLowerCase()}">
                    ${admin.status}
                </span>
            </td>
            <td>${formatDate(admin.createdAt)}</td>
            <td>${formatDate(admin.lastLogin)}</td>
            <td>
                <div class="vr-listing-actions">
                    <button class="vr-action-btn" onclick="editUser('${admin.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="vr-action-btn" onclick="deleteUser('${admin.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
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
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
} 