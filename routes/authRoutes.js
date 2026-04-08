// ============================================
// routes/authRoutes.js — Routes đăng ký, đăng nhập, đăng xuất
// ============================================
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

// Đăng ký
router.get('/register', authCtrl.registerForm);   // GET  /auth/register → hiện form
router.post('/register', authCtrl.register);       // POST /auth/register → xử lý

// Đăng nhập
router.get('/login', authCtrl.loginForm);           // GET  /auth/login → hiện form
router.post('/login', authCtrl.login);              // POST /auth/login → xử lý

// Đăng xuất
router.get('/logout', authCtrl.logout);             // GET  /auth/logout → xóa session

module.exports = router;
