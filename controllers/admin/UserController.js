const User = require('../../models/User');

exports.userList = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users/index', { title: 'Quan ly user', users });
  } catch (err) {
    res.status(500).send('Loi lay danh sach user');
  }
};

exports.userUpdateRole = async (req, res) => {
  try {
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(req.body.role)) {
      return res.status(400).send('Role khong hop le');
    }

    await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    res.redirect('/admin/users');
  } catch (err) {
    res.status(500).send('Loi cap nhat quyen user');
  }
};
