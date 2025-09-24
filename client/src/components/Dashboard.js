import React from 'react';
import PlantCard from './PlantCard';

const Dashboard = ({ user, plants, onPlantDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl text-gray-600">Loading plants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-gray-600">
          You have {plants?.length || 0} plant{plants?.length !== 1 ? 's' : ''} in your care.
        </p>
        
        {/* Quick Stats */}
        {plants && plants.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Needs Water</h3>
              <p className="text-2xl font-bold text-green-600">
                {plants.filter(plant => {
              
                  const lastWaterDate = new Date(plant.last_care_date);
                  const daysSinceWater = Math.floor((new Date() - lastWaterDate) / (1000 * 60 * 60 * 24));
                  return daysSinceWater > 7; // Example threshold
                }).length}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Recently Cared For</h3>
              <p className="text-2xl font-bold text-blue-600">
                {plants.filter(plant => {
                  const lastCareDate = new Date(plant.last_care_date);
                  const daysSinceCare = Math.floor((new Date() - lastCareDate) / (1000 * 60 * 60 * 24));
                  return daysSinceCare <= 2;
                }).length}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">No Care Record</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {plants.filter(plant => !plant.last_care_date).length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plants Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Plant Collection</h3>
        
        {plants && plants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map(plant => (
              <PlantCard 
                key={plant.id} 
                plant={plant} 
                onPlantDelete={onPlantDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
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
        )}
      </div>

      {/* Care Schedule Preview */}
      {plants && plants.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Care Schedule</h3>
          <div className="space-y-3">
            {plants.slice(0, 3).map(plant => (
              <div key={plant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{plant.nickname}</span>
                  <span className="text-gray-600 ml-2">({plant.species?.common_name})</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last cared: {plant.last_care_date ? 
                    new Date(plant.last_care_date).toLocaleDateString() : 'Never'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;