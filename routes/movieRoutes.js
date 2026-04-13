const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');

// Danh sách phim
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.render('movies/index', { title: 'Tất Phim Đang Chiếu', movies });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Chi tiết phim và lịch chiếu
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie not found');

    // Lấy các suất chiếu của phim này, populate Cinema để lấy tên Rạp
    // Sắp xếp theo rạp và thời gian
    const showtimes = await Showtime.find({ movieId: movie._id, startTime: { $gte: new Date() } })
                                    .populate('cinemaId')
                                    .populate('roomId')
                                    .sort({ startTime: 1 });

    // Nhóm suất chiếu theo rạp (Cinema)
    const groupedShowtimes = {};
    showtimes.forEach(st => {
      const cinemaName = st.cinemaId.name;
      if (!groupedShowtimes[cinemaName]) {
         groupedShowtimes[cinemaName] = [];
      }
      groupedShowtimes[cinemaName].push(st);
    });

    res.render('movies/show', { title: movie.title, movie, groupedShowtimes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
