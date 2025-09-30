import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AddPlantPage from './pages/AddPlantPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { apiService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
      const result = await apiService.checkAuth();
      console.log('🔍 Auth check result:', result);
      
      if (result.authenticated && result.user) {
        setUser(result.user);
        console.log('✅ User authenticated:', result.user.username);
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    console.log('✅ Login successful, setting user:', userData.username);
    setUser(userData);
  };

  const handleLogout = async () => {
    console.log('🔄 Manual logout initiated');
    try {
      await apiService.logout();
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      console.log('🔴 Clearing user state');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <SignupPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/add-plant" 
            element={
              user ? <AddPlantPage user={user} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;