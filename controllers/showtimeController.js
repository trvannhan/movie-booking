// ============================================
// controllers/showtimeController.js — Xử lý logic hiển thị sơ đồ ghế
// ============================================
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const { SERVICE_CATALOG, buildSeatMap } = require('../utils/booking');
const { PROMOTION_CATALOG } = require('../utils/promotions');

// GET /showtimes/:id/book — Hiển thị sơ đồ ghế + dịch vụ
exports.bookingPage = async (req, res) => {
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
};
