// routes/superAdminRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, getAllStudent, getAllTeacher, createCourses, updateUser ,createClass,updateStudent, updateTeacher, getAllCourse } = require('../controllers/superAdmin.controller');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply middleware to protect routes and restrict access to SuperAdmin only
router.use(protect);
router.use(authorize('SuperAdmin'));

// SuperAdmin specific routes

router.post('/createUser', createUser);
router.get('/getAllStudent', getAllStudent);
router.get('/getAllTeacher', getAllTeacher);
router.post('/createCourses', createCourses);
router.get('/getAllCourse', getAllCourse);
router.post('/createClass', createClass);
router.post('/updateUser/:userId', updateUser);
router.post("/updateStudent/:studentId", updateStudent);
router.post("/updateTeacher/:teacherId", updateTeacher);

// Additional SuperAdmin routes can be added here...

module.exports = router;
