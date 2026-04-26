const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { generateTicketCode } = require('../utils/ticket');

router.use(requireLogin);
router.use(requireAdmin);

const parseCommaList = (value = '') => value
  .split(',')
  .map(item => item.trim())
  .filter(Boolean);

const buildMoviePayload = (body, posterUrl) => ({
  title: body.title?.trim(),
  description: body.description?.trim(),
  director: body.director?.trim(),
  cast: parseCommaList(body.cast),
  genre: parseCommaList(body.genre),
  duration: Number(body.duration),
  releaseDate: body.releaseDate || null,
  posterUrl,
  trailerUrl: body.trailerUrl?.trim() || '',
  status: body.status,
  basePrice: Number(body.basePrice)
});

const loadShowtimeFormData = async () => {
  const [movies, cinemas, rooms] = await Promise.all([
    Movie.find({ status: { $in: ['now_showing', 'coming_soon'] } }).sort({ title: 1 }),
    Cinema.find().sort({ name: 1 }),
    Room.find().sort({ name: 1 })
  ]);

  return { movies, cinemas, rooms };
};

const validateShowtimeInput = async ({ movieId, cinemaId, roomId, startTime, endTime, priceMultiplier, ignoreId = null }) => {
  if (![movieId, cinemaId, roomId].every(id => mongoose.Types.ObjectId.isValid(id))) {
    return 'Du lieu phim, rap hoac phong chieu khong hop le';
  }

  const [movie, cinema, room] = await Promise.all([
    Movie.findById(movieId),
    Cinema.findById(cinemaId),
    Room.findById(roomId)
  ]);

  if (!movie || !cinema || !room) return 'Khong tim thay phim, rap hoac phong chieu';
  if (String(room.cinemaId) !== String(cinema._id)) return 'Phong chieu khong thuoc rap da chon';

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 'Thoi gian chieu khong hop le';
  }

  const overlapQuery = {
    roomId,
    _id: ignoreId ? { $ne: ignoreId } : { $exists: true },
    startTime: { $lt: end },
    endTime: { $gt: start }
  };
  const overlappedShowtime = await Showtime.findOne(overlapQuery);
  if (overlappedShowtime) return 'Phong chieu da co suat chieu trung thoi gian';

  const multiplier = Number(priceMultiplier);
  if (!Number.isFinite(multiplier) || multiplier <= 0) return 'He so gia ve khong hop le';

  return null;
};

router.get('/dashboard', async (req, res) => {
  try {
    const [movieCount, showtimeCount, cinemaCount, userCount, bookingCount, paidStats, recentBookings] = await Promise.all([
      Movie.countDocuments(),
      Showtime.countDocuments(),
      Cinema.countDocuments(),
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
});

router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ _id: -1 });
    res.render('admin/movies/index', { title: 'Quan ly Phim', movies });
  } catch (err) {
    res.status(500).send('Loi lay danh sach phim');
  }
});

router.get('/movies/new', (req, res) => {
  res.render('admin/movies/form', {
    title: 'Them Phim Moi',
    movie: {},
    formTitle: 'Them Phim Moi',
    formAction: '/admin/movies/new',
    submitLabel: 'Luu Phim Moi'
  });
});

router.post('/movies/new', upload.single('poster'), async (req, res) => {
  try {
    let posterUrl = req.body.posterUrl?.trim() || '/images/movie-poster.svg';
    if (req.file) posterUrl = `/uploads/${req.file.filename}`;

    const newMovie = new Movie(buildMoviePayload(req.body, posterUrl));
    await newMovie.save();
    res.redirect('/admin/movies');
  } catch (err) {
    console.error(err);
    res.status(500).send('Loi them phim');
  }
});

router.get('/movies/:id/edit', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Khong tim thay phim');

    res.render('admin/movies/form', {
      title: 'Chinh Sua Phim',
      movie,
      formTitle: 'Chinh Sua Phim',
      formAction: `/admin/movies/${movie._id}/edit`,
      submitLabel: 'Cap Nhat Phim'
    });
  } catch (err) {
    res.status(500).send('Loi tai form sua phim');
  }
});

router.post('/movies/:id/edit', upload.single('poster'), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Khong tim thay phim');

    let posterUrl = movie.posterUrl;
    if (req.file) {
      posterUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.posterUrl?.trim()) {
      posterUrl = req.body.posterUrl.trim();
    }

    Object.assign(movie, buildMoviePayload(req.body, posterUrl));
    await movie.save();
    res.redirect('/admin/movies');
  } catch (err) {
    console.error(err);
    res.status(500).send('Loi cap nhat phim');
  }
});

router.get('/movies/delete/:id', async (req, res) => {
  try {
    const linkedShowtimeCount = await Showtime.countDocuments({ movieId: req.params.id });
    if (linkedShowtimeCount > 0) {
      return res.status(400).send('Khong the xoa phim dang co suat chieu');
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.redirect('/admin/movies');
  } catch (err) {
    res.status(500).send('Loi xoa phim');
  }
});

router.get('/showtimes', async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movieId cinemaId roomId')
      .sort({ startTime: -1 });
    res.render('admin/showtimes/index', { title: 'Quan ly lich chieu', showtimes });
  } catch (err) {
    res.status(500).send('Loi lay danh sach lich chieu');
  }
});

router.get('/showtimes/new', async (req, res) => {
  try {
    const { movies, cinemas, rooms } = await loadShowtimeFormData();
    res.render('admin/showtimes/new', {
      title: 'Them suat chieu',
      movies,
      cinemas,
      rooms,
      showtime: {},
      formTitle: 'Tao Suat Chieu Moi',
      formAction: '/admin/showtimes/new',
      submitLabel: 'Phat Hanh Suat Chieu'
    });
  } catch (err) {
    res.status(500).send('Loi form suat chieu');
  }
});

router.post('/showtimes/new', async (req, res) => {
  try {
    const { movieId, cinemaId, roomId, startTime, endTime, priceMultiplier } = req.body;
    const validationError = await validateShowtimeInput({ movieId, cinemaId, roomId, startTime, endTime, priceMultiplier });
    if (validationError) return res.status(400).send(validationError);

    await Showtime.create({ movieId, cinemaId, roomId, startTime, endTime, priceMultiplier });
    res.redirect('/admin/showtimes');
  } catch (err) {
    res.status(500).send('Loi them lich chieu');
  }
});

router.get('/showtimes/:id/edit', async (req, res) => {
  try {
    const [showtime, formData] = await Promise.all([
      Showtime.findById(req.params.id),
      loadShowtimeFormData()
    ]);

    if (!showtime) return res.status(404).send('Khong tim thay suat chieu');

    res.render('admin/showtimes/new', {
      title: 'Chinh sua suat chieu',
      ...formData,
      showtime,
      formTitle: 'Chinh Sua Suat Chieu',
      formAction: `/admin/showtimes/${showtime._id}/edit`,
      submitLabel: 'Cap Nhat Suat Chieu'
    });
  } catch (err) {
    res.status(500).send('Loi tai form sua suat chieu');
  }
});

router.post('/showtimes/:id/edit', async (req, res) => {
  try {
    const { movieId, cinemaId, roomId, startTime, endTime, priceMultiplier } = req.body;
    const validationError = await validateShowtimeInput({
      movieId,
      cinemaId,
      roomId,
      startTime,
      endTime,
      priceMultiplier,
      ignoreId: req.params.id
    });
    if (validationError) return res.status(400).send(validationError);

    await Showtime.findByIdAndUpdate(req.params.id, { movieId, cinemaId, roomId, startTime, endTime, priceMultiplier });
    res.redirect('/admin/showtimes');
  } catch (err) {
    res.status(500).send('Loi cap nhat lich chieu');
  }
});

router.get('/showtimes/delete/:id', async (req, res) => {
  try {
    const linkedBookingCount = await Booking.countDocuments({ showtimeId: req.params.id });
    if (linkedBookingCount > 0) {
      return res.status(400).send('Khong the xoa suat chieu da co booking');
    }

    await Showtime.findByIdAndDelete(req.params.id);
    res.redirect('/admin/showtimes');
  } catch (err) {
    res.status(500).send('Loi xoa lich chieu');
  }
});

router.get('/cinemas', async (req, res) => {
  try {
    const cinemas = await Cinema.find().sort({ createdAt: -1 });
    res.render('admin/cinemas/index', { title: 'Quan ly rap', cinemas });
  } catch (err) {
    res.status(500).send('Loi lay danh sach rap');
  }
});

router.get('/cinemas/new', (req, res) => {
  res.render('admin/cinemas/form', {
    title: 'Them rap',
    cinema: {},
    formTitle: 'Them Rap Moi',
    formAction: '/admin/cinemas/new',
    submitLabel: 'Luu Rap'
  });
});

router.post('/cinemas/new', async (req, res) => {
  try {
    await Cinema.create({
      name: req.body.name?.trim(),
      address: req.body.address?.trim(),
      city: req.body.city?.trim(),
      image: req.body.image?.trim() || '/images/cinema-cover.svg'
    });
    res.redirect('/admin/cinemas');
  } catch (err) {
    res.status(500).send('Loi them rap');
  }
});

router.get('/cinemas/:id/edit', async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) return res.status(404).send('Khong tim thay rap');

    res.render('admin/cinemas/form', {
      title: 'Chinh sua rap',
      cinema,
      formTitle: 'Chinh Sua Rap',
      formAction: `/admin/cinemas/${cinema._id}/edit`,
      submitLabel: 'Cap Nhat Rap'
    });
  } catch (err) {
    res.status(500).send('Loi tai form rap');
  }
});

router.post('/cinemas/:id/edit', async (req, res) => {
  try {
    await Cinema.findByIdAndUpdate(req.params.id, {
      name: req.body.name?.trim(),
      address: req.body.address?.trim(),
      city: req.body.city?.trim(),
      image: req.body.image?.trim() || '/images/cinema-cover.svg'
    });
    res.redirect('/admin/cinemas');
  } catch (err) {
    res.status(500).send('Loi cap nhat rap');
  }
});

router.get('/cinemas/delete/:id', async (req, res) => {
  try {
    const [roomCount, showtimeCount] = await Promise.all([
      Room.countDocuments({ cinemaId: req.params.id }),
      Showtime.countDocuments({ cinemaId: req.params.id })
    ]);

    if (roomCount > 0 || showtimeCount > 0) {
      return res.status(400).send('Khong the xoa rap dang co phong hoac suat chieu');
    }

    await Cinema.findByIdAndDelete(req.params.id);
    res.redirect('/admin/cinemas');
  } catch (err) {
    res.status(500).send('Loi xoa rap');
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users/index', { title: 'Quan ly user', users });
  } catch (err) {
    res.status(500).send('Loi lay danh sach user');
  }
});

router.post('/users/:id/role', async (req, res) => {
  try {
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(req.body.role)) {
      return res.status(400).send('Role khong hop le');
    }

    await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    res.redirect('/admin/users');
  } catch (err) {
    res.status(500).send('Loi cap nhat quyen user');
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'showtimeId', populate: { path: 'movieId cinemaId roomId' } })
      .populate('userId')
      .sort({ bookingDate: -1 });
    res.render('admin/bookings/index', { title: 'Quan ly Hoa don', bookings });
  } catch (err) {
    res.status(500).send('Loi lay danh sach hoa don');
  }
});

router.post('/bookings/status/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send('Khong tim thay booking');

    booking.status = req.body.status;
    if (req.body.status === 'paid' && !booking.ticketCode) {
      booking.ticketCode = generateTicketCode(booking._id);
      booking.paidAt = new Date();
    }
    await booking.save();
    res.redirect('/admin/bookings');
  } catch (err) {
    res.status(500).send('Loi cap nhat trang thai');
  }
});

module.exports = router;
