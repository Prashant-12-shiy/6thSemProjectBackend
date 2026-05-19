// models/Teacher.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = mongoose.Schema(
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
            enum: ['Teacher'],
            default: 'Teacher',
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        classInCharge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
        },
    },
    {
        timestamps: true,
    }
);

teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
