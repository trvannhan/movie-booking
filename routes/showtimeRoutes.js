const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const { SERVICE_CATALOG, buildSeatMap } = require('../utils/booking');
const { PROMOTION_CATALOG } = require('../utils/promotions');

// Middleware xác thực nếu muốn bắt buộc đăng nhập để xem ghế - cho tạm bỏ qua để dễ test
const ensureAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/auth/login?redirect=' + req.originalUrl);
}

// Hiển thị sơ đồ ghế (Seat Map) và dịch vụ
router.get('/:id/book', ensureAuth, async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate('roomId')
      .populate('cinemaId');

    if (!showtime) return res.status(404).send('Showtime not found');

    const room = showtime.roomId;
    const movie = showtime.movieId;

    // Lấy các Booking đã tạo (để xác định ghế nào đã được mua)
    const bookings = await Booking.find({ showtimeId: showtime._id, status: { $ne: 'cancelled' } });
    const bookedSeats = [];
    bookings.forEach(b => {
      b.tickets.forEach(t => bookedSeats.push(t.code));
    });

    const seatMap = buildSeatMap(room, movie, showtime, bookedSeats);

    res.render('showtimes/book', { 
       title: 'Đặt vé - Chọn ghế', 
       showtime, 
       seatMap, 
       services: SERVICE_CATALOG,
       promotions: PROMOTION_CATALOG
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
