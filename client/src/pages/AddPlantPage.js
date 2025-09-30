import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlantForm from '../components/PlantForm';
import { toast } from 'react-toastify';

const AddPlantPage = ({ user }) => {
  const navigate = useNavigate();

  const handlePlantAdded = (plant) => {
    toast.success(`Plant ${plant.nickname} added successfully!`);
    navigate('/dashboard');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PlantForm onPlantAdded={handlePlantAdded} user={user} />
      </div>
    </div>
  );
};

export default AddPlantPage;