const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const locationRepo = require('../repositories/locationRepository');

// All endpoints require authentication
router.use(protect);

// === Common Routes ===
// GET /api/locations - Get all locations
router.get('/', locationRepo.getAllLocations);

// GET /api/locations/:id - Get location by ID
router.get('/:id', locationRepo.getLocationById);

// POST /api/locations/verify - Verify if coordinates are within a campus boundary
router.post('/verify', locationRepo.verifyLocationWithinCampus);

// === Admin Routes ===
// POST /api/locations - Create a new location (admin only)
router.post('/', locationRepo.createLocation);

// PUT /api/locations/:id - Update a location (admin only)
router.put('/:id', locationRepo.updateLocation);

// DELETE /api/locations/:id - Delete a location (admin only)
router.delete('/:id', locationRepo.deleteLocation);

module.exports = router; 