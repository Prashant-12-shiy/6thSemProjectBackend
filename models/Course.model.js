const mongoose = require('mongoose');

// Define an array of allowed course names including subjects common in Nepali schools
const courseNames = [
    "Math",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "Nepali",
    "Social Studies",
    "Moral Education",
    "Economics",
    "Art",
    "Geography",
    "History",
    "Health, Population and Environment",
    "Accountancy",
    "Business Studies",
    "Optional Mathematics",
    "Environment Science",
    "Sanskrit",
    "Physical Education",
    "Science"
];

const courseSchema = mongoose.Schema(
    {
        name: {
            type: String,
            enum: courseNames, // Use the enum property to restrict values to the predefined list
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
        },
        credits: {
            type: Number,
            required: true,
        },
        classes: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
        },
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
