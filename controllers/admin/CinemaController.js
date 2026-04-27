const Cinema = require('../../models/Cinema');
const Showtime = require('../../models/Showtime');
const Room = require('../../models/Room');

exports.cinemaList = async (req, res) => {
  try {
    const cinemas = await Cinema.find().sort({ createdAt: -1 });
    res.render('admin/cinemas/index', { title: 'Quan ly rap', cinemas });
  } catch (err) {
    res.status(500).send('Loi lay danh sach rap');
  }
};

exports.cinemaNewForm = (req, res) => {
  res.render('admin/cinemas/form', {
    title: 'Them rap',
    cinema: {},
    formTitle: 'Them Rap Moi',
    formAction: '/admin/cinemas/new',
    submitLabel: 'Luu Rap'
  });
};

exports.cinemaCreate = async (req, res) => {
  try {
    await Cinema.create({
      name: req.body.name?.trim(),
      address: req.body.address?.trim(),
      city: req.body.city?.trim(),
      image: req.body.image?.trim() || '/images/cinema-cover.svg'
    });
    res.redirect('/admin/cinemas');
  } catch (err) {
    res.status(500).send('Loi them rap');
  }
};

exports.cinemaEditForm = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) return res.status(404).send('Khong tim thay rap');

    res.render('admin/cinemas/form', {
      title: 'Chinh sua rap',
      cinema,
      formTitle: 'Chinh Sua Rap',
      formAction: `/admin/cinemas/${cinema._id}/edit`,
      submitLabel: 'Cap Nhat Rap'
    });
  } catch (err) {
    res.status(500).send('Loi tai form rap');
  }
};

exports.cinemaUpdate = async (req, res) => {
  try {
    await Cinema.findByIdAndUpdate(req.params.id, {
      name: req.body.name?.trim(),
      address: req.body.address?.trim(),
      city: req.body.city?.trim(),
      image: req.body.image?.trim() || '/images/cinema-cover.svg'
    });
    res.redirect('/admin/cinemas');
  } catch (err) {
    res.status(500).send('Loi cap nhat rap');
  }
};

exports.cinemaDelete = async (req, res) => {
  try {
    const showtimeCount = await Showtime.countDocuments({ cinemaId: req.params.id });

    if (showtimeCount > 0) {
      return res.status(400).send('Khong the xoa rap dang co suat chieu. Hay xoa het suat chieu truoc.');
    }

    // Xóa tất cả phòng chiếu thuộc rạp này trước
    await Room.deleteMany({ cinemaId: req.params.id });
    // Sau đó xóa rạp
    await Cinema.findByIdAndDelete(req.params.id);
    res.redirect('/admin/cinemas');
  } catch (err) {
    res.status(500).send('Loi xoa rap');
  }
};
