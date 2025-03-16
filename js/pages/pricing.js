// Pricing Page Script

// Initialize components
const planModal = new Modal('planModal');
const toast = window.toastService;

// DOM Elements
const addPlanBtn = document.getElementById('addPlanBtn');
const planForm = document.getElementById('planForm');
const featuresList = document.getElementById('featuresList');
const subscribersTableBody = document.getElementById('subscribersTableBody');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');

// State
let currentPage = 1;
let totalPages = 10;
let editingPlanId = null;

// Check Authentication
async function checkAuth() {
    try {
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
            toast.error('Please login to access this page');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Authentication check failed');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    loadSubscribers();
    setupEventListeners();
});

function setupEventListeners() {
    // Add Plan Button
    addPlanBtn.addEventListener('click', async () => {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        editingPlanId = null;
        planForm.reset();
        resetFeaturesList();
        planModal.setTitle('Add New Plan');
        planModal.show();
    });

    // Form Submit
    planForm.addEventListener('submit', handlePlanSubmit);

    // Pagination
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
}

// Plan Management
async function handlePlanSubmit(e) {
    e.preventDefault();
    
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    try {
        const submitBtn = planForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');

        const formData = new FormData(planForm);
        const features = Array.from(planForm.querySelectorAll('input[name="features[]"]'))
            .map(input => input.value)
            .filter(Boolean);
        
        const planData = {
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            features: features,
            popular: formData.get('popular') === 'on'
        };

        if (editingPlanId) {
            await apiService.put(`/plans/${editingPlanId}`, planData);
            toast.success('Plan updated successfully');
        } else {
            await apiService.post('/plans', planData);
            toast.success('Plan created successfully');
        }

        planModal.hide();
        location.reload(); // Refresh to show updated plans
    } catch (error) {
        console.error('Error submitting plan:', error);
        toast.error('Failed to save plan');
    } finally {
        submitBtn.classList.remove('loading');
    }
}

async function editPlan(planId) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    try {
        const plan = await apiService.get(`/plans/${planId}`);
        editingPlanId = planId;
        
        // Fill form
        planForm.elements.name.value = plan.name;
        planForm.elements.price.value = plan.price;
        planForm.elements.description.value = plan.description;
        planForm.elements.popular.checked = plan.popular;

        // Fill features
        resetFeaturesList();
        plan.features.forEach(feature => addFeature(feature));

        planModal.setTitle('Edit Plan');
        planModal.show();
    } catch (error) {
        console.error('Error loading plan:', error);
        toast.error('Failed to load plan');
    }
}

async function deletePlan(planId) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    if (!confirm('Are you sure you want to delete this plan? This will affect existing subscribers.')) {
        return;
    }

    try {
        await apiService.delete(`/plans/${planId}`);
        toast.success('Plan deleted successfully');
        location.reload(); // Refresh to show updated plans
    } catch (error) {
        console.error('Error deleting plan:', error);
        toast.error('Failed to delete plan');
    }
}

// Features List Management
function addFeature(value = '') {
    const featureItem = document.createElement('div');
    featureItem.className = 'vr-feature-item';
    featureItem.innerHTML = `
        <input type="text" class="vr-input" name="features[]" placeholder="Enter feature" value="${value}">
        <button type="button" class="vr-btn vr-btn--icon vr-btn--error" onclick="removeFeature(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    featuresList.appendChild(featureItem);
}

function removeFeature(button) {
    button.closest('.vr-feature-item').remove();
}

function resetFeaturesList() {
    featuresList.innerHTML = '';
    addFeature(); // Add one empty feature field
}

// Subscribers Management
async function loadSubscribers(params = {}) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    try {
        // Show loading state
        subscribersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="vr-table__empty">
                    <div class="vr-spinner"></div>
                    Loading subscribers...
                </td>
            </tr>
        `;

        // Fetch subscribers from API
        const response = await apiService.get('/subscriptions', { params });
        const { subscriptions, pagination } = response;

        // Update pagination
        updatePagination(pagination);

        // Render subscribers
        renderSubscribers(subscriptions);
    } catch (error) {
        console.error('Error loading subscribers:', error);
        toast.error('Failed to load subscribers');
        subscribersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="vr-table__empty">
                    Failed to load subscribers. Please try again.
                </td>
            </tr>
        `;
    }
}

function renderSubscribers(subscriptions) {
    if (!subscriptions.length) {
        subscribersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="vr-table__empty">
                    No subscribers found.
                </td>
            </tr>
        `;
        return;
    }

    subscribersTableBody.innerHTML = subscriptions.map(sub => `
        <tr>
            <td>
                <div class="vr-user-info">
                    <img src="${sub.user.avatar || '/images/avatar.jpg'}" 
                         alt="${sub.user.name}" 
                         class="vr-user-avatar">
                    <div class="vr-user-details">
                        <h4 class="vr-user-name">${sub.user.name}</h4>
                        <div class="vr-user-email">${sub.user.email}</div>
                    </div>
                </div>
            </td>
            <td>${sub.plan.name}</td>
            <td>
                <span class="vr-badge vr-badge--${sub.status}">
                    ${sub.status}
                </span>
            </td>
            <td>${formatDate(sub.startDate)}</td>
            <td>${formatDate(sub.nextBillingDate)}</td>
            <td>${formatCurrency(sub.amount)}</td>
            <td>
                <div class="vr-listing-actions">
                    <button class="vr-action-btn" onclick="viewSubscription('${sub.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="vr-action-btn" onclick="cancelSubscription('${sub.id}')" title="Cancel">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function cancelSubscription(subscriptionId) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    if (!confirm('Are you sure you want to cancel this subscription?')) {
        return;
    }

    try {
        await apiService.post(`/subscriptions/${subscriptionId}/cancel`);
        toast.success('Subscription cancelled successfully');
        loadSubscribers({ page: currentPage });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Failed to cancel subscription');
    }
}

function viewSubscription(subscriptionId) {
    window.open(`/subscriptions/${subscriptionId}`, '_blank');
}

// Pagination
function updatePagination(pagination) {
    currentPage = pagination.currentPage;
    totalPages = pagination.totalPages;
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadSubscribers({ page });
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
} 