const Movie = require('../../models/Movie');
const Showtime = require('../../models/Showtime');
const Cinema = require('../../models/Cinema');
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');
const User = require('../../models/User');

exports.dashboard = async (req, res) => {
  try {
    const [movieCount, showtimeCount, cinemaCount, roomCount, userCount, bookingCount, paidStats, recentBookings] = await Promise.all([
      Movie.countDocuments(),
      Showtime.countDocuments(),
      Cinema.countDocuments(),
      Room.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
            paidBookings: { $sum: 1 }
          }
        }
      ]),
      Booking.find()
        .populate({ path: 'showtimeId', populate: { path: 'movieId cinemaId roomId' } })
        .populate('userId')
        .sort({ bookingDate: -1 })
        .limit(5)
    ]);

    const revenueStats = paidStats[0] || { revenue: 0, paidBookings: 0 };

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        movieCount,
        showtimeCount,
        cinemaCount,
        roomCount,
        userCount,
        bookingCount,
        revenue: revenueStats.revenue,
        paidBookings: revenueStats.paidBookings
      },
      recentBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Loi tai dashboard');
  }
};
