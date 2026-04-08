// ============================================
// routes/bookingRoutes.js — Routes đặt vé (sẽ làm Sprint sau)
// ============================================
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');

// Tất cả route booking cần đăng nhập
router.use(requireLogin);

router.get('/', (req, res) => {
  res.send('Trang đặt vé - đang phát triển');
});

module.exports = router;
