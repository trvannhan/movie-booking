// ============================================
// routes/movieRoutes.js — Routes phim (sẽ làm Sprint sau)
// ============================================
const express = require('express');
const router = express.Router();

// Tạm thời: danh sách phim
router.get('/', (req, res) => {
  res.render('movies/index', { title: 'Danh sách phim', movies: [] });
});

module.exports = router;
