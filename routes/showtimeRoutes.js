// ============================================
// routes/showtimeRoutes.js — Routes đặt vé chọn ghế (MVC chuẩn)
// ============================================
const express = require('express');
const router = express.Router();
const showtimeCtrl = require('../controllers/showtimeController');

// Middleware xác thực
const ensureAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/auth/login?redirect=' + req.originalUrl);
}

// Hiển thị sơ đồ ghế (Seat Map) và dịch vụ
router.get('/:id/book', ensureAuth, showtimeCtrl.bookingPage);

module.exports = router;
