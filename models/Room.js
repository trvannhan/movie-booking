const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  name: { type: String, required: true },
  // Tiêu chuẩn ghế: Số dòng và số cột (VD: 10 rows x 12 cols)
  rowCount: { type: Number, required: true, default: 10 },
  colCount: { type: Number, required: true, default: 12 },
  // Định nghĩa loại ghế trên các hàng cụ thể để render map
  // Ví dụ: VIP từ hàng E đến H, Couple ở 2 hàng cuối
  vipRows: [{ type: String }],     // VD: ['E', 'F', 'G', 'H']
  coupleRows: [{ type: String }]   // VD: ['J']
});

module.exports = mongoose.model('Room', roomSchema);
