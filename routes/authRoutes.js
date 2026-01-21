const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Register a new user (Admin only)
router.post('/register', auth, authorize('ADMIN'), registerUser);

// Login user
router.post('/login', loginUser);

// Get authenticated user's profile
router.get('/me', auth, getMe);

module.exports = router;
