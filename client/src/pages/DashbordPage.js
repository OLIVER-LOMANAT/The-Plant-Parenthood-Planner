import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Dashboard from '../components/Dashboard';
import { apiService } from '../services/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadDashboard(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      if (usersData.length > 0 && !selectedUser) {
        setSelectedUser(usersData[0].id);
      }
    } catch (error) {
      toast.error('Error loading users');
    }
  };

  const loadDashboard = async (userId) => {
    setLoading(true);
    try {
      const data = await apiService.getUserDashboard(userId);
      setDashboardData(data);
    } catch (error) {
      toast.error('Error loading dashboard');
      setDashboardData(null);
    }
    setLoading(false);
  };

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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plant Care Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage and monitor your plant collection</p>
            </div>
            
            {/* User Selector */}
            <div className="flex items-center space-x-3">
              <label htmlFor="user-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Viewing as:
              </label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={(e) => handleUserChange(parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 min-w-[150px]"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Component */}
        <Dashboard 
          user={dashboardData?.user}
          plants={dashboardData?.plants}
          onPlantDelete={handlePlantDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DashboardPage;