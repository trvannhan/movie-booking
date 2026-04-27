// ============================================
// routes/bookingRoutes.js — Routes đặt vé & thanh toán (MVC chuẩn)
// ============================================
const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');

// Middleware xác thực — cần đăng nhập để mua vé
const ensureAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/auth/login');
};

// Tạo đơn đặt vé mới
router.post('/checkout', ensureAuth, bookingCtrl.checkout);

// Lịch sử đặt vé của User
router.get('/history', ensureAuth, bookingCtrl.history);

// Hủy vé đang pending
router.get('/cancel/:id', ensureAuth, bookingCtrl.cancel);

// Trang thông báo thành công
router.get('/success', ensureAuth, bookingCtrl.successPage);

// Trang thanh toán QR
router.get('/:id/payment', ensureAuth, bookingCtrl.paymentPage);

// Xác nhận thanh toán
router.post('/:id/confirm', ensureAuth, bookingCtrl.confirmPayment);

// Hiển thị vé điện tử
router.get('/:id/ticket', ensureAuth, bookingCtrl.ticketPage);

module.exports = router;
