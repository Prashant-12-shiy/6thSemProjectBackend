// models/Student.js
const mongoose = require('mongoose');

const studentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rollNumber: {
            type: String,
            required: true,
            unique: true,
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        guardianName: {
            type: String,
            required: true,
        },
        guardianContact: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
