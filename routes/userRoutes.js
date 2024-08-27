// routes/userRoutes.js
const express = require('express');
const { getAllUsers, getUserById } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', protect, authorize('SuperAdmin'), getAllUsers);
router.get('/:id', protect, authorize('SuperAdmin', 'Admin'), getUserById);

module.exports = router;
