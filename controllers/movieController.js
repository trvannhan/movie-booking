// ============================================
// controllers/movieController.js — Xử lý logic hiển thị Phim
// ============================================
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

// Helper: Chuyển URL YouTube thành dạng embed
const toYoutubeEmbedUrl = (url = '') => {
  if (!url) return '';

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const longMatch = url.match(/[?&]v=([^&]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

  if (url.includes('youtube.com/embed/')) return url;
  return url;
};

// GET /movies — Danh sách phim (có tìm kiếm, lọc)
exports.index = async (req, res) => {
  try {
    const query = {};

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.genre) {
      query.genre = req.query.genre;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [movies, allGenres] = await Promise.all([
      Movie.find(query).sort({ status: 1, releaseDate: -1, title: 1 }),
      Movie.distinct('genre')
    ]);

    res.render('movies/index', {
      title: req.query.search ? `Tim kiem: ${req.query.search}` : 'Tat ca phim',
      movies,
      searchQuery: req.query.search || '',
      allGenres: allGenres.filter(Boolean).sort(),
      currentGenre: req.query.genre || '',
      currentStatus: req.query.status || ''
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// GET /movies/:id — Chi tiết phim + lịch chiếu theo rạp
exports.show = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie not found');

    const showtimes = await Showtime.find({
      movieId: movie._id,
      startTime: { $gte: new Date() }
    })
      .populate('cinemaId')
      .populate('roomId')
      .sort({ startTime: 1 });

    const groupedShowtimes = {};
    showtimes.forEach(st => {
      const cinemaName = st.cinemaId?.name || 'Rap dang cap nhat';
      if (!groupedShowtimes[cinemaName]) groupedShowtimes[cinemaName] = [];
      groupedShowtimes[cinemaName].push(st);
    });

    res.render('movies/show', {
      title: movie.title,
      movie,
      groupedShowtimes,
      trailerEmbedUrl: toYoutubeEmbedUrl(movie.trailerUrl)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
