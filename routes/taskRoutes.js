const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { createTask, getTaskById, getAllTasks, updateTask, assignTask } = require('../controllers/taskController');

const router = express.Router();

// Admin and Manager routes
router.post('/', auth, authorize(['ADMIN', 'MANAGER']), createTask);
router.get('/', auth, authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), getAllTasks);
router.get('/:id', auth, authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), getTaskById);
router.put('/:id', auth, authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), updateTask); // Employee can only update status if assigned
router.patch('/:id/assign', auth, authorize(['ADMIN', 'MANAGER']), assignTask);

module.exports = router;
