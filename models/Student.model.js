// models/Student.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
