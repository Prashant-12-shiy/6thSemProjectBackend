// controllers/studentController.js
const jwt = require('jsonwebtoken');
const Student = require("../models/Student.model");
const Attendance = require("../models/Attendance.model");
const Grade = require("../models/Grade.model");
const Course = require("../models/Course.model");
const Task = require("../models/Task.model")

exports.getMyDetails = async (req,res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in your environment
    const userId = decodedToken.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    // Fetch the user details using the user ID
    const user = await Student.findById(userId).populate("class", "name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user details in the response
    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: user,
    });


  } catch (error) {
    console.error("Error fetching Students", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Get student's grades
exports.getGrades = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "Student not found in request" });
    }

    const student = await Student.findById(req.user._id );

    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }

    const grades = await Grade.find({ student: student._id }).populate({
      path: "course",
      select: "name", // Select the course name
      populate: {
        path: "teacher",
        select: "name",
        // populate: {
        //   path: "user",
        //   select: "name",
        // },
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
;
    const student = await Student.findById(req.user._id);

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

    const student = await Student.findById(req.user._id );

    // Handle case where student is not found
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find all courses associated with the student's class
    const courses = await Course.find({ classes: student.class._id }).populate({
      path: "teacher",
      select: "name"
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

exports.getTask = async (req,res) => {
  try {
    const task = await Task.find({ assignedTo: req.user.class })
    .populate({
      path: 'teacher', // Populate teacher field
      select: 'course',
      populate: {
        path: 'course', // Populate course field inside teacher
        select: 'name',
        model: 'Course', // Specify the model for the course
      },
    });

    
    if(!task) {
      return res.status(404).json({message: "There is not task for you"});
    }

    res.status(201).json({message: "Task Fetch SuccessFully", task});

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Task", error: error.message || error});
  }
}

// Other Student-specific actions can be added here...
