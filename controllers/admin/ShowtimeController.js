const mongoose = require('mongoose');
const Movie = require('../../models/Movie');
const Showtime = require('../../models/Showtime');
const Cinema = require('../../models/Cinema');
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');

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

exports.showtimeList = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movieId cinemaId roomId')
      .sort({ startTime: -1 });
    res.render('admin/showtimes/index', { title: 'Quan ly lich chieu', showtimes });
  } catch (err) {
    res.status(500).send('Loi lay danh sach lich chieu');
  }
};

exports.showtimeNewForm = async (req, res) => {
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
};

exports.showtimeCreate = async (req, res) => {
  try {
    const { movieId, cinemaId, roomId, startTime, endTime, priceMultiplier } = req.body;
    const validationError = await validateShowtimeInput({ movieId, cinemaId, roomId, startTime, endTime, priceMultiplier });
    if (validationError) return res.status(400).send(validationError);

    await Showtime.create({ movieId, cinemaId, roomId, startTime, endTime, priceMultiplier });
    res.redirect('/admin/showtimes');
  } catch (err) {
    res.status(500).send('Loi them lich chieu');
  }
};

exports.showtimeEditForm = async (req, res) => {
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
};

exports.showtimeUpdate = async (req, res) => {
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
};

exports.showtimeDelete = async (req, res) => {
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
};
