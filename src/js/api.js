// API Configuration - Auto-detect API URL based on current host
const getApiBaseUrl = () => {
  // If accessing from network IP, use that IP for API
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Use the same hostname but port 5000 for API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  } else {
    // For network access, use the same IP but port 5000
    return `${protocol}//${hostname}:5000/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL:', API_BASE_URL);

// Get token from localStorage (only for auth token, not data)
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get user from localStorage (cached for display only)
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Set user in localStorage (cached for display only)
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Make API request
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Server returned invalid response (Status: ${response.status})`);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      console.error('❌ API Error Response:', {
        status: response.status,
        message: errorMessage,
        data: data
      });
      throw error;
    }

    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ API Request Failed:', {
      endpoint: `${API_BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      error: error.message,
      status: error.status
    });
    
    // Re-throw with more context
    if (error.message) {
      throw error;
    } else {
      throw new Error(`Network error: ${error.message || 'Failed to connect to server'}`);
    }
  }
};

// Auth API
const authAPI = {
  register: async (userData) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  },

  logout: () => {
    removeToken();
    window.location.href = 'index.html';
  },

  getCurrentUser: async () => {
    const response = await apiRequest('/auth/me');
    if (response.success) {
      setUser(response.user);
    }
    return response;
  }
};

// Products API
const productsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/products?${queryParams}` : '/products';
    return await apiRequest(endpoint);
  },

  getById: async (id) => {
    return await apiRequest(`/products/${id}`);
  },

  create: async (productData) => {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  update: async (id, productData) => {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// Cart API
const cartAPI = {
  get: async () => {
    return await apiRequest('/cart');
  },

  add: async (item) => {
    return await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  update: async (productId, quantity) => {
    return await apiRequest(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  remove: async (productId) => {
    return await apiRequest(`/cart/${productId}`, {
      method: 'DELETE'
    });
  },

  clear: async () => {
    return await apiRequest('/cart', {
      method: 'DELETE'
    });
  }
};

// Orders API
const ordersAPI = {
  getAll: async () => {
    return await apiRequest('/orders');
  },

  getById: async (id) => {
    return await apiRequest(`/orders/${id}`);
  },

  create: async (orderData) => {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  updateStatus: async (id, status) => {
    return await apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  cancel: async (id) => {
    return await apiRequest(`/orders/${id}`, {
      method: 'DELETE'
    });
  }
};

// Users API
const usersAPI = {
  getAll: async () => {
    return await apiRequest('/users');
  },

  getById: async (id) => {
    return await apiRequest(`/users/${id}`);
  },

  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Check if user is admin
const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// Redirect to login if not authenticated
const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = 'user-login.html';
    return false;
  }
  return true;
};

// Redirect to admin login if not admin
const requireAdmin = () => {
  if (!isAuthenticated() || !isAdmin()) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
};

