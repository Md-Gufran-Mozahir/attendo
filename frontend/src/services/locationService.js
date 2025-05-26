import api from './api';

/**
 * Get all university locations
 * @returns {Promise<Array>} - The list of university locations
 */
export const getAllLocations = async () => {
  return api.get('/api/locations');
};

/**
 * Get location by ID
 * @param {number} locationId - The ID of the location to fetch
 * @returns {Promise<Object>} - The location data
 */
export const getLocationById = async (locationId) => {
  return api.get(`/api/locations/${locationId}`);
};

/**
 * Create a new university location (admin only)
 * @param {Object} locationData - The location data to create
 * @returns {Promise<Object>} - The created location
 */
export const createLocation = async (locationData) => {
  return api.post('/api/locations', locationData);
};

/**
 * Update a university location (admin only)
 * @param {number} locationId - The ID of the location to update
 * @param {Object} locationData - The updated location data
 * @returns {Promise<Object>} - The updated location
 */
export const updateLocation = async (locationId, locationData) => {
  return api.put(`/api/locations/${locationId}`, locationData);
};

/**
 * Delete a university location (admin only)
 * @param {number} locationId - The ID of the location to delete
 * @returns {Promise<Object>} - The response from the server
 */
export const deleteLocation = async (locationId) => {
  return api.delete(`/api/locations/${locationId}`);
};

/**
 * Verify if coordinates are within a campus boundary
 * @param {Object} coordinateData - The coordinates to verify
 * @returns {Promise<Object>} - The verification result
 */
export const verifyLocationWithinCampus = async (coordinateData) => {
  return api.post('/api/locations/verify', coordinateData);
};

export default {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  verifyLocationWithinCampus
}; 