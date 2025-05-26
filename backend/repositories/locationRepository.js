const { UniversityLocation } = require('../models');

// Helper function for distance calculation (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Common functionality
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await UniversityLocation.findAll();
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ message: 'Failed to fetch locations' });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await UniversityLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ message: 'Failed to fetch location' });
  }
};

// Verify if coordinates are within campus boundaries
exports.verifyLocationWithinCampus = async (req, res) => {
  try {
    const { latitude, longitude, locationId } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    let locations;
    if (locationId) {
      // Check specific location
      const location = await UniversityLocation.findByPk(locationId);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
      locations = [location];
    } else {
      // Check all locations
      locations = await UniversityLocation.findAll();
    }

    // Check if coordinates are within any of the locations
    for (const location of locations) {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        location.centerLatitude, 
        location.centerLongitude
      );

      if (distance <= location.radius) {
        return res.json({ 
          isWithinBoundary: true, 
          location: {
            locationId: location.locationId,
            campusName: location.campusName,
            distance: Math.round(distance)
          }
        });
      }
    }

    // If not within any location
    res.json({ 
      isWithinBoundary: false,
      message: 'The provided coordinates are not within any campus boundaries' 
    });
  } catch (err) {
    console.error('Error verifying location:', err);
    res.status(500).json({ message: 'Failed to verify location' });
  }
};

// Admin functionality
exports.createLocation = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create locations' });
    }

    const { campusName, centerLatitude, centerLongitude, radius } = req.body;
    
    // Validate required fields
    if (!campusName || !centerLatitude || !centerLongitude || !radius) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create location
    const location = await UniversityLocation.create({
      campusName,
      centerLatitude,
      centerLongitude,
      radius
    });

    res.status(201).json(location);
  } catch (err) {
    console.error('Error creating location:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A location with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to create location' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update locations' });
    }

    const location = await UniversityLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const { campusName, centerLatitude, centerLongitude, radius } = req.body;
    
    // Update location
    await location.update({
      campusName: campusName || location.campusName,
      centerLatitude: centerLatitude || location.centerLatitude,
      centerLongitude: centerLongitude || location.centerLongitude,
      radius: radius || location.radius
    });

    res.json(location);
  } catch (err) {
    console.error('Error updating location:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A location with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to update location' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete locations' });
    }

    const location = await UniversityLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    await location.destroy();
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ message: 'Failed to delete location' });
  }
}; 