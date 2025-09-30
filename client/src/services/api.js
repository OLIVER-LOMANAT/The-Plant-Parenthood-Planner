const API_BASE = 'https://the-plant-parenthood-planner.onrender.com';

let authToken = localStorage.getItem('authToken');

export const apiService = {
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

  getAuthHeaders: () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.token) {
      apiService.setToken(data.token);
    }
    return data;
  },

  login: async (userData) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.token) {
      apiService.setToken(data.token);
    }
    return data;
  },

  logout: () => {
    apiService.clearToken();
    return Promise.resolve();
  },

  checkAuth: async () => {
    const response = await fetch(`${API_BASE}/check-auth`, {
      headers: apiService.getAuthHeaders()
    });
    return response.json();
  },

  getUserDashboard: async () => {
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: apiService.getAuthHeaders()
    });
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    return response.json();
  },

  getPlants: async () => {
    const response = await fetch(`${API_BASE}/plants`, {
      headers: apiService.getAuthHeaders()
    });
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    return response.json();
  },
    
  createPlant: async (plantData) => {
    const response = await fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: apiService.getAuthHeaders(),
      body: JSON.stringify(plantData)
    });
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    return response.json();
  },
    
  deletePlant: async (plantId) => {
    const response = await fetch(`${API_BASE}/plants/${plantId}`, {
      method: 'DELETE',
      headers: apiService.getAuthHeaders()
    });
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    return response.json();
  },

  getSpecies: () => 
    fetch(`${API_BASE}/species`).then(res => res.json()),
  
  createSpecies: (speciesData) =>
    fetch(`${API_BASE}/species`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(speciesData)
    }).then(res => res.json()),

  addCareEvent: async (plantId, careData) => {
    const response = await fetch(`${API_BASE}/plants/${plantId}/care_events`, {
      method: 'POST',
      headers: apiService.getAuthHeaders(),
      body: JSON.stringify(careData)
    });
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    return response.json();
  }
};