// ============================================
// controllers/bookingController.js — Xử lý logic đặt vé, thanh toán, lịch sử
// ============================================
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { buildSeatMap, getSeatLookup, normalizeServices } = require('../utils/booking');
const { generateTicketCode, buildTicketQrUrl } = require('../utils/ticket');

// Helper: parse JSON array an toàn
const parseJsonArray = (input) => {
  if (!input) return [];
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

// POST /bookings/checkout — Tạo đơn đặt vé mới
exports.checkout = async (req, res) => {
  try {
    const { showtimeId, ticketsData, servicesData, totalAmount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
      return res.status(400).send('Suat chieu khong hop le');
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate('movieId')
      .populate('roomId')
      .populate('cinemaId');

    if (!showtime || !showtime.movieId || !showtime.roomId) {
      return res.status(404).send('Khong tim thay suat chieu');
    }

    const requestedTickets = parseJsonArray(ticketsData);
    const requestedServices = parseJsonArray(servicesData);
    const requestedSeatCodes = [...new Set(
      requestedTickets
        .map(ticket => typeof ticket?.code === 'string' ? ticket.code.trim().toUpperCase() : '')
        .filter(Boolean)
    )];

    if (requestedSeatCodes.length === 0) {
      return res.status(400).send('Ban phai chon it nhat 1 ghe');
    }

    const existingBookings = await Booking.find({
      showtimeId,
      status: { $ne: 'cancelled' }
    });

    const bookedSeats = new Set();
    existingBookings.forEach(booking => {
      booking.tickets.forEach(ticket => bookedSeats.add(ticket.code));
    });

    const seatMap = buildSeatMap(showtime.roomId, showtime.movieId, showtime, [...bookedSeats]);
    const seatLookup = getSeatLookup(seatMap);
    const unavailableSeats = requestedSeatCodes.filter(code => bookedSeats.has(code));

    if (unavailableSeats.length > 0) {
      return res.status(409).send(`Ghe da duoc dat: ${unavailableSeats.join(', ')}`);
    }

    const validatedTickets = requestedSeatCodes.map(code => {
      const seat = seatLookup.get(code);
      if (!seat) return null;
      return {
        code: seat.code,
        type: seat.type,
        price: seat.price
      };
    }).filter(Boolean);

    if (validatedTickets.length !== requestedSeatCodes.length) {
      return res.status(400).send('Co ghe khong hop le trong yeu cau dat ve');
    }

    const validatedServices = normalizeServices(requestedServices);
    const subtotalAmount = validatedTickets.reduce((sum, ticket) => sum + ticket.price, 0)
      + validatedServices.reduce((sum, service) => sum + (service.price * service.quantity), 0);

    const finalAmount = subtotalAmount;

    if (Number(totalAmount) !== finalAmount) {
      console.warn('Client total mismatch', {
        bookingUser: req.session.user.id,
        showtimeId,
        clientTotal: Number(totalAmount),
        calculatedTotal: finalAmount
      });
    }

    const newBooking = new Booking({
      userId: req.session.user.id,
      showtimeId,
      tickets: validatedTickets,
      services: validatedServices,
      subtotalAmount,
      totalAmount: finalAmount
    });

    await newBooking.save();
    res.redirect(`/bookings/${newBooking._id}/payment`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Booking Error');
  }
};

// GET /bookings/history — Lịch sử đặt vé của User
exports.history = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.session.user.id })
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId cinemaId roomId' }
      })
      .sort({ bookingDate: -1 });

    res.render('bookings/history', { title: 'Ve cua toi', bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send('Loi lay lich su');
  }
};

// GET /bookings/cancel/:id — Hủy vé đang pending
exports.cancel = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.session.user.id });
    if (!booking) return res.status(404).send('Khong tim thay don');

    if (booking.status === 'pending') {
      booking.status = 'cancelled';
      await booking.save();
    }
    res.redirect('/bookings/history');
  } catch (err) {
    res.status(500).send('Loi huy ve');
  }
};

// GET /bookings/:id/payment — Trang thanh toán QR
exports.paymentPage = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.session.user.id })
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId roomId cinemaId' }
      });

    if (!booking) return res.status(404).send('Booking Not Found');

    const bankId = 'MB';
    const accountNo = '0123456789';
    const amount = booking.totalAmount;
    const description = `Thanh toan ve ${booking._id.toString().substring(18)}`;
    const accountName = 'CINEBOOK CINEMA';
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;

    res.render('bookings/payment', { title: 'Thanh toan QR', booking, qrUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// POST /bookings/:id/confirm — Xác nhận thanh toán
exports.confirmPayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.session.user.id });
    if (!booking) return res.status(404).send('Khong tim thay don ve');
    if (booking.status === 'cancelled') return res.status(400).send('Don ve da bi huy');

    booking.status = 'paid';
    booking.paidAt = new Date();
    if (!booking.ticketCode) {
      booking.ticketCode = generateTicketCode(booking._id);
    }
    await booking.save();

    res.redirect(`/bookings/${booking._id}/ticket`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Loi');
  }
};

// GET /bookings/:id/ticket — Hiển thị vé điện tử
exports.ticketPage = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.session.user.id })
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId roomId cinemaId' }
      });

    if (!booking) return res.status(404).send('Khong tim thay ve');
    if (booking.status !== 'paid') return res.redirect(`/bookings/${booking._id}/payment`);

    const ticketQrUrl = buildTicketQrUrl(booking);
    res.render('bookings/ticket', { title: 'Ve dien tu', booking, ticketQrUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Khong the tai ve');
  }
};

// GET /bookings/success — Trang thông báo thành công
exports.successPage = (req, res) => {
  res.render('bookings/success', { title: 'Dat ve thanh cong' });
};
