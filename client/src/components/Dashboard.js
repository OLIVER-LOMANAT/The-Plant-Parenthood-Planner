import React from 'react';
import PlantCard from './PlantCard';

const Dashboard = ({ user, plants, onPlantDelete, loading }) => {
  console.log('Dashboard component rendering with:', { 
    user: user?.username, 
    plantsCount: plants?.length,
    loading 
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl text-gray-600">Loading plants...</div>
      </div>
    );
  }

  if (!plants || plants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌱</div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">No plants yet</h4>
        <p className="text-gray-600 mb-4">Start by adding your first plant to your collection!</p>
        <a 
          href="/add-plant" 
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Add Your First Plant
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-gray-600">
          You have {plants.length} plant{plants.length !== 1 ? 's' : ''} in your care.
        </p>
      </div>

      {/* Plants grid - simplified */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Plants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map(plant => (
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              onPlantDelete={onPlantDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;