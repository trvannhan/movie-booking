const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// Cần đăng nhập để mua vé, đây là middleware cơ bản nội bộ
const ensureAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/auth/login');
}

// Xử lý tạo Booking POST request
router.post('/checkout', ensureAuth, async (req, res) => {
  try {
    const { showtimeId, ticketsData, servicesData, totalAmount } = req.body;
    
    // Parse JSON arrays từ Input text
    const parsedTickets = JSON.parse(ticketsData);
    const parsedServices = JSON.parse(servicesData);

    // Lưu vào database
    const newBooking = new Booking({
      userId: req.session.user.id,
      showtimeId: showtimeId,
      tickets: parsedTickets,       // [ {code: 'A1', type: 'regular', price: 70000} ]
      services: parsedServices,     // [ {name: 'Combo Solo', quantity: 1, price: 65000} ]
      totalAmount: parseInt(totalAmount)
    });

    await newBooking.save();

    // Redirec sang trang thanh toán QR
    res.redirect(`/bookings/${newBooking._id}/payment`);

  } catch (err) {
    console.error(err);
    res.status(500).send('Booking Error');
  }
});

// Trang thanh toán QR form (YÊU CẦU 5)
router.get('/:id/payment', ensureAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
         path: 'showtimeId',
         populate: { path: 'movieId roomId cinemaId' }
      });

    if(!booking) return res.status(404).send('Booking Not Found');

    // Mẫu API thông số VietQR:
    // https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
    // Giả lập tài khoản rạp phim
    const bankId = 'MB'; // MB Bank
    const accountNo = '0123456789';
    const amount = booking.totalAmount;
    const description = `Thanh toan ve thu ${booking._id.toString().substring(18)}`;
    const accountName = 'CINEBOOK CINEMA';
    
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;

    res.render('bookings/payment', { title: 'Thanh toán QR', booking, qrUrl });

  } catch(err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Mock Xác nhận thanh toán thành công
router.post('/:id/confirm', ensureAuth, async (req, res) => {
   try {
      await Booking.findByIdAndUpdate(req.params.id, { status: 'paid' });
      res.redirect('/bookings/success');
   } catch(e) {
      res.status(500).send('Lỗi');
   }
});

router.get('/success', ensureAuth, (req, res) => {
   res.render('bookings/success', { title: 'Đặt vé thành công' });
});

module.exports = router;
