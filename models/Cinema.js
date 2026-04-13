const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String, default: 'https://via.placeholder.com/400x200?text=Cinema' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cinema', cinemaSchema);
