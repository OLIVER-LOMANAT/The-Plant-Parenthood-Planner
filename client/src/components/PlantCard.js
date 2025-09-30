import React from 'react';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const PlantCard = ({ plant, onPlantDelete }) => {
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${plant.nickname}?`)) {
      try {
        await apiService.deletePlant(plant.id);
        toast.success('Plant deleted successfully!');
        onPlantDelete(plant.id);
      } catch (error) {
        toast.error('Error deleting plant');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{plant.nickname}</h3>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Delete plant"
        >
          DELETE
        </button>
      </div>
      
      <div className="space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">Species:</span> {plant.species?.common_name}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Scientific Name:</span> {plant.species?.scientific_name}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Watering Frequency:</span> {plant.species?.watering_frequency}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Last Care Date:</span> {formatDate(plant.last_care_date)}
        </p>
        {plant.last_care_type && (
          <p className="text-gray-600">
            <span className="font-medium">Last Care Type:</span> {plant.last_care_type}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlantCard;