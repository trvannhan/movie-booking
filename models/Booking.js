const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  code: { type: String, required: true }, // VD: 'A1', 'J1-couple'
  type: { type: String, enum: ['regular', 'vip', 'couple'], default: 'regular' },
  price: { type: Number, required: true }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  tickets: [seatSchema],
  services: [serviceSchema],
  subtotalAmount: { type: Number, default: 0 },
  discountCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  ticketCode: { type: String, default: '' },
  paidAt: { type: Date },
  // Thông tin mã QR
  paymentMethod: { type: String, default: 'QR_CODE' }
});

module.exports = mongoose.model('Booking', bookingSchema);
