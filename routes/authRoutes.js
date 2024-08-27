// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, registerSuperAdmin,loginSuperAdmin } = require('../controllers/authController');

// Login route
router.post('/registerSuperAdmin', registerSuperAdmin);
router.post("/loginSuperAdmin", loginSuperAdmin)
router.post('/login', loginUser);

module.exports = router;
