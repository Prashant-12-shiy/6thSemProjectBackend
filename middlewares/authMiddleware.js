const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');

exports.protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check for user in User, Student, or Teacher collections
        let user = await User.findById(decoded.id).select('-password');
        if (!user) {
            user = await Student.findById(decoded.id).select('-password');
        }
        if (!user) {
            user = await Teacher.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Middleware to restrict access based on role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'User role not authorized' });
        }
        next();
    };
};
