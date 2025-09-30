import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const plantSchema = Yup.object().shape({
  nickname: Yup.string()
    .required('Nickname is required')
    .min(2, 'Nickname must be at least 2 characters'),
  species_id: Yup.number()
    .required('Species is required')
    .positive('Please select a species')
});

const PlantForm = ({ onPlantAdded, user }) => {
  const [species, setSpecies] = useState([]);
  const [showSpeciesForm, setShowSpeciesForm] = useState(false);

  useEffect(() => {
    loadSpecies();
  }, []);

  const loadSpecies = async () => {
    try {
      const response = await apiService.getSpecies();
      const speciesData = Array.isArray(response) ? response : response?.species || response?.data || [];
      setSpecies(speciesData);
    } catch (error) {
      toast.error('Error loading species');
      setSpecies([]);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await apiService.createPlant(values);
      if (result.message) {
        throw new Error(result.message);
      }
      toast.success('Plant added successfully!');
      resetForm();
      onPlantAdded(result);
    } catch (error) {
      toast.error(error.message || 'Error adding plant');
    }
    setSubmitting(false);
  };

  const handleAddSpecies = async (speciesData) => {
    try {
      const result = await apiService.createSpecies(speciesData);
      if (result.message) {
        throw new Error(result.message);
      }
      toast.success('Species added successfully!');
      setShowSpeciesForm(false);
      loadSpecies();
    } catch (error) {
      toast.error(error.message || 'Error adding species');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Plant</h2>
        
        <Formik
          initialValues={{
            nickname: '',
            species_id: ''
          }}
          validationSchema={plantSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                  Plant Nickname
                </label>
                <Field
                  type="text"
                  id="nickname"
                  name="nickname"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="e.g., Green Giant"
                />
                <ErrorMessage name="nickname" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="species_id" className="block text-sm font-medium text-gray-700">
                  Species
                </label>
                <button
                  type="button"
                  onClick={() => setShowSpeciesForm(!showSpeciesForm)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  {showSpeciesForm ? 'Cancel' : '+ Add New Species'}
                </button>
              </div>

              {showSpeciesForm ? (
                <NewSpeciesForm onAddSpecies={handleAddSpecies} />
              ) : (
                <Field
                  as="select"
                  id="species_id"
                  name="species_id"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Select a species</option>
                  {Array.isArray(species) && species.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.common_name} ({spec.scientific_name})
                    </option>
                  ))}
                </Field>
              )}
              <ErrorMessage name="species_id" component="div" className="text-red-500 text-sm mt-1" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding Plant...' : 'Add Plant'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const NewSpeciesForm = ({ onAddSpecies }) => {
  const speciesSchema = Yup.object().shape({
    common_name: Yup.string().required('Common name is required'),
    scientific_name: Yup.string().required('Scientific name is required'),
    watering_frequency: Yup.string().required('Watering frequency is required')
  });

  return (
    <Formik
      initialValues={{
        common_name: '',
        scientific_name: '',
        watering_frequency: ''
      }}
      validationSchema={speciesSchema}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        onAddSpecies(values);
        setSubmitting(false);
        resetForm();
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-3 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-700">Add New Species</h4>
          <div>
            <Field
              type="text"
              name="common_name"
              placeholder="Common Name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            <ErrorMessage name="common_name" component="div" className="text-red-500 text-sm" />
          </div>
          <div>
            <Field
              type="text"
              name="scientific_name"
              placeholder="Scientific Name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            <ErrorMessage name="scientific_name" component="div" className="text-red-500 text-sm" />
          </div>
          <div>
            <Field
              type="text"
              name="watering_frequency"
              placeholder="Watering Frequency"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            <ErrorMessage name="watering_frequency" component="div" className="text-red-500 text-sm" />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-700"
          >
            Add Species
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default PlantForm;