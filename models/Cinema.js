const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String, default: '/images/cinema-cover.svg' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cinema', cinemaSchema);
