// ============================================
// middleware/auth.js — Middleware phân quyền
// ============================================

// Middleware 1: Yêu cầu đăng nhập
// → Chặn user chưa login truy cập trang cần đăng nhập
exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware 2: Yêu cầu quyền Admin
// → Chỉ admin mới được truy cập (quản lý phim, lịch chiếu, đơn vé)
exports.requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Lỗi',
      message: '⛔ Bạn không có quyền truy cập trang này!'
    });
  }
  next();
};
