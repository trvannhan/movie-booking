// ============================================
// routes/adminRoutes.js — Routes quản trị hệ thống (MVC chuẩn)
// ============================================
const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Import individual controllers
const dashboardCtrl = require('../controllers/admin/DashboardController');
const movieCtrl = require('../controllers/admin/MovieController');
const showtimeCtrl = require('../controllers/admin/ShowtimeController');
const cinemaCtrl = require('../controllers/admin/CinemaController');
const roomCtrl = require('../controllers/admin/RoomController');
const userCtrl = require('../controllers/admin/UserController');
const bookingCtrl = require('../controllers/admin/BookingController');

// Tất cả route admin cần đăng nhập + quyền admin
router.use(requireLogin);
router.use(requireAdmin);

// ---- Dashboard ----
router.get('/dashboard', dashboardCtrl.dashboard);

// ---- Quản lý Phim ----
router.get('/movies', movieCtrl.movieList);
router.get('/movies/new', movieCtrl.movieNewForm);
router.post('/movies/new', upload.single('poster'), movieCtrl.movieCreate);
router.get('/movies/:id/edit', movieCtrl.movieEditForm);
router.post('/movies/:id/edit', upload.single('poster'), movieCtrl.movieUpdate);
router.get('/movies/delete/:id', movieCtrl.movieDelete);

// ---- Quản lý Suất Chiếu ----
router.get('/showtimes', showtimeCtrl.showtimeList);
router.get('/showtimes/new', showtimeCtrl.showtimeNewForm);
router.post('/showtimes/new', showtimeCtrl.showtimeCreate);
router.get('/showtimes/:id/edit', showtimeCtrl.showtimeEditForm);
router.post('/showtimes/:id/edit', showtimeCtrl.showtimeUpdate);
router.get('/showtimes/delete/:id', showtimeCtrl.showtimeDelete);

// ---- Quản lý Rạp ----
router.get('/cinemas', cinemaCtrl.cinemaList);
router.get('/cinemas/new', cinemaCtrl.cinemaNewForm);
router.post('/cinemas/new', cinemaCtrl.cinemaCreate);
router.get('/cinemas/:id/edit', cinemaCtrl.cinemaEditForm);
router.post('/cinemas/:id/edit', cinemaCtrl.cinemaUpdate);
router.get('/cinemas/delete/:id', cinemaCtrl.cinemaDelete);

// ---- Quản lý Phòng chiếu ----
router.get('/rooms', roomCtrl.roomList);
router.get('/rooms/new', roomCtrl.roomNewForm);
router.post('/rooms/new', roomCtrl.roomCreate);
router.get('/rooms/:id/edit', roomCtrl.roomEditForm);
router.post('/rooms/:id/edit', roomCtrl.roomUpdate);
router.get('/rooms/delete/:id', roomCtrl.roomDelete);

// ---- Quản lý User ----
router.get('/users', userCtrl.userList);
router.post('/users/:id/role', userCtrl.userUpdateRole);

// ---- Quản lý Hóa đơn ----
router.get('/bookings', bookingCtrl.bookingList);
router.post('/bookings/status/:id', bookingCtrl.bookingUpdateStatus);

module.exports = router;
