const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Middleware xác thực nếu muốn bắt buộc đăng nhập để xem ghế - cho tạm bỏ qua để dễ test
const ensureAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/auth/login?redirect=' + req.originalUrl);
}

// Hiển thị sơ đồ ghế (Seat Map) và dịch vụ
router.get('/:id/book', ensureAuth, async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate('roomId')
      .populate('cinemaId');

    if (!showtime) return res.status(404).send('Showtime not found');

    const room = showtime.roomId;
    const movie = showtime.movieId;

    // Lấy các Booking đã tạo (để xác định ghế nào đã được mua)
    const bookings = await Booking.find({ showtimeId: showtime._id, status: { $ne: 'cancelled' } });
    const bookedSeats = [];
    bookings.forEach(b => {
      b.tickets.forEach(t => bookedSeats.push(t.code));
    });

    // ----------------------------------------
    // TV 2 - LOGIC TẠO MA TRẬN GHẾ (MATRIX YÊU CẦU 4)
    // ----------------------------------------
    // Giá: Giá cơ bản * Hệ số suất chiếu
    const currentBasePrice = movie.basePrice * showtime.priceMultiplier;
    
    // Mảng lưu sơ đồ
    const seatMap = [];
    
    // Tạo cấu trúc (A-Z) cho row
    for(let r = 0; r < room.rowCount; r++) {
       const rowLetter = String.fromCharCode(65 + r); // 65 = 'A'
       const rowSeats = [];
       
       // Kiểm tra xem dòng này có phải ghế đôi không
       const isCoupleRow = room.coupleRows.includes(rowLetter);
       const isVipRow = room.vipRows.includes(rowLetter);
       const seatsInThisRow = isCoupleRow ? Math.floor(room.colCount / 2) : room.colCount;
       
       for(let c = 1; c <= seatsInThisRow; c++) {
          const seatCode = `${rowLetter}${c}`;
          let type = 'regular';
          let price = currentBasePrice; // Giá ghế thường
          
          if (isVipRow) {
             type = 'vip';
             price = currentBasePrice + 15000; // Phụ phí VIP 15k
          } else if (isCoupleRow) {
             type = 'couple';
             price = currentBasePrice + 30000; // Phụ phí Ghế Đôi 30k
          }

          rowSeats.push({
             code: seatCode,
             type: type,
             price: price, // Giá tham khảo chính xác (YÊU CẦU 2)
             isBooked: bookedSeats.includes(seatCode)
          });
       }
       seatMap.push({ rowLetter, seats: rowSeats });
    }

    // Danh sách dịch vụ đi kèm (YÊU CẦU 3)
    const services = [
      { id: 'combo1', name: 'Combo Solo (1 Bắp + 1 Nước)', price: 65000 },
      { id: 'combo2', name: 'Combo Couple (1 Bắp + 2 Nước)', price: 95000 }
    ];

    res.render('showtimes/book', { 
       title: 'Đặt vé - Chọn ghế', 
       showtime, 
       seatMap, 
       services 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
