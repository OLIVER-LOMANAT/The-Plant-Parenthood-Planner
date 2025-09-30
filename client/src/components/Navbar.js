import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Don't show navbar on login/signup pages if not authenticated
  if (!user && (location.pathname === '/login' || location.pathname === '/signup')) {
    return null;
  }

  return (
    <nav className="bg-green-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold flex items-center">
              <span className="text-2xl mr-2">🌿</span>
              PlantCare
            </Link>
          </div>
          
          <div className="flex space-x-4 items-center">
            {user ? (
              // Show when user is logged in
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'bg-green-700 text-white' 
                      : 'text-green-100 hover:bg-green-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/add-plant" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/add-plant' 
                      ? 'bg-green-700 text-white' 
                      : 'text-green-100 hover:bg-green-700'
                  }`}
                >
                  Add Plant
                </Link>
                <span className="text-green-100 text-sm">
                  Welcome, {user.username}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              // Show when user is not logged in
              <>
                <Link 
                  to="/login" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/login' 
                      ? 'bg-green-700 text-white' 
                      : 'text-green-100 hover:bg-green-700'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/signup' 
                      ? 'bg-green-700 text-white' 
                      : 'text-green-100 hover:bg-green-700'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;