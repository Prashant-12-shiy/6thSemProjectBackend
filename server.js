// app.js or index.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const superAdminRoutes = require('./routes/superadminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes')

dotenv.config();

const app = express();

connectDB();

// Middleware to parse JSON
app.use(express.json());

// Route middleware
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/auth', authRoutes)

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
