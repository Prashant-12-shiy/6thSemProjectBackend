// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { getGrades, getAttendance, getCourses,getTask } = require('../controllers/student.controller');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply middleware to protect routes and restrict access to Students only
router.use(protect);
router.use(authorize('Student'));

// Student specific routes
router.get('/grades', getGrades);
router.get('/attendance', getAttendance);
router.get('/courses', getCourses);
router.get('/getTask', getTask)
// Additional Student routes can be added here...

module.exports = router;
