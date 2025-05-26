const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userRepo       = require('../repositories/userRepository');

// All user‑CRUD endpoints are admin‑only, so protect them
router.use(protect);

// GET    /api/users
router.get   ('/',        userRepo.getAllUsers);
// GET    /api/users/:id
router.get   ('/:id',     userRepo.getUserById);
// POST   /api/users
router.post  ('/',        userRepo.createUser);
// PUT    /api/users/:id
router.put   ('/:id',     userRepo.updateUser);
// DELETE /api/users/:id
router.delete('/:id',     userRepo.deleteUser);

module.exports = router;
