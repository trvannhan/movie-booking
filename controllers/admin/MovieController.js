const Movie = require('../../models/Movie');
const Showtime = require('../../models/Showtime');

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

exports.movieList = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ _id: -1 });
    res.render('admin/movies/index', { title: 'Quan ly Phim', movies });
  } catch (err) {
    res.status(500).send('Loi lay danh sach phim');
  }
};

exports.movieNewForm = (req, res) => {
  res.render('admin/movies/form', {
    title: 'Them Phim Moi',
    movie: {},
    formTitle: 'Them Phim Moi',
    formAction: '/admin/movies/new',
    submitLabel: 'Luu Phim Moi'
  });
};

exports.movieCreate = async (req, res) => {
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
};

exports.movieEditForm = async (req, res) => {
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
};

exports.movieUpdate = async (req, res) => {
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
};

exports.movieDelete = async (req, res) => {
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
};
