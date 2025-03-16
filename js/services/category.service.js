class CategoryService {
  constructor() {
    this.baseUrl = "https://virlo.vercel.app/categories";
    console.log('CategoryService initialized with baseUrl:', this.baseUrl);
  }

  // Get token from localStorage
  getToken() {
    const token = localStorage.getItem("token");
    console.log('Token retrieved:', token ? 'Token exists' : 'No token found');
    return token;
  }

  // Add new category
  async addCategory(categoryData) {
    console.log('Adding new category:', categoryData);
    try {
      if (!this.getToken()) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(categoryData)
      });

      console.log('Add category response:', response.status);
      const data = await response.json();
      console.log('Add category data:', data);

      // Handle specific API responses
      if (response.status === 409) {
        throw new Error(data.message || "Category already exists");
      }

      if (response.status === 500) {
        throw new Error("Internal server error");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error adding category");
      }

      if (window.toastService) {
        window.toastService.show("Category added successfully", "success");
      }

      return data;
    } catch (error) {
      console.error('Error in addCategory:', {
        message: error.message,
        stack: error.stack,
        categoryData: categoryData
      });
      if (window.toastService) {
        window.toastService.show(error.message, "error");
      }
      throw error;
    }
  }

  // Get all categories
  async getAllCategories() {
    console.log('Fetching all categories...');
    try {
      console.log('Making GET request to:', this.baseUrl);
      const response = await fetch(this.baseUrl);
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Parsed response data:', data);

      if (response.status === 500) {
        throw new Error("Internal server error");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error fetching categories");
      }

      // According to API docs, we expect an array of categories
      if (!data || !Array.isArray(data)) {
        console.error('Unexpected data structure:', data);
        throw new Error('Invalid response format');
      }

      // Map the categories to ensure consistent structure
      const categories = data.map(category => ({
        _id: category._id,
        categoryName: category.categoryName || '',
        iconOne: category.iconOne || '',
        iconTwo: category.iconTwo || '',
        amenities: Array.isArray(category.amenities) ? category.amenities : []
      }));

      console.log('Processed categories:', categories);
      return categories;

    } catch (error) {
      console.error('Error in getAllCategories:', {
        message: error.message,
        stack: error.stack,
        error: error
      });

      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to the server');
      }

      if (window.toastService) {
        window.toastService.show(
          error.message || "Failed to load categories", 
          "error"
        );
      }
      throw error;
    }
  }

  // Delete category
  async deleteCategory(categoryId) {
    console.log('Deleting category:', categoryId);
    try {
      if (!this.getToken()) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`
        }
      });

      console.log('Delete response:', response.status);
      const data = await response.json();
      console.log('Delete data:', data);

      if (response.status === 500) {
        throw new Error("Internal server error");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error deleting category");
      }

      if (window.toastService) {
        window.toastService.show("Category deleted successfully", "success");
      }

      return data;
    } catch (error) {
      console.error('Error in deleteCategory:', {
        message: error.message,
        stack: error.stack,
        categoryId: categoryId
      });
      if (window.toastService) {
        window.toastService.show(error.message, "error");
      }
      throw error;
    }
  }

  // Update category
  async updateCategory(categoryId, categoryData) {
    console.log('Updating category:', { categoryId, categoryData });
    try {
      if (!this.getToken()) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(categoryData)
      });

      console.log('Update response:', response.status);
      const data = await response.json();
      console.log('Update data:', data);

      if (response.status === 500) {
        throw new Error("Internal server error");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error updating category");
      }

      if (window.toastService) {
        window.toastService.show("Category updated successfully", "success");
      }

      return data;
    } catch (error) {
      console.error('Error in updateCategory:', {
        message: error.message,
        stack: error.stack,
        categoryId: categoryId,
        categoryData: categoryData
      });
      if (window.toastService) {
        window.toastService.show(error.message, "error");
      }
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(categoryId) {
    console.log('Fetching category by ID:', categoryId);
    try {
      const response = await fetch(`${this.baseUrl}/${categoryId}`);

      console.log('Get category response:', response.status);
      const data = await response.json();
      console.log('Get category data:', data);

      if (response.status === 500) {
        throw new Error("Internal server error");
      }

      if (!response.ok) {
        throw new Error(data.message || "Category not found");
      }

      return data;
    } catch (error) {
      console.error('Error in getCategoryById:', {
        message: error.message,
        stack: error.stack,
        categoryId: categoryId
      });
      if (window.toastService) {
        window.toastService.show(error.message, "error");
      }
      throw error;
    }
  }
}

// Create a global instance of the service
window.categoryService = new CategoryService();
