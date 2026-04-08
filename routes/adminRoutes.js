// ============================================
// routes/adminRoutes.js — Routes admin (sẽ làm Sprint sau)
// ============================================
const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');

// Tất cả route admin cần đăng nhập + quyền admin
router.use(requireLogin);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

module.exports = router;
