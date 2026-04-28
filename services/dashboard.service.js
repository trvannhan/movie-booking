const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

async function getDashboardData() {
  const [
    movieCount,
    showtimeCount,
    cinemaCount,
    roomCount,
    userCount,
    bookingCount,
    paidStats,
    recentBookings
  ] = await Promise.all([
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
      .populate({ path: 'showtimeId', populate: [{ path: 'movieId' }, { path: 'cinemaId' }, { path: 'roomId' }] })
      .populate('userId')
      .sort({ bookingDate: -1 })
      .limit(5)
  ]);

  const revenueStats = (paidStats && paidStats[0]) || { revenue: 0, paidBookings: 0 };

  const stats = {
    movieCount: movieCount || 0,
    showtimeCount: showtimeCount || 0,
    cinemaCount: cinemaCount || 0,
    roomCount: roomCount || 0,
    userCount: userCount || 0,
    bookingCount: bookingCount || 0,
    revenue: revenueStats.revenue || 0,
    paidBookings: revenueStats.paidBookings || 0
  };

  return {
    stats,
    recentBookings: recentBookings || []
  };

}

module.exports = { getDashboardData };
