const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { createProject, getProjectById, getAllProjects, updateProject, assignManager } = require('../controllers/projectController');

const router = express.Router();

// Admin only routes
router.post('/', auth, authorize('ADMIN'), createProject);
router.put('/:id/assign-manager', auth, authorize('ADMIN'), assignManager);

// Admin and Manager routes
router.get('/', auth, authorize(['ADMIN', 'MANAGER']), getAllProjects);
router.get('/:id', auth, authorize(['ADMIN', 'MANAGER']), getProjectById);
router.put('/:id', auth, authorize(['ADMIN', 'MANAGER']), updateProject);

module.exports = router;
