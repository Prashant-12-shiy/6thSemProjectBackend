// controllers/studentController.js
const Student = require("../models/Student.model");
const Attendance = require("../models/Attendance.model");
const Grade = require("../models/Grade.model");
const Course = require("../models/Course.model");
const { populate } = require("dotenv");

// Get student's grades
exports.getGrades = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "Student not found in request" });
    }

    const user = req.user._id;

    const student = await Student.findOne({ user: user._id });

    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }

    const grades = await Grade.find({ student: student._id }).populate({
      path: "course",
      select: "name", // Select the course name
      populate: {
        path: "teacher",
        select: "user",
        populate: {
          path: "user",
          select: "name",
        },
      },
    });
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: "Error fetching grades", error });
  }
};

// Get student's attendance
exports.getAttendance = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "Student not found in request" });
    }

    const user = req.user;

    const student = await Student.findOne({ user: user._id });

    const attendance = await Attendance.find({ student: student._id });

    if (!attendance) {
      return res.status(400).json({ message: "Attendance not found" });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error });
  }
};

// Get student's courses
// Get student's courses
exports.getCourses = async (req, res) => {
  try {
    // Find the student by ID and populate the class field
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "Student not found in request" });
    }

    const user = req.user;

    const student = await Student.findOne({ user: user._id });

    // Handle case where student is not found
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find all courses associated with the student's class
    const courses = await Course.find({ classes: student.class._id }).populate({
      path: "teacher",
      select: "user",
      populate: { path: "user", select: "name" },
    }).populate({
        path: "classes",
        select: " name"
    });

    // Respond with the courses
    res.status(200).json(courses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
};

// Other Student-specific actions can be added here...
