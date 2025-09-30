const API_BASE = 'https://the-plant-parenthood-planner.onrender.com';

// JWT Token management
let authToken = localStorage.getItem('authToken');

export const apiService = {
  // Token management
  setToken: (token) => {
    authToken = token;
    localStorage.setItem('authToken', token);
  },
  
  getToken: () => {
    return authToken;
  },
  
  clearToken: () => {
    authToken = null;
    localStorage.removeItem('authToken');
  },

  // Get headers with JWT token
  getAuthHeaders: () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  },

  // Authentication
  register: (userData) => 
    fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData)
    }).then(async (res) => {
      const data = await res.json();
      if (data.token) {
        apiService.setToken(data.token);
      }
      return data;
    }),

  login: (userData) => 
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData)
    }).then(async (res) => {
      const data = await res.json();
      if (data.token) {
        apiService.setToken(data.token);
      }
      return data;
    }),

  logout: () => {
    // Call backend logout and clear token
    return fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: apiService.getAuthHeaders()
    })
    .then(res => res.json())
    .finally(() => {
      apiService.clearToken();
    });
  },

  checkAuth: () => 
    fetch(`${API_BASE}/check-auth`, {
      headers: apiService.getAuthHeaders()
    }).then(res => res.json()),

  // Plants - PROTECTED ENDPOINTS
  getPlants: () => 
    fetch(`${API_BASE}/plants`, {
      headers: apiService.getAuthHeaders()
    }).then(res => {
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      return res.json();
    }),
    
  getUserDashboard: () =>
    fetch(`${API_BASE}/dashboard`, {
      headers: apiService.getAuthHeaders()
    }).then(res => {
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      return res.json();
    }),
    
  createPlant: (plantData) =>
    fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: apiService.getAuthHeaders(),
      body: JSON.stringify(plantData)
    }).then(res => {
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      return res.json();
    }),
    
  deletePlant: (plantId) =>
    fetch(`${API_BASE}/plants/${plantId}`, {
      method: 'DELETE',
      headers: apiService.getAuthHeaders()
    }).then(res => {
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      return res.json();
    }),

  // Species - PUBLIC ENDPOINTS
  getSpecies: () => 
    fetch(`${API_BASE}/species`).then(res => res.json()),
  
  createSpecies: (speciesData) =>
    fetch(`${API_BASE}/species`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(speciesData)
    }).then(res => res.json()),

  // Care Events - PROTECTED ENDPOINTS
  addCareEvent: (plantId, careData) =>
    fetch(`${API_BASE}/plants/${plantId}/care_events`, {
      method: 'POST',
      headers: apiService.getAuthHeaders(),
      body: JSON.stringify(careData)
    }).then(res => {
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      return res.json();
    })
};