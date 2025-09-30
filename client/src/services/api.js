const API_BASE = process.env.REACT_APP_API_BASE || 'https://the-plant-parenthood-planner.onrender.com';

export const apiService = {
  // Authentication
  register: (userData) => 
    fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData),
      credentials: 'include'
    }).then(res => res.json()),

  login: (userData) => 
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userData),
      credentials: 'include'
    }).then(res => res.json()),

  logout: () => 
    fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    }).then(res => res.json()),

  checkAuth: () => 
    fetch(`${API_BASE}/check-auth`, {
      credentials: 'include'
    }).then(res => res.json()),

  // Users
  getUsers: () => fetch(`${API_BASE}/users`).then(res => res.json()),
  
  getUser: (id) => fetch(`${API_BASE}/user/${id}`).then(res => res.json()),

  // Plants
  getPlants: () => 
    fetch(`${API_BASE}/plants`, {
      credentials: 'include'
    }).then(res => res.json()),
    
  getUserDashboard: () =>
    fetch(`${API_BASE}/dashboard`, {
      credentials: 'include'
    }).then(res => res.json()),
    
  createPlant: (plantData) =>
    fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(plantData),
      credentials: 'include'
    }).then(res => res.json()),
    
  deletePlant: (plantId) =>
    fetch(`${API_BASE}/plants/${plantId}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(res => res.json()),

  // Species
  getSpecies: () => fetch(`${API_BASE}/species`).then(res => res.json()),
  
  createSpecies: (speciesData) =>
    fetch(`${API_BASE}/species`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(speciesData)
    }).then(res => res.json()),

  // Care Events
  addCareEvent: (plantId, careData) =>
    fetch(`${API_BASE}/plants/${plantId}/care_events`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(careData),
      credentials: 'include'
    }).then(res => res.json())
};