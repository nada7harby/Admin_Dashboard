// Add Listing Page Script

// DOM Elements
const addListingForm = document.getElementById('addListingForm');
const categorySelect = document.getElementById('categoryId');
const mainImageInput = document.getElementById('mainImage');
const galleryImagesInput = document.getElementById('galleryImages');
const imagePreview = document.getElementById('imagePreview');
const galleryPreview = document.getElementById('galleryPreview');
const openingTimesContainer = document.getElementById('openingTimesContainer');

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const addListingForm = document.getElementById('addListingForm');
    
    if (!addListingForm) {
        console.error('Form not found! Check the ID');
        return;
    }
    loadCategories();
    setupEventListeners();
    initializeOpeningTimes();
});

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch('https://virlo.vercel.app/categories');
        const categories = await response.json();
        
        // Clear existing options
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        // Add categories to select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.categoryName;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submit
    addListingForm.addEventListener('submit', handleSubmit);
    
    // Image preview
    mainImageInput.addEventListener('change', handleMainImagePreview);
    galleryImagesInput.addEventListener('change', handleGalleryImagesPreview);
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = addListingForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    
    try {
        // Prepare base data
        const formData = {
            listingName: addListingForm.querySelector('[name="title"]').value,
            location: addListingForm.querySelector('[name="location"]').value,
            longitude: addListingForm.querySelector('[name="longitude"]').value,
            latitude: addListingForm.querySelector('[name="latitude"]').value,
            description: addListingForm.querySelector('[name="description"]').value,
            email: addListingForm.querySelector('[name="email"]').value,
            mobile: addListingForm.querySelector('[name="mobile"]').value,
            taxNumber: addListingForm.querySelector('[name="taxNumber"]').value,
            categoryId: categorySelect.value,
            items: getItemsFromForm(),
            openingTimes: getOpeningTimesFromForm()
        };

        // Process main image
        const mainImageFile = mainImageInput.files[0];
        if (mainImageFile) {
            formData.mainImage = await convertFileToBase64(mainImageFile);
        }

        // Process gallery images
        const galleryFiles = galleryImagesInput.files;
        if (galleryFiles && galleryFiles.length > 0) {
            formData.gallery = [];
            for (let i = 0; i < galleryFiles.length; i++) {
                const base64Image = await convertFileToBase64(galleryFiles[i]);
                formData.gallery.push(base64Image);
            }
        }

        // Send data to API
        await sendData(formData);

    } catch (error) {
        console.error('Error creating listing:', error);
        toast.error('Failed to create listing');
    } finally {
        submitBtn.classList.remove('loading');
    }
}

// Convert file to base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Get items from form
function getItemsFromForm() {
    const items = [];
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const name = row.querySelector('[name="itemName"]').value;
        const price = row.querySelector('[name="itemPrice"]').value;
        
        if (name && price) {
            items.push({ name, price: parseFloat(price) });
        }
    });
    
    return items;
}

// Get opening times from form
function getOpeningTimesFromForm() {
    const openingTimes = {};
    
    document.querySelectorAll('.vr-opening-time').forEach(timeRow => {
        const day = timeRow.querySelector('select').value;
        const status = timeRow.querySelector('input[type="radio"]:checked').value;
        
        if (status === 'open') {
            openingTimes[day] = {
                status,
                from: timeRow.querySelector('.open-time').value,
                to: timeRow.querySelector('.close-time').value
            };
        } else {
            openingTimes[day] = {
                status: 'close',
                closingReason: timeRow.querySelector('.closing-reason').value || 'Not specified'
            };
        }
    });
    
    return openingTimes;
}

// Send data to API
async function sendData(formData) {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch('https://virlo.vercel.app/listing', {
        method: 'POST',
        headers: {
            'token': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        throw new Error('Failed to create listing');
    }
    
    const result = await response.json();
    toast.success('Listing created successfully');
    window.location.href = 'listings.html';
}

// Handle main image preview
function handleMainImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button type="button" class="vr-remove-image" onclick="removeMainImage()">
                <i class="fas fa-times"></i>
            </button>
        `;
    };
    reader.readAsDataURL(file);
}

// Handle gallery images preview
function handleGalleryImagesPreview(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    galleryPreview.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-preview-item';
            imgContainer.innerHTML = `
                <img src="${e.target.result}" alt="Gallery Preview ${i+1}">
                <button type="button" class="vr-remove-image" onclick="removeGalleryImage(${i})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            galleryPreview.appendChild(imgContainer);
        };
        reader.readAsDataURL(files[i]);
    }
}

// Remove main image
function removeMainImage() {
    mainImageInput.value = '';
    imagePreview.innerHTML = '';
}

// Remove gallery image
function removeGalleryImage(index) {
    const files = Array.from(galleryImagesInput.files);
    files.splice(index, 1);
    
    // Create new DataTransfer to update files
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    galleryImagesInput.files = dataTransfer.files;
    
    // Refresh preview
    handleGalleryImagesPreview({ target: galleryImagesInput });
}

// Initialize opening times
function initializeOpeningTimes() {
    daysOfWeek.forEach(day => {
        addOpeningTime(day);
    });
}

// Add opening time row
function addOpeningTime(day = '') {
    const timeRow = document.createElement('div');
    timeRow.className = 'vr-opening-time';
    
    timeRow.innerHTML = `
        <select required>
            <option value="">Select Day</option>
            ${daysOfWeek.map(d => `<option value="${d}" ${d === day ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        
        <div class="vr-opening-time__status">
            <label>
                <input type="radio" name="status_${day}" value="open" checked>
                Open
            </label>
            <label>
                <input type="radio" name="status_${day}" value="closed">
                Closed
            </label>
        </div>
        
        <input type="time" class="open-time" required>
        <input type="time" class="close-time" required>
        
        <input type="text" class="closing-reason vr-input" placeholder="Closing reason" style="display: none;">
        
        <button type="button" class="vr-remove-time" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add event listener for status change
    timeRow.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const timeInputs = timeRow.querySelectorAll('input[type="time"]');
            const reasonInput = timeRow.querySelector('.closing-reason');
            
            if (this.value === 'open') {
                timeInputs.forEach(input => input.style.display = 'block');
                reasonInput.style.display = 'none';
            } else {
                timeInputs.forEach(input => input.style.display = 'none');
                reasonInput.style.display = 'block';
            }
        });
    });
    
    openingTimesContainer.appendChild(timeRow);
}

// Add new item row
function addNewItem() {
    const itemsContainer = document.getElementById('itemsContainer');
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    
    itemRow.innerHTML = `
        <input type="text" name="itemName" class="vr-input" placeholder="Item name" required>
        <input type="number" name="itemPrice" class="vr-input" placeholder="Price" required>
        <button type="button" class="vr-btn vr-btn--danger" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    itemsContainer.appendChild(itemRow);
}