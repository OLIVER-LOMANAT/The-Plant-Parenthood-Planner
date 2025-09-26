const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5555';

export const apiService = {
  // Users
  getUsers: () => fetch(`${API_BASE}/users`).then(res => res.json()),
  getUser: (id) => fetch(`${API_BASE}/user/${id}`).then(res => res.json()),
  createUser: (userData) => 
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(res => res.json()),

  // Plants
  getPlants: (userId = null) => {
    const url = userId ? `${API_BASE}/plants?user_id=${userId}` : `${API_BASE}/plants`;
    return fetch(url).then(res => res.json());
  },
  getUserPlants: (userId) => 
    fetch(`${API_BASE}/users/${userId}/plants`).then(res => res.json()),
  getUserDashboard: (userId) =>
    fetch(`${API_BASE}/users/${userId}/dashboard`).then(res => res.json()),
  createPlant: (plantData) =>
    fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plantData)
    }).then(res => res.json()),
  deletePlant: (plantId) =>
    fetch(`${API_BASE}/plants/${plantId}`, {
      method: 'DELETE'
    }).then(res => res.json()),

  // Species
  getSpecies: () => fetch(`${API_BASE}/species`).then(res => res.json()),
  createSpecies: (speciesData) =>
    fetch(`${API_BASE}/species`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(speciesData)
    }).then(res => res.json()),

  // Care Events
  addCareEvent: (plantId, careData) =>
    fetch(`${API_BASE}/plants/${plantId}/care_events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(careData)
    }).then(res => res.json())
};
