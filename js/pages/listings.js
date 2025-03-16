// Listings Page Script

// Initialize components
const listingModal = new Modal("listingModal");
const toast = window.toastService;

// DOM Elements
const listingsTableBody = document.getElementById("listingsTableBody");
const addListingBtn = document.getElementById("addListingBtn");
const listingForm = document.getElementById("listingForm");
const imagePreview = document.getElementById("imagePreview");
const listingImages = document.getElementById("listingImages");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");
const searchInput = document.querySelector(".vr-admin-header__search input");

// State
// let currentPage = 1;
// let totalPages = 10;
let selectedImages = [];
let editingListingId = null;
// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadListings();
  setupEventListeners();
});
function applyFilters() {
  const filters = {
    status: statusFilter.value,
    category: categoryFilter.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    page: 1, // العودة إلى الصفحة الأولى عند تطبيق الفلترة
  };

  currentPage = 1;
  loadListings(filters);
}
function handleSearch(e) {
  const searchTerm = e.target.value.trim();
  currentPage = 1; // العودة إلى الصفحة الأولى عند البحث
  loadListings({ search: searchTerm, page: currentPage });
}
function setupEventListeners() {
  // Add Listing Button
  addListingBtn.addEventListener("click", () => {
    editingListingId = null;
    listingForm.reset();
    imagePreview.innerHTML = "";
    selectedImages = [];
    listingModal.setTitle("Add New Listing");
    listingModal.show();
  });

  // Form Submit
  listingForm.addEventListener("submit", handleListingSubmit);

  // Image Upload
  listingImages.addEventListener("change", handleImageUpload);

  // Filters
  applyFiltersBtn.addEventListener("click", applyFilters);

  // Pagination
  prevPageBtn.addEventListener("click", () => changePage(currentPage - 1));
  nextPageBtn.addEventListener("click", () => changePage(currentPage + 1));

  // Search
  searchInput.addEventListener("input", debounce(handleSearch, 500));
}

// Listings CRUD Operations
// async function loadListings(params = {}) {
//   try {
//     // Show loading state
//     listingsTableBody.innerHTML = `
//             <tr>
//                 <td colspan="7" class="vr-table__empty">
//                     <div class="vr-spinner"></div>
//                     Loading listings...
//                 </td>
//             </tr>
//         `;

//     // Fetch listings from the new API
//     const response = await fetch(
//       "https://virlo.vercel.app/listing/?lastValue=15"
//     );
//     const data = await response.json();
//     console.log(data.listings);
//     const lists = data.listings.map((item) => ({
//       id: item._id,
//       title: item.listingName,
//       category: item.categoryId
//         ? item.categoryId.categoryName
//         : "Uncategorized",
//       price: 0,
//       status: item.isActive ? "active" : "inactive",
//       views: 0,
//       createdAt: item.createdAt || new Date().toISOString(),
//       image: item.mainImage || "",
//       location: item.location || "Unknown",
//       description: item.description || "No description available",
//       email: item.email || "No email provided",
//       mobile: item.mobile || "No mobile provided",
//       openingTimes: item.openingTimes || {},
//     }));

//     updatePagination({
//       currentPage: 1,
//       totalPages: 1,
//     });

//     // Render listings
//     if (!lists) {
//       console.log("ممممم");
//     }

//     renderListings(lists);
//   } catch (error) {
//     console.error("Error loading listings:", error);
//     toast.error("Failed to load listings");
//     listingsTableBody.innerHTML = `
//             <tr>
//                 <td colspan="7" class="vr-table__empty">
//                     Failed to load listings. Please try again.
//                 </td>
//             </tr>
//         `;
//   }
// }
// دالة لجلب إحصائيات الـ listings
async function fetchListingsStats() {
  try {
    const response = await fetch("https://virlo.vercel.app/listing/?lastValue=15");
    const data = await response.json();
    const listings = data.listings;

    // حساب الإحصائيات
    const totalListings = listings.length;
    const activeListings = listings.filter(listing => listing.isActive).length;
    const postedListings = listings.filter(listing => listing.isPosted).length;
    const notPostedListings = listings.filter(listing => !listing.isPosted).length;

    // عرض الإحصائيات في الكروت
    document.querySelector(".vr-stat-card:nth-child(1) .vr-stat-card__value").textContent = totalListings;
    document.querySelector(".vr-stat-card:nth-child(2) .vr-stat-card__value").textContent = activeListings;
    document.querySelector(".vr-stat-card:nth-child(3) .vr-stat-card__value").textContent = postedListings;
    document.querySelector(".vr-stat-card:nth-child(4) .vr-stat-card__value").textContent = notPostedListings;

  } catch (error) {
    console.error("Error fetching listings stats:", error);
    toast.error("Failed to fetch listings stats");
  }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  fetchListingsStats();
});
let allListings = []; // تخزين جميع القوائم
let currentPage = 1; // الصفحة الحالية
const listingsPerPage = 10; // عدد العناصر في كل صفحة

async function loadListings() {
  try {
    // عرض حالة التحميل
    listingsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="vr-table__empty">
          <div class="vr-spinner"></div>
          Loading listings...
        </td>
      </tr>
    `;

    // جلب جميع القوائم من الـ API
    const response = await fetch(
      "https://virlo.vercel.app/listing/?lastValue=15"
    );
    const data = await response.json();
    allListings = data.listings;
    console.log(allListings);

    // تحديث Pagination وعرض الصفحة الأولى
    updatePagination({
      currentPage: 1,
      totalPages: Math.ceil(allListings.length / listingsPerPage),
    });
    renderListings(allListings.slice(0, listingsPerPage));
  } catch (error) {
    console.error("Error loading listings:", error);
    toast.error("Failed to load listings");
    listingsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="vr-table__empty">
          Failed to load listings. Please try again.
        </td>
      </tr>
    `;
  }
}

async function handleListingSubmit(e) {
  e.preventDefault();

  try {
    const submitBtn = listingForm.querySelector('button[type="submit"]');
    submitBtn.classList.add("loading");

    const formData = new FormData(listingForm);
    formData.append("images", selectedImages);

    if (editingListingId) {
      await apiService.put(`/listings/${editingListingId}`, formData);
      toast.success("Listing updated successfully");
    } else {
      await apiService.post("/listings", formData);
      toast.success("Listing created successfully");
    }

    listingModal.hide();
    loadListings();
  } catch (error) {
    console.error("Error submitting listing:", error);
    toast.error("Failed to save listing");
  } finally {
    submitBtn.classList.remove("loading");
  }
}
prevPageBtn.addEventListener("click", () => changePage(currentPage - 1));
nextPageBtn.addEventListener("click", () => changePage(currentPage + 1));

function handleImageUpload(e) {
  const files = Array.from(e.target.files);

  files.forEach((file) => {
    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name} is not an image`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      selectedImages.push(file);

      const imageItem = document.createElement("div");
      imageItem.className = "vr-image-preview-item";
      imageItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
                <button type="button" class="vr-remove-image">
                <i class="fas fa-times"></i>
                </button>
            `;

      imageItem
        .querySelector(".vr-remove-image")
        .addEventListener("click", () => {
          const index = selectedImages.indexOf(file);
          if (index > -1) {
            selectedImages.splice(index, 1);
          }
          imageItem.remove();
        });

      imagePreview.appendChild(imageItem);
    };
    reader.readAsDataURL(file);
  });
}

async function editListing(id) {
  try {
    const listing = await apiService.get(`/listings/${id}`);
    editingListingId = id;

    // Fill form
    Object.keys(listing).forEach((key) => {
      const input = listingForm.elements[key];
      if (input) {
        input.value = listing[key];
      }
    });

    // Show images
    imagePreview.innerHTML = "";
    selectedImages = [];
    if (listing.images) {
      listing.images.forEach((image) => {
        const imageItem = document.createElement("div");
        imageItem.className = "vr-image-preview-item";
        imageItem.innerHTML = `
                    <img src="${image}" alt="Preview">
                    <button type="button" class="vr-remove-image">
                        <i class="fas fa-times"></i>
                        </button>
                        `;
        imagePreview.appendChild(imageItem);
      });
    }

    listingModal.setTitle("Edit Listing");
    listingModal.show();
  } catch (error) {
    console.error("Error loading listing:", error);
    toast.error("Failed to load listing");
  }
}

async function deleteListing(id) {
  if (!confirm("Are you sure you want to delete this listing?")) {
    return;
  }

  try {
    await apiService.delete(`/listings/${id}`);
    toast.success("Listing deleted successfully");
    loadListings();
  } catch (error) {
    console.error("Error deleting listing:", error);
    toast.error("Failed to delete listing");
  }
}

async function viewListing(id) {
  try {
      // Fetch listing details from the API
      const response = await fetch(`https://virlo.vercel.app/listing/${id}`);
      const listing = await response.json();
      console.log(listing);

      // Fill the modal with listing details
      const modalContent = document.getElementById("viewListingContent");
      modalContent.innerHTML = `
          <div class="listing-details">
              <div class="listing-header">
                  <h2 class="listing-title">${listing.listingName}</h2>
                  <span class="listing-status ${listing.isActive ? "active" : "inactive"}">
                      ${listing.isActive ? "Active" : "Inactive"}
                  </span>
              </div>
              <div class="listing-info">
                  <div class="info-item">
                      <span class="info-label">Category:</span>
                      <span class="info-value">${
                          listing.categoryId
                              ? listing.categoryId.categoryName
                              : "Uncategorized"
                      }</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">Location:</span>
                      <span class="info-value">${listing.location || "Unknown"}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">Email:</span>
                      <span class="info-value">${listing.email || "No email provided"}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">Mobile:</span>
                      <span class="info-value">${listing.mobile || "No mobile provided"}</span>
                  </div>
                  <div class="info-item">
                      <span class="info-label">Created At:</span>
                      <span class="info-value">${formatDate(listing.createdAt)}</span>
                  </div>
              </div>
              <div class="listing-description">
                  <h3>Description</h3>
                  <p>${listing.description || "No description available"}</p>
              </div>
              <div class="listing-opening-times">
                  <h3>Opening Times</h3>
                  <ul>
                      ${Object.entries(listing.openingTimes || {})
                          .map(
                              ([day, times]) => `
                          <li>
                              <span class="day">${day}:</span>
                              <span class="time">${
                                  times.status === "open"
                                      ? `${times.from} - ${times.to}`
                                      : "Closed"
                              }</span>
                          </li>
                      `
                          )
                          .join("")}
                  </ul>
              </div>
          </div>
      `;

      // Show the modal using Bootstrap
      const viewModal = new bootstrap.Modal(document.getElementById('viewListingModal'));
      viewModal.show();
  } catch (error) {
      console.error("Error loading listing details:", error);
      toast.error("Failed to load listing details");
  }
}
// Filters and Search
function applyFilters() {
  const filters = {
    status: statusFilter.value,
    category: categoryFilter.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    page: 1,
  };

  currentPage = 1;
  loadListings(filters);
}

function handleSearch(e) {
  const searchTerm = e.target.value.trim();
  loadListings({ search: searchTerm, page: 1 });
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
  if (page < 1 || page > totalPages) return; // التأكد من أن الصفحة ضمن النطاق الصحيح
  currentPage = page;

  // حساب بداية ونهاية العناصر للصفحة الحالية
  const startIndex = (currentPage - 1) * listingsPerPage;
  const endIndex = startIndex + listingsPerPage;

  // عرض العناصر للصفحة الحالية
  renderListings(allListings.slice(startIndex, endIndex));

  // تحديث Pagination
  updatePagination({
    currentPage,
    totalPages: Math.ceil(allListings.length / listingsPerPage),
  });
}

function updatePagination(pagination) {
  currentPage = pagination.currentPage;
  totalPages = pagination.totalPages;

  // تحديث النصوص في واجهة المستخدم
  currentPageSpan.textContent = currentPage;
  totalPagesSpan.textContent = totalPages;

  // تعطيل أزرار "السابق" و"التالي" إذا لزم الأمر
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}
// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function renderListings(listings) {
  console.log(listings);

  if (!listings.length) {
    listingsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="vr-table__empty">
            No listings found.
          </td>
        </tr>
      `;
    return;
  }

  listingsTableBody.innerHTML = listings
    .map(
      (listing) => `
          <tr>
            <td>
              <div class="vr-listing-info">
                <div class="vr-listing-details">
                  <h4 class="vr-listing-title">${listing.listingName}</h4>
                </div>
              </div>
            </td>
            <td>${
              listing.categoryId
                ? listing.categoryId.categoryName
                : "Uncategorized"
            }</td>
            <td>${listing.location || "Unknown"}</td>
            <td>
              <span class="vr-badge vr-badge--${
                listing.isActive ? "active" : "inactive"
              }">
                ${listing.isActive ? "active" : "inactive"}
              </span>
            </td>
            <td>${listing.views}</td>
            <td>${formatDate(
              listing.createdAt || new Date().toISOString()
            )}</td>
            <td>
              <div class="vr-listing-actions">
              <button class="vr-action-btn" onclick="showListingModal(${JSON.stringify(listing).replace(/"/g, '&quot;')})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
             
              </div>
            </td>
          </tr>
        `
    )
    .join("");
}
// async function viewListing(id) {
//   try {
//     // Fetch listing details from the API
//     const response = await fetch(`https://virlo.vercel.app/listing/${id}`);
//     const listing = await response.json();
//     // console.log(listing);

//     // Fill the modal with listing details
//     const modalContent = document.getElementById("viewListingContent");
    
//     modalContent.innerHTML = `
//             <div class="listing-details">
//                 <div class="listing-header">
//                     <h2 class="listing-title">${listing.listingName}</h2>
//                     <span class="listing-status ${
//                       listing.isActive ? "active" : "inactive"
//                     }">
//                         ${listing.isActive ? "Active" : "Inactive"}
//                     </span>
//                 </div>
//                 <div class="listing-info">
//                     <div class="info-item">
//                         <span class="info-label">Category:</span>
//                         <span class="info-value">${
//                           listing.categoryId
//                             ? listing.categoryId.categoryName
//                             : "Uncategorized"
//                         }</span>
//                     </div>
//                     <div class="info-item">
//                         <span class="info-label">Location:</span>
//                         <span class="info-value">${
//                           listing.location || "Unknown"
//                         }</span>
//                     </div>
//                     <div class="info-item">
//                         <span class="info-label">Email:</span>
//                         <span class="info-value">${
//                           listing.email || "No email provided"
//                         }</span>
//                     </div>
//                     <div class="info-item">
//                         <span class="info-label">Mobile:</span>
//                         <span class="info-value">${
//                           listing.mobile || "No mobile provided"
//                         }</span>
//                     </div>
//                     <div class="info-item">
//                         <span class="info-label">Created At:</span>
//                         <span class="info-value">${formatDate(
//                           listing.createdAt
//                         )}</span>
//                     </div>
//                 </div>
//                 <div class="listing-description">
//                     <h3>Description</h3>
//                     <p>${listing.description || "No description available"}</p>
//                 </div>
//                 <div class="listing-opening-times">
//                     <h3>Opening Times</h3>
//                     <ul>
//                         ${Object.entries(listing.openingTimes || {})
//                           .map(
//                             ([day, times]) => `
//                             <li>
//                                 <span class="day">${day}:</span>
//                                 <span class="time">${
//                                   times.status === "open"
//                                     ? `${times.from} - ${times.to}`
//                                     : "Closed"
//                                 }</span>
//                             </li>
//                         `
//                           )
//                           .join("")}
//                     </ul>
//                 </div>
//             </div>
//         `;

//     // Show the modal
//     const viewModal = new Modal("viewListingModal");
//     viewModal.show();
//   } catch (error) {
//     console.error("Error loading listing details:", error);
//     toast.error("Failed to load listing details");
//   }
// }


function showListingModal(listing) {
  // Fill modal with listing data
  const modalContent = document.getElementById('listingDetailsContent');
  console.log(modalContent);
  
  modalContent.innerHTML = `
      <div class="listing-details">
          <div class="listing-header">
              <h2 class="listing-title">${listing.listingName || 'N/A'}</h2>
              <span class="listing-status ${listing.isActive ? 'active' : 'inactive'}">
                  ${listing.isActive ? 'Active' : 'Inactive'}
              </span>
          </div>
          <div class="listing-info">
              <div class="info-item">
                  <span class="info-label">Category:</span>
                  <span class="info-value">${
                      listing.categoryId?.categoryName || 'Uncategorized'
                  }</span>
              </div>
              <div class="info-item">
                  <span class="info-label">Location:</span>
                  <span class="info-value">${listing.location || 'Unknown'}</span>
              </div>
              <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${listing.email || 'No email provided'}</span>
              </div>
              <div class="info-item">
                  <span class="info-label">Mobile:</span>
                  <span class="info-value">${listing.mobile || 'No mobile provided'}</span>
              </div>
              <div class="info-item">
                  <span class="info-label">Created At:</span>
                  <span class="info-value">${new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>
          </div>
          <div class="listing-description">
              <h3>Description</h3>
              <p>${listing.description || 'No description available'}</p>
          </div>
          <div class="listing-opening-times">
              <h3>Opening Times</h3>
              <ul>
                  ${Object.entries(listing.openingTimes || {})
                      .map(([day, times]) => `
                          <li>
                              <span class="day">${day}:</span>
                              <span class="time">${
                                  times.status === 'open'
                                      ? `${times.from} - ${times.to}`
                                      : 'Closed'
                              }</span>
                          </li>
                      `)
                      .join('')}
              </ul>
          </div>
      </div>
  `;

  // Show the modal using Bootstrap
  const listingModal = new bootstrap.Modal(document.getElementById('listingDetailsModal'));
  listingModal.show();
}
async function deleteListing(id) {
  console.log(id);
  
  if (!confirm("Are you sure you want to delete this listing?")) {
    return;
  }

  try {
    // Show loading state (optional)
    const deleteBtn = document.querySelector(
      `button[onclick="deleteListing('${id}')"]`
    );
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    deleteBtn.disabled = true;
    var token = localStorage.getItem("adminToken");
    // console.log(token);
    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyIiwidXNlcklkIjoiNjdiMzdmMmYxYmE1NDAxM2JlZGI2NGM2IiwicGVybWlzc2lvbnMiOltdLCJpc1N1cGVyQWRtaW4iOnRydWUsImlhdCI6MTc0MTg1NzYzM30.xLPmPe0VsiTp9sPgRowBWrcuRg7kialtiEMBgd3PWC0";
    // Send DELETE request to the API
    const response = await fetch(
      `https://virlo.vercel.app/listing/admin/${id}`,
      {
        method: "DELETE",
        headers: {
          token: `${token}`,
        },
      }
    );
    // console.log(`Bearer ${token}`);

    // Check if the deletion was successful
    if (!response.ok) {
      throw new Error("Failed to delete listing");
    }

    // Show success message
    toast.success("Listing deleted successfully");

    // Reload the listings to reflect the changes
    loadListings();
  } catch (error) {
    console.error("Error deleting listing:", error);
    toast.error("Failed to delete listing");
  } finally {
    // Reset the delete button (optional)
    const deleteBtn = document.querySelector(
      `button[onclick="deleteListing('${id}')"]`
    );
    if (deleteBtn) {
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.disabled = false;
    }
  }
}
