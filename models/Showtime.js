const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  // Hệ số giá cho các suất đặc biệt (VD: cuối tuần = 1.2, sáng sớm = 0.8), mặc định 1.0
  priceMultiplier: { type: Number, default: 1.0 }
});

module.exports = mongoose.model('Showtime', showtimeSchema);
