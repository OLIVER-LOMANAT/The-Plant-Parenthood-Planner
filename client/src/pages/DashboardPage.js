import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { apiService } from '../services/api';

const DashboardPage = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading dashboard data...');
        const data = await apiService.getUserDashboard();
        console.log('Dashboard response:', data);
        
        if (data && data.user) {
          setDashboardData(data);
        } else {
          setError('Failed to load dashboard data');
          toast.error('Failed to load dashboard');
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error.message);
        toast.error('Error loading dashboard: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, navigate]);

  const handlePlantDelete = (plantId) => {
    setDashboardData(prev => ({
      ...prev,
      plants: prev.plants.filter(plant => plant.id !== plantId)
    }));
    toast.success('Plant deleted successfully!');
  };

  const handleManualLogout = async () => {
    try {
      await apiService.logout();
      onLogout();
      navigate('/login');
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    
    const loadDashboard = async () => {
      try {
        const data = await apiService.getUserDashboard();
        
        if (data && data.user) {
          setDashboardData(data);
        } else {
          setError('Failed to load dashboard data');
          toast.error('Failed to load dashboard');
        }
      } catch (error) {
        setError(error.message);
        toast.error('Error loading dashboard: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  };

  // Check what's actually happening
  console.log('DashboardPage state:', { loading, error, hasData: !!dashboardData, user });

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
                onClick={handleManualLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-red-800 font-medium">Failed to load dashboard</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-4 text-gray-600">Loading your plants...</span>
          </div>
        ) : dashboardData ? (
          <Dashboard 
            user={dashboardData.user}
            plants={dashboardData.plants || []}
            onPlantDelete={handlePlantDelete}
            loading={loading}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No dashboard data available</p>
            <button
              onClick={handleRetry}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Load Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;