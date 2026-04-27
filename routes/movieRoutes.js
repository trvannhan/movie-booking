// ============================================
// routes/movieRoutes.js — Routes hiển thị phim (MVC chuẩn)
// ============================================
const express = require('express');
const router = express.Router();
const movieCtrl = require('../controllers/movieController');

// Danh sách phim (có tìm kiếm, lọc)
router.get('/', movieCtrl.index);

// Chi tiết phim + lịch chiếu theo rạp
router.get('/:id', movieCtrl.show);

module.exports = router;
