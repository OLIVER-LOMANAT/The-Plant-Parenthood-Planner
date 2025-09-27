import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Dashboard from '../components/Dashboard';
import { apiService } from '../services/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      console.log('Users response:', response);
      
      let usersData = [];
      if (Array.isArray(response)) {
        usersData = response;
      } else if (response && response.users) {
        usersData = response.users;
      } else if (response && response.data) {
        usersData = response.data;
      }
      
      setUsers(usersData);
      
      if (usersData.length > 0 && !selectedUser) {
        setSelectedUser(usersData[0].id);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users: ' + error.message);
      setUsers([]);
    }
  };

  const loadDashboard = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('Loading dashboard for user:', userId);
      const data = await apiService.getUserDashboard(userId);
      console.log('Dashboard data:', data);
      
      if (data && data.user) {
        setDashboardData(data);
      } else if (data && data.message) {
        throw new Error(data.message);
      } else {
        throw new Error('Invalid dashboard response');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error loading dashboard: ' + error.message);
      setDashboardData(null);
    }
    setLoading(false);
  };

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load dashboard when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadDashboard(selectedUser);
    }
  }, [selectedUser]);

  const handlePlantDelete = (plantId) => {
    setDashboardData(prev => ({
      ...prev,
      plants: prev.plants.filter(plant => plant.id !== plantId)
    }));
    toast.success('Plant deleted successfully!');
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plant Care Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage and monitor your plant collection</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <label htmlFor="user-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Viewing as:
              </label>
              <select
                id="user-select"
                value={selectedUser || ''}
                onChange={(e) => handleUserChange(parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 min-w-[150px]"
                disabled={!users.length}
              >
                <option value="">Select a user</option>
                {Array.isArray(users) && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <Dashboard 
            user={dashboardData?.user}
            plants={dashboardData?.plants || []}
            onPlantDelete={handlePlantDelete}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;