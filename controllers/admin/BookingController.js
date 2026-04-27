const Booking = require('../../models/Booking');
const { generateTicketCode } = require('../../utils/ticket');

exports.bookingList = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'showtimeId', populate: { path: 'movieId cinemaId roomId' } })
      .populate('userId')
      .sort({ bookingDate: -1 });
    res.render('admin/bookings/index', { title: 'Quan ly Hoa don', bookings });
  } catch (err) {
    res.status(500).send('Loi lay danh sach hoa don');
  }
};

exports.bookingUpdateStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send('Khong tim thay booking');

    booking.status = req.body.status;
    if (req.body.status === 'paid' && !booking.ticketCode) {
      booking.ticketCode = generateTicketCode(booking._id);
      booking.paidAt = new Date();
    }
    await booking.save();
    res.redirect('/admin/bookings');
  } catch (err) {
    res.status(500).send('Loi cap nhat trang thai');
  }
};
