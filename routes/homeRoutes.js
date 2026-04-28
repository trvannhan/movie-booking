const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

router.get('/', async (req, res) => {
  const movies = await Movie.find().limit(5);

  res.render('home', {
    title: 'Trang chủ',
    movies
  });
});

module.exports = router;
