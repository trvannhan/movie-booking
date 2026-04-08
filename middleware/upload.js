// ============================================
// middleware/upload.js — Upload ảnh poster phim (Multer)
// ============================================
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu + tên file
const storage = multer.diskStorage({
  // Lưu vào thư mục public/uploads
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  // Đặt tên file: timestamp + tên gốc (tránh trùng)
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpg, png, webp)'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
