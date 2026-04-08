// ============================================
// config/db.js — Kết nối MongoDB
// ============================================
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/movie_booking';

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

module.exports = mongoose;
