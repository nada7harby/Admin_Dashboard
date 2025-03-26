// Initialize components
const toast = window.toastService;

// DOM Elements
const editListingForm = document.getElementById("editListingForm");
const categorySelect = document.getElementById("category");
const openingTimesContainer = document.getElementById("openingTimes");

// Get listing ID from localStorage
const listingId = localStorage.getItem('editingListingId');

// Days of the week
const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

// Load categories
async function loadCategories() {
    try {
        const myHeaders = new Headers();
        myHeaders.append("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibW9tZW4iLCJlbWFpbCI6Im1vbWVuc2FsZWgyNDY4QGdtYWlsLmNvbSIsInVzZXJJZCI6IjY3YTg5OWY1MTkwOWJjNjBjY2RjMjZhNyIsImlhdCI6MTczOTIwMTU0OX0.ZECKy5Bag0hPSphNaJlsI5zshlIx11l9FNu0RmbXg_g");
        
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const response = await fetch("https://virlo.vercel.app/categories", requestOptions);
        const data = await response.json();

        // تحقق من هيكل البيانات المتوقع
        if (!Array.isArray(data)) {
            throw new Error("Invalid data format: Expected array");
        }

        categorySelect.innerHTML = '<option value="">Select Category</option>';
        data.forEach(category => {
            categorySelect.innerHTML += `
                <option value="${category._id}">${category.categoryName}</option>
            `;
        });
    } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
    }
}
// Create opening times inputs
function createOpeningTimesInputs(openingTimes = {}) {
    openingTimesContainer.innerHTML = '';
    
    daysOfWeek.forEach(day => {
        const dayTimes = openingTimes[day] || { status: 'closed', from: '', to: '' };
        
        const dayContainer = document.createElement('div');
        dayContainer.className = 'vr-opening-time-item';
        dayContainer.innerHTML = `
            <div class="vr-opening-time-header">
                <label class="vr-label">${day}</label>
                <div class="vr-opening-time-status">
                    <label class="vr-checkbox">
                        <input type="checkbox" name="openingTimes[${day}][status]" 
                               value="open" ${dayTimes.status === 'open' ? 'checked' : ''}>
                        <span>Open</span>
                    </label>
                </div>
            </div>
            <div class="vr-opening-time-inputs">
                <div class="vr-form-group">
                    <input type="time" name="openingTimes[${day}][from]" 
                           class="vr-input" value="${dayTimes.from || ''}"
                           ${dayTimes.status === 'closed' ? 'disabled' : ''}>
                </div>
                <div class="vr-form-group">
                    <input type="time" name="openingTimes[${day}][to]" 
                           class="vr-input" value="${dayTimes.to || ''}"
                           ${dayTimes.status === 'closed' ? 'disabled' : ''}>
                </div>
            </div>
        `;

        // Add event listener for checkbox
        const checkbox = dayContainer.querySelector('input[type="checkbox"]');
        const timeInputs = dayContainer.querySelectorAll('input[type="time"]');
        
        checkbox.addEventListener('change', (e) => {
            timeInputs.forEach(input => {
                input.disabled = !e.target.checked;
                if (!e.target.checked) {
                    input.value = '';
                }
            });
        });

        openingTimesContainer.appendChild(dayContainer);
    });
}

// Load listing data
async function loadListingData() {
    try {
        const response = await fetch(`https://virlo.vercel.app/listing/${listingId}`);
        const listing = await response.json();

        // Fill form with listing data
        document.getElementById("listingName").value = listing.listingName;
        document.getElementById("category").value = listing.categoryId?._id || "";
        document.getElementById("location").value = listing.location || "";
        document.getElementById("email").value = listing.email || "";
        document.getElementById("mobile").value = listing.mobile || "";
        document.getElementById("description").value = listing.description || "";
        document.getElementById("status").value = listing.isActive.toString();

        // Create opening times inputs
        createOpeningTimesInputs(listing.openingTimes);
    } catch (error) {
        console.error("Error loading listing:", error);
        toast.error("Failed to load listing data");
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    try {
        const submitBtn = editListingForm.querySelector('button[type="submit"]');
        submitBtn.classList.add("loading");

        // Get form data
        const formData = new FormData(editListingForm);
        const listingData = {
            listingName: formData.get("listingName"),
            categoryId: formData.get("category"),
            location: formData.get("location"),
            email: formData.get("email"),
            mobile: formData.get("mobile"),
            description: formData.get("description"),
            isActive: formData.get("isActive") === "true",
            openingTimes: {}
        };

        // Process opening times
        daysOfWeek.forEach(day => {
            const status = formData.get(`openingTimes[${day}][status]`) ? "open" : "closed";
            listingData.openingTimes[day] = {
                status,
                from: status === "open" ? formData.get(`openingTimes[${day}][from]`) : "",
                to: status === "open" ? formData.get(`openingTimes[${day}][to]`) : ""
            };
        });

        // Prepare headers
        const myHeaders = new Headers();
        myHeaders.append("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibW9tZW4iLCJlbWFpbCI6Im1vbWVuc2FsZWgyNDY4QGdtYWlsLmNvbSIsInVzZXJJZCI6IjY3YTg5OWY1MTkwOWJjNjBjY2RjMjZhNyIsImlhdCI6MTczOTIwMTU0OX0.ZECKy5Bag0hPSphNaJlsI5zshlIx11l9FNu0RmbXg_g");
        myHeaders.append("Content-Type", "application/json");

        // Send update request
        const response = await fetch(`https://virlo.vercel.app/listing/${listingId}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(listingData),
            redirect: "follow"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to update listing");
        }

        toast.success("Listing updated successfully");
        setTimeout(() => {
            window.location.href = "listings.html";
        }, 1500);
    } catch (error) {
        console.error("Error updating listing:", error);
        toast.error(error.message || "Failed to update listing");
    } finally {
        const submitBtn = editListingForm.querySelector('button[type="submit"]');
        submitBtn.classList.remove("loading");
    }
}


// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    if (!listingId) {
        toast.error("No listing ID provided");
        window.location.href = "listings.html";
        return;
    }

    loadCategories();
    loadListingData();
    editListingForm.addEventListener("submit", handleSubmit);
});