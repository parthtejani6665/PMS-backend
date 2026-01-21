const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { createUser, getAllUsers, getUserById, updateUser, activateDeactivateUser } = require('../controllers/userController');

const router = express.Router();

// Admin only routes
router.post('/', auth, authorize('ADMIN'), createUser);
router.get('/', auth, authorize('ADMIN'), getAllUsers);
router.get('/:id', auth, authorize('ADMIN'), getUserById);
router.put('/:id', auth, authorize('ADMIN'), updateUser);
router.patch('/:id/status', auth, authorize('ADMIN'), activateDeactivateUser);

module.exports = router;
