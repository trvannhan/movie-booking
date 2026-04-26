const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  director: { type: String },
  cast: [{ type: String }],
  genre: [{ type: String }],
  duration: { type: Number, required: true }, // Phút
  releaseDate: { type: Date },
  posterUrl: { type: String, default: '/images/movie-poster.svg' },
  trailerUrl: { type: String },
  status: { type: String, enum: ['now_showing', 'coming_soon', 'ended'], default: 'now_showing' },
  basePrice: { type: Number, required: true, default: 70000 } // Giá tham khảo mặc định
});

module.exports = mongoose.model('Movie', movieSchema);
