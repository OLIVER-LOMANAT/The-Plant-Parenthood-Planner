const API_BASE = process.env.REACT_APP_API_BASE || 'https://the-plant-parenthood-planner.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const apiService = {
  // Users
  getUsers: () => fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),
  
  getUser: (id) => fetch(`${API_BASE}/user/${id}`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),
  
  createUser: (userData) => 
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    }).then(res => res.json()),

  // Plants
  getPlants: (userId = null) => {
    const url = userId ? `${API_BASE}/plants?user_id=${userId}` : `${API_BASE}/plants`;
    return fetch(url, {
      headers: getAuthHeaders()
    }).then(res => res.json());
  },
  
  getUserPlants: (userId) => 
    fetch(`${API_BASE}/users/${userId}/plants`, {
      headers: getAuthHeaders()
    }).then(res => res.json()),
    
  getUserDashboard: (userId) =>
    fetch(`${API_BASE}/users/${userId}/dashboard`, {
      headers: getAuthHeaders()
    }).then(res => res.json()),
    
  createPlant: (plantData) =>
    fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(plantData)
    }).then(res => res.json()),
    
  deletePlant: (plantId) =>
    fetch(`${API_BASE}/plants/${plantId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(res => res.json()),

  // Species
  getSpecies: () => fetch(`${API_BASE}/species`, {
    headers: getAuthHeaders()
  }).then(res => res.json()),
  
  createSpecies: (speciesData) =>
    fetch(`${API_BASE}/species`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(speciesData)
    }).then(res => res.json()),

  // Care Events
  addCareEvent: (plantId, careData) =>
    fetch(`${API_BASE}/plants/${plantId}/care_events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(careData)
    }).then(res => res.json()),

  // Authentication
  login: (credentials) =>
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(credentials)
    }).then(res => res.json()),

  register: (userData) =>
    fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData)
    }).then(res => res.json())
};