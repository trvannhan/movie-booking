// ============================================
// controllers/authController.js — Xử lý đăng ký, đăng nhập, đăng xuất
// ============================================
const User = require('../models/User');

// Hiển thị form đăng ký
exports.registerForm = (req, res) => {
  res.render('auth/register', { title: 'Đăng ký' });
};

// Xử lý đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Đăng ký',
        error: 'Tên đăng nhập hoặc email đã tồn tại!',
        formData: req.body
      });
    }

    // Tạo user mới (password tự động hash nhờ pre-save hook)
    await User.create({ username, email, password, fullName, phone });

    res.redirect('/auth/login');
  } catch (err) {
    res.render('auth/register', {
      title: 'Đăng ký',
      error: 'Lỗi đăng ký: ' + err.message,
      formData: req.body
    });
  }
};

// Hiển thị form đăng nhập
exports.loginForm = (req, res) => {
  res.render('auth/login', { title: 'Đăng nhập' });
};

// Xử lý đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user theo username
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('auth/login', {
        title: 'Đăng nhập',
        error: 'Sai tên đăng nhập hoặc mật khẩu!'
      });
    }

    // So sánh password
    const match = await user.comparePassword(password);
    if (!match) {
      return res.render('auth/login', {
        title: 'Đăng nhập',
        error: 'Sai tên đăng nhập hoặc mật khẩu!'
      });
    }

    // Lưu thông tin user vào session
    req.session.user = {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    };

    // Admin → dashboard, User → trang chủ
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/');
    }
  } catch (err) {
    res.render('auth/login', {
      title: 'Đăng nhập',
      error: 'Lỗi hệ thống: ' + err.message
    });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
