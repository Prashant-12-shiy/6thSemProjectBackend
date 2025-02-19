// routes/superAdminRoutes.js
const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllStudent,
  getStudent,
  getAllTeacher,
  createCourses,
  updateUser,
  createClass,
  updateStudent,
  updateTeacher,
  getAllCourse,
  getCourseBySuperAdmin,
  updateCouse,
  createStudent,
  createTeacher,
  getAllClasses,
  deleteClass,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  createNotice,
  updateNotice,
  deleteNotice,
  getNotice
} = require("../controllers/superAdmin.controller");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Apply middleware to protect routes and restrict access to SuperAdmin only
router.use(protect);
router.use(authorize("SuperAdmin"));

// SuperAdmin specific routes

// router.post('/createUser', createUser);
router.post("/createStudent", createStudent);
router.post("/createTeacher", createTeacher);
router.get("/getAllStudent", getAllStudent);
router.get("/getStudent/:id", getStudent);
router.get("/getAllTeacher", getAllTeacher);
router.post("/createCourses", createCourses);
router.get("/getAllCourse", getAllCourse);
router.get("/getCourse/:courseId", getCourseBySuperAdmin)
router.patch("/updateCourse/:id", updateCouse)
router.delete("/deleteClass/:id", deleteClass);
router.post("/createClass", createClass);
router.get("/getAllClass", getAllClasses)
router.post("/updateUser/:userId", updateUser);
router.post("/updateStudent/:studentId", updateStudent);
router.post("/updateTeacher/:teacherId", updateTeacher);
router.post("/createEvent", createEvent);
router.patch("/updateEvent/:id", updateEvent );
router.delete("/deleteEvent/:id", deleteEvent);
router.get("/getAllEvent", getEvent);
router.post("/createNotice", createNotice);
router.patch("/updateNotice/:id", updateNotice );
router.delete("/deleteNotice/:id", deleteNotice);
router.get("/getAllNotice", getNotice)
// Additional SuperAdmin routes can be added here...

module.exports = router;
