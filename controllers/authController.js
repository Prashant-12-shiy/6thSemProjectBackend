// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Assuming your User model is named User
const Student = require('../models/Student.model');
const Teacher = require("../models/Teacher.model")

const comparePassword = async (password, hashedPassword) => {
    try {
      if (!password || !hashedPassword) {
        throw new Error("Password or hashed password is missing");
      }
  
      const isMatch = await bcrypt.compare(password, hashedPassword);
      console.log(isMatch);
        
      return isMatch;
    } catch (error) {
      throw new Error("Error comparing passwords: " + error.message);
    }
  };

exports.registerSuperAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if SuperAdmin already exists
        const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });
        if (existingSuperAdmin) {
            return res.status(400).json({ message: 'SuperAdmin already exists' });
        }

        // Create new SuperAdmin
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSuperAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'SuperAdmin'
        });

        await newSuperAdmin.save();

        // Create and sign a JWT token
        const token = jwt.sign(
            { id: newSuperAdmin._id, role: newSuperAdmin.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            data: {
                id: newSuperAdmin._id,
                name: newSuperAdmin.name,
                email: newSuperAdmin.email,
                role: newSuperAdmin.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.loginSuperAdmin = async (req,res) => {
    const {email,password}= req.body;

    try {
        const user = await User.findOne({email});


        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        } 

        // Check if the role is SuperAdmin
        if (user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Access denied. SuperAdmin only.' });
        }
        console.log(user.password);
        
        // Check if the password matches
        // const isMatch = await comparePassword(password, user.password);
       

        // if (!isMatch) {
        //     return res.status(400).json({ message: 'Invalid email or password' });
        // }

        // Create and sign a JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });

    }
}
// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email }) || 
                     await Student.findOne({ email }) || 
                     await Teacher.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the password matches        
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
 

        // Create and sign a JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error occurred during login:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

