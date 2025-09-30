import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { apiService } from '../services/api';

const DashboardPage = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboard = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const data = await apiService.getUserDashboard();
      
      if (data && data.user) {
        setDashboardData(data);
      } else if (data && data.message) {
        throw new Error(data.message);
      } else {
        throw new Error('Invalid dashboard response');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.message === 'Not authenticated') {
        onLogout();
        navigate('/login');
      } else {
        toast.error('Error loading dashboard: ' + error.message);
      }
      setDashboardData(null);
    }
    setLoading(false);
  }, [user, navigate, onLogout]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handlePlantDelete = (plantId) => {
    setDashboardData(prev => ({
      ...prev,
      plants: prev.plants.filter(plant => plant.id !== plantId)
    }));
    toast.success('Plant deleted successfully!');
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      onLogout();
      navigate('/login');
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
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
      </div>
    </div>
  );
};

export default DashboardPage;