// controllers/superAdminController.js
const User = require("../models/User");
const Teacher = require("../models/Teacher.model");
const Student = require("../models/Student.model");
const Course = require("../models/Course.model");
const Class = require("../models/Class.model");
const Event = require("../models/Event.model");
const Notice = require("../models/Notice.model");

// Create a new user (Admin, Teacher, Student)
exports.createStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    rollNumber,
    profilePicture,
    className,
    guardianName,
    guardianContact,
  } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // const newUser = new User({ name, email, password, role });
    // await newUser.save();

    // if (role === "Teacher") {
    //   const teacher = new Teacher({ user: newUser._id, course });
    //   await teacher.save();
    // } else if (role === "Student") {
    //   const classDoc = await Class.findOne({ name: className });

    //   if (!classDoc) {
    //     return res.status(404).json({ message: "Class not found" });
    //   }

    const classDoc = await Class.findOne({ name: className });

    if (!classDoc) {
      return res.status(404).json({ message: "Class Not Found" });
    }

    const student = new Student({
      name: name,
      email: email,
      password: password,
      role: role,
      profilePicture,
      class: classDoc._id,
      rollNumber,
      guardianName,
      guardianContact,
    });
    await student.save();

    classDoc.students.push(student._id);
    await classDoc.save();
    // }

    res.status(201).json({ message: `Student created successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error creating Student", error });
  }
};

exports.createTeacher = async (req, res) => {
  const { name, email, password, role, course, classInCharge } = req.body;

  // Check if the user is SuperAdmin
  if (req.user.role !== "SuperAdmin") {
    // console.log("Access denied - user is not SuperAdmin");
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(404).json({ message: "Teacher already exisits" });
    }
    // Check if the class exists
    // Find class document and verify existence
    const classDoc = await Class.findOne({ name: classInCharge });
    if (!classDoc) {
      // console.log("Class not found:", classInCharge);
      return res.status(404).json({ message: "Class not found" });
    } else {
      // console.log("Class found:", classDoc);
    }

    // Find course document and verify existence
    const courseDoc = await Course.findOne({ name: course });
    if (!courseDoc) {
      // console.log("Course not found:", course);
      return res.status(404).json({ message: "Course not found" });
    } else {
      // console.log("Course found:", courseDoc);
    }

    // console.log("Creating teacher...");
    // Create and save the teacher
    const teacher = new Teacher({
      name,
      email,
      password,
      role,
      course: courseDoc._id,
      classInCharge: classDoc._id,
    });
    await teacher.save();
    // console.log("Teacher created successfully:", teacher);

    if (classDoc && courseDoc) {
      // console.log("Updating class and course with teacher reference");
      if (classDoc.teacherInCharge) {
        return res.status(409).json({
          message: "This class already has a teacher assigned"
        })
      }
      classDoc.teacherInCharge = teacher._id;
      await classDoc.save();

      courseDoc.teacher = teacher._id;
      await courseDoc.save();
    } else {
      console.error("classDoc or courseDoc became null unexpectedly.");
      return res.status(500).json({
        message: "Failed to update class or course with teacher reference",
      });
    }

    res.status(201).json({ message: "Teacher created successfully" });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ message: "Error creating Teacher", error });
  }
};

// Get all users
exports.getAllStudent = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const users = await Student.find({}).populate("class", "name");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

exports.getAllTeacher = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const teachers = await Teacher.find({})
      .populate("course", "name code")
      .populate("classInCharge", "name");

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

exports.getStudent = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const id = req.params.id;
    const users = await Student.findById(id).populate("class", "name");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Make sure to hash the password before saving

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

exports.updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const {
    name,
    email,
    password,
    rollNumber,
    className,
    guardianName,
    guardianContact,
  } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // console.log(student);

    let classDoc;
    if (className) {
      classDoc = await Class.findOne({ name: className });

      if (!classDoc) {
        return res.status(404).json({ message: "Class not found" });
      }
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (password) student.password = password;
    if (rollNumber) student.rollNumber = rollNumber;
    if (classDoc) student.class = classDoc._id;
    if (guardianName) student.guardianName = guardianName;
    if (guardianContact) student.guardianContact = guardianContact;

    await student.save();

    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    // console.error("Error updating student:", error);
    res.status(500).json({
      message: "Error updating student",
      error: error.message || error,
    });
  }
};

exports.updateTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { name, email, password, courseName, classInCharge } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    let classDoc;
    if (classInCharge) {
      classDoc = await Class.findOne({ name: classInCharge });

      if (!classDoc) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (classDoc.teacherInCharge) {
        return res.status(409).json({
      message: "This class already has a teacher assigned",
        })
      }
    }

    let course;
    if (courseName) {
      course = await Course.findOne({ name: courseName });

      if (!course) {
        return res.status(404).json({ message: "Couse not found" });
      }

      if(course.teacher) {
        return res.status(409).json({
          message: "Teacher is already assigend to this course"
        })
      }
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (password) teacher.password = password;
    if (classDoc) teacher.classInCharge = classDoc._id;
    if (course) teacher.course = course._id;

    await teacher.save();

    if (course) {
      course.teacher = teacher._id;
      await course.save();
    }

    res.status(200).json({ message: "Teacher updated successfully", teacher });
  } catch (error) {
    res.status(500).json({
      message: "Error updating student",
      error: error.message || error,
    });
  }
};

exports.createCourses = async (req, res) => {
  const { courses } = req.body; // Expecting an array of course objects

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const createdCourses = [];

    for (const courseData of courses) {
      const { name, code, description, teacherName, credits, className } =
        courseData;

      let teacher = null;
      // Find the teacher by name
      if (teacherName) {
        const user = await User.findOne({ name: teacherName });
        if (!user) {
          return res
            .status(404)
            .json({ message: `User with name ${teacherName} not found` });
        }

        teacher = await Teacher.findOne({ user: user._id })._id;
        if (!teacher) {
          return res
            .status(404)
            .json({ message: `Teacher ${teacherName} not found` });
        }
      }

      // Find the class by name
      const classDetail = await Class.findOne({ name: className });
      if (!classDetail) {
        return res
          .status(404)
          .json({ message: `Class with name ${className} not found` });
      }

      // Check if the course already exists for the class
      const existingCourse = await Course.findOne({
        name,
        classes: classDetail._id,
      });
      if (existingCourse) {
        return res.status(400).json({
          message: `Course ${name} already exists in class ${className}`,
        });
      }

      // Create the course
      const course = new Course({
        name,
        code,
        description,
        teacher: teacher,
        credits,
        classes: classDetail._id, // Associate course with the provided class ID
      });

      await course.save();

      // Update the teacher with the new course
      if (teacher) {
        await Teacher.findByIdAndUpdate(teacher._id, {
          $addToSet: { courses: course._id },
        });
      }

      createdCourses.push(course);
    }

    return res.status(201).json({
      message: "Courses created successfully",
      courses: createdCourses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating courses", error: error.message });
  }
};

exports.updateCouse = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, code, description, credits, className } = req.body;

    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const classDetail = await Class.findOne({ name: className });
    if (!classDetail) {
      return res
        .status(404)
        .json({ message: `Class with name ${className} not found` });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(400).json({
        message: `Course doesnot exists in class ${className}`,
      });
    }

    const updatedcourse = await Course.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(code && { code }),
        ...(credits && { credits }),
        ...(description && { description }),
        classes: classDetail._id,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Course updated Successfully", updatedcourse });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating courses", error: error.message });
  }
};

exports.getAllCourse = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const courses = await Course.find({}).populate("teacher", "name").populate("classes", "name");
    return res.status(200).json(courses);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error geting courses", error: error.message });
  }
};


exports.getCourseBySuperAdmin = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  const id = req.params.courseId;
  try {
    const course = await Course.findById(id).populate("teacher", "name").populate("classes", "name");
    if (!course) {
      return res.status(400).json({
        message: `Course doesnot exists in class ${className}`,
      });
    }
    return res.status(200).json(course);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error geting course", error: error.message });
  }
};

exports.createClass = async (req, res) => {
  const { name, section, students, teacherName } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    let teacherInCharge = null;
    if (teacherName) {
      teacherInCharge = await Teacher.findOne({ name: teacherName });

      // If the teacher is not found, respond with an error
      if (!teacherInCharge) {
        return res.status(404).json({ message: "Teacher not found" });
      }
    }
    const classes = new Class({ name, section, students, teacherInCharge });
    await classes.save();

    if (teacherInCharge) {
      await Teacher.findByIdAndUpdate(teacherInCharge._id, {
        classInCharge: classes._id,
      });
    }
    return res
      .status(201)
      .json({ message: "Class created successfully", name });
  } catch (error) {
    return res.status(500).json({ message: "Error creating class", error });
  }
};

exports.getAllClasses = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const classes = await Class.find({}).populate("teacherInCharge", "name");

    return res.status(200).json(classes);
  } catch (error) {
    return res.status(500).json({ message: "Error geting class", error });
  }
};

exports.deleteClass = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const id = req.params.id;
    const classes = await Class.findByIdAndDelete(id);

    if (!classes) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res
      .status(200)
      .json({ message: "Class deleted successfully", classes });
  } catch (error) {
    return res.status(500).json({ message: "Error geting class", error });
  }
};

exports.createEvent = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { name, date, venue, description } = req.body;

    const existingEvent = await Event.findOne({ name });
    if (existingEvent) {
      return res.status(404).json({ message: "Event Already exists" });
    }

    const event = new Event({
      name,
      date,
      venue,
      description,
    });
    await event.save();

    return res.status(201).json({ message: "New event created", event });
  } catch (error) {
    console.error("Error creating event:", error); // Log the error details
    return res.status(500).json({ message: "Error creating event", error });
  }
};

exports.getEvent = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const event = await Event.find({});

    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ message: "Error geting event", error });
  }
};

exports.updateEvent = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { name, date, venue, description } = req.body;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        ...(name && { name }),
        ...(date && { date }),
        ...(venue && { venue }),
        ...(description && { description }),
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Event updated successfully", updatedEvent });
  } catch (error) {
    return res.status(500).json({ message: "Error creating event", error });
  }
};

exports.deleteEvent = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const id = req.params.id;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res
      .status(200)
      .json({ message: "Event deleted successfully", event });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting event", error });
  }
};
// Other SuperAdmin-specific actions can be added here...


exports.createNotice = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { name, date, description } = req.body;

    const existingNotice = await Notice.findOne({ name });
    if (existingNotice) {
      return res.status(404).json({ message: "Notice Already exists" });
    }

    const notice = new Notice({
      name,
      date,
      description,
    });
    await notice.save();

    return res.status(201).json({ message: "New notice created", notice });
  } catch (error) {
    console.error("Error creating notice:", error); // Log the error details
    return res.status(500).json({ message: "Error creating notice", error });
  }
};

exports.getNotice = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const notice = await Notice.find({});

    return res.status(200).json(notice);
  } catch (error) {
    return res.status(500).json({ message: "Error geting notice", error });
  }
};

exports.updateNotice = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { name, date, description } = req.body;
    const noticeId = req.params.id;

    const notice = await Event.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const updatedNotice = await Event.findByIdAndUpdate(
      noticeId,
      {
        ...(name && { name }),
        ...(date && { date }),
        ...(description && { description }),
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Notice updated successfully", updatedNotice });
  } catch (error) {
    return res.status(500).json({ message: "Error creating notice", error });
  }
};

exports.deleteNotice = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const id = req.params.id;
    const notice = await Notice.findByIdAndDelete(id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    return res
      .status(200)
      .json({ message: "Notice deleted successfully", notice });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting notice", error });
  }
};
// Other SuperAdmin-specific actions can be added here...
