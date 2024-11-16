// models/Student.js
const mongoose = require('mongoose');

const studentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Student'],
            default: 'Student',
        },
        rollNumber: {
            type: String,
            required: true,
            unique: true,
        },
        profilePicture:  {
            type: String,
            default: "https://res.cloudinary.com/dkfh9sou7/image/upload/v1731670372/3bed97102466519a0f0ecda60d0f6ec0.jpg"
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
