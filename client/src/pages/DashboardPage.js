import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Dashboard from '../components/Dashboard';
import { apiService } from '../services/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto-login with demo credentials
  const handleAutoLogin = useCallback(async () => {
    try {
      setLoading(true);
      toast.info('Logging in with demo credentials...');
      
      const response = await apiService.login({
        username: 'plant_lover',
        password: 'password123'
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        setIsAuthenticated(true);
        toast.success('Logged in successfully!');
        return true;
      } else {
        toast.error('Login failed: ' + (response.message || 'Unknown error'));
        return false;
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      toast.error('Auto-login failed. Trying alternative user...');
      
      // Try second user
      try {
        const response2 = await apiService.login({
          username: 'green_thumb',
          password: 'password123'
        });
        
        if (response2.token) {
          localStorage.setItem('token', response2.token);
          setIsAuthenticated(true);
          toast.success('Logged in with alternative user!');
          return true;
        }
      } catch (error2) {
        toast.error('All auto-login attempts failed. Please check if database is seeded.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check database status
  const checkDatabaseStatus = useCallback(async () => {
    try {
      const response = await fetch('https://the-plant-parenthood-planner.onrender.com/check-data');
      const data = await response.json();
      console.log('Database status:', data);
      
      if (data.users_count === 0) {
        toast.warning('Database appears to be empty. Please seed the database.');
      }
      return data;
    } catch (error) {
      console.error('Error checking database:', error);
      toast.error('Cannot connect to database');
      return null;
    }
  }, []);

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    
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
      } else if (response && response.message) {
        throw new Error(response.message);
      }
      
      setUsers(usersData);
      
      if (usersData.length > 0 && !selectedUser) {
        setSelectedUser(usersData[0].id);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      if (error.message === 'Token is missing' || error.message === 'Token is invalid') {
        setIsAuthenticated(false);
        await handleAutoLogin();
      } else {
        toast.error('Error loading users: ' + error.message);
      }
      setUsers([]);
    }
  }, [isAuthenticated, selectedUser, handleAutoLogin]);

  const loadDashboard = useCallback(async (userId) => {
    if (!userId || !isAuthenticated) return;
    
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
      if (error.message === 'Token is missing' || error.message === 'Token is invalid') {
        setIsAuthenticated(false);
        await handleAutoLogin();
      } else {
        toast.error('Error loading dashboard: ' + error.message);
      }
      setDashboardData(null);
    }
    setLoading(false);
  }, [isAuthenticated, handleAutoLogin]);

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      // First check database status
      await checkDatabaseStatus();
      
      // Check if we have a token
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        // No token, try auto-login
        await handleAutoLogin();
      }
    };

    initializeApp();
  }, [checkDatabaseStatus, handleAutoLogin]);

  // Load users when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  // Load dashboard when user is selected
  useEffect(() => {
    if (selectedUser && isAuthenticated) {
      loadDashboard(selectedUser);
    }
  }, [selectedUser, isAuthenticated, loadDashboard]);

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

  const handleRetryLogin = async () => {
    setLoading(true);
    const success = await handleAutoLogin();
    if (success) {
      await loadUsers();
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access the dashboard</p>
            <button
              onClick={handleRetryLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Auto Login with Demo Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              
              <button
                onClick={handleRetryLogin}
                className="text-sm bg-gray-200 text-gray-700 py-1 px-3 rounded hover:bg-gray-300"
              >
                Reconnect
              </button>
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

        {/* Debug info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Users loaded: {users.length}</p>
          <p>Selected User: {selectedUser}</p>
          <p>Plants in dashboard: {dashboardData?.plants?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;