// ============================================
// controllers/movieController.js — Xử lý logic hiển thị Phim
// ============================================
const Movie = require("../models/Movie");
const Showtime = require("../models/Showtime");

// Helper: Chuyển URL YouTube thành dạng embed
const toYoutubeEmbedUrl = (url = "") => {
  if (!url) return "";

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const longMatch = url.match(/[?&]v=([^&]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

  if (url.includes("youtube.com/embed/")) return url;
  return url;
};

// GET /movies — Danh sách phim (có tìm kiếm, lọc)
exports.index = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";
  const genre = req.query.genre || "";
  const status = req.query.status || "";

  let query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (genre) {
    query.genre = genre;
  }

  if (status) {
    query.status = status;
  }

  const movies = await Movie.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Movie.countDocuments(query);

  const allGenres = await Movie.distinct("genre");

  res.render("movies/index", {
    title: "Danh sách phim",
    movies,
    allGenres,
    searchQuery: search,
    currentGenre: genre,
    currentStatus: status,
    currentPage: page || 1,
    totalPages: Math.ceil(total / limit) || 1,
  });
};

// GET /movies/:id — Chi tiết phim + lịch chiếu theo rạp
exports.show = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie not found");

    const showtimes = await Showtime.find({
      movieId: movie._id,
      startTime: { $gte: new Date() },
    })
      .populate("cinemaId")
      .populate("roomId")
      .sort({ startTime: 1 });

    const groupedShowtimes = {};
    showtimes.forEach((st) => {
      const cinemaName = st.cinemaId?.name || "Rap dang cap nhat";
      if (!groupedShowtimes[cinemaName]) groupedShowtimes[cinemaName] = [];
      groupedShowtimes[cinemaName].push(st);
    });

    res.render("movies/show", {
      title: movie.title,
      movie,
      groupedShowtimes,
      trailerEmbedUrl: toYoutubeEmbedUrl(movie.trailerUrl),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
