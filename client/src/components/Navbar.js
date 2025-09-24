import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-green-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              🌿 PlantCare
            </Link>
          </div>
          
          <div className="flex space-x-4 items-center">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;