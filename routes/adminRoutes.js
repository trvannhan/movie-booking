// ============================================
// routes/adminRoutes.js — Routes quản trị hệ thống (MVC chuẩn)
// ============================================
const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const adminCtrl = require('../controllers/adminController');

// Tất cả route admin cần đăng nhập + quyền admin
router.use(requireLogin);
router.use(requireAdmin);

// ---- Dashboard ----
router.get('/dashboard', adminCtrl.dashboard);

// ---- Quản lý Phim ----
router.get('/movies', adminCtrl.movieList);
router.get('/movies/new', adminCtrl.movieNewForm);
router.post('/movies/new', upload.single('poster'), adminCtrl.movieCreate);
router.get('/movies/:id/edit', adminCtrl.movieEditForm);
router.post('/movies/:id/edit', upload.single('poster'), adminCtrl.movieUpdate);
router.get('/movies/delete/:id', adminCtrl.movieDelete);

// ---- Quản lý Suất Chiếu ----
router.get('/showtimes', adminCtrl.showtimeList);
router.get('/showtimes/new', adminCtrl.showtimeNewForm);
router.post('/showtimes/new', adminCtrl.showtimeCreate);
router.get('/showtimes/:id/edit', adminCtrl.showtimeEditForm);
router.post('/showtimes/:id/edit', adminCtrl.showtimeUpdate);
router.get('/showtimes/delete/:id', adminCtrl.showtimeDelete);

// ---- Quản lý Rạp ----
router.get('/cinemas', adminCtrl.cinemaList);
router.get('/cinemas/new', adminCtrl.cinemaNewForm);
router.post('/cinemas/new', adminCtrl.cinemaCreate);
router.get('/cinemas/:id/edit', adminCtrl.cinemaEditForm);
router.post('/cinemas/:id/edit', adminCtrl.cinemaUpdate);
router.get('/cinemas/delete/:id', adminCtrl.cinemaDelete);

// ---- Quản lý User ----
router.get('/users', adminCtrl.userList);
router.post('/users/:id/role', adminCtrl.userUpdateRole);

// ---- Quản lý Hóa đơn ----
router.get('/bookings', adminCtrl.bookingList);
router.post('/bookings/status/:id', adminCtrl.bookingUpdateStatus);

module.exports = router;
