const Room = require('../../models/Room');
const Cinema = require('../../models/Cinema');
const Showtime = require('../../models/Showtime');

const parseCommaList = (value = '') => value
  .split(',')
  .map(item => item.trim())
  .filter(Boolean);

exports.roomList = async (req, res) => {
  try {
    const rooms = await Room.find().populate('cinemaId').sort({ cinemaId: 1, name: 1 });
    res.render('admin/rooms/index', { title: 'Quan ly phong chieu', rooms });
  } catch (err) {
    res.status(500).send('Loi lay danh sach phong');
  }
};

exports.roomNewForm = async (req, res) => {
  try {
    const cinemas = await Cinema.find().sort({ name: 1 });
    res.render('admin/rooms/form', {
      title: 'Them phong chieu',
      room: {},
      cinemas,
      formTitle: 'Them Phong Chieu Moi',
      formAction: '/admin/rooms/new',
      submitLabel: 'Tao Phong'
    });
  } catch (err) {
    res.status(500).send('Loi tai form phong');
  }
};

exports.roomCreate = async (req, res) => {
  try {
    await Room.create({
      cinemaId: req.body.cinemaId,
      name: req.body.name?.trim(),
      rowCount: parseInt(req.body.rowCount) || 10,
      colCount: parseInt(req.body.colCount) || 12,
      vipRows: parseCommaList(req.body.vipRows),
      coupleRows: parseCommaList(req.body.coupleRows)
    });
    res.redirect('/admin/rooms');
  } catch (err) {
    res.status(500).send('Loi them phong');
  }
};

exports.roomEditForm = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).send('Khong tim thay phong');
    const cinemas = await Cinema.find().sort({ name: 1 });
    res.render('admin/rooms/form', {
      title: 'Chinh sua phong chieu',
      room,
      cinemas,
      formTitle: 'Chinh Sua Phong Chieu',
      formAction: `/admin/rooms/${room._id}/edit`,
      submitLabel: 'Cap Nhat Phong'
    });
  } catch (err) {
    res.status(500).send('Loi tai form phong');
  }
};

exports.roomUpdate = async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, {
      cinemaId: req.body.cinemaId,
      name: req.body.name?.trim(),
      rowCount: parseInt(req.body.rowCount) || 10,
      colCount: parseInt(req.body.colCount) || 12,
      vipRows: parseCommaList(req.body.vipRows),
      coupleRows: parseCommaList(req.body.coupleRows)
    });
    res.redirect('/admin/rooms');
  } catch (err) {
    res.status(500).send('Loi cap nhat phong');
  }
};

exports.roomDelete = async (req, res) => {
  try {
    const showtimeCount = await Showtime.countDocuments({ roomId: req.params.id });
    if (showtimeCount > 0) {
      return res.status(400).send('Khong the xoa phong dang co suat chieu');
    }
    await Room.findByIdAndDelete(req.params.id);
    res.redirect('/admin/rooms');
  } catch (err) {
    res.status(500).send('Loi xoa phong');
  }
};
