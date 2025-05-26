const express = require('express');
const router  = express.Router();
const authRepo   = require('../repositories/authRepository');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/login',    authRepo.login);
router.post('/register', authRepo.register);

// Token verification endpoint
router.get('/verify', protect, (req, res) => {
  // If middleware passes, token is valid
  return res.status(200).json({ 
    message: 'Token is valid',
    user: req.user 
  });
});

// Protected (JWT)
router.get   ('/profile', protect, authRepo.getProfile);
router.put   ('/profile', protect, authRepo.updateProfile);
router.delete('/profile', protect, authRepo.deleteProfile);

module.exports = router;
