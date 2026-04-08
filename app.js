// ============================================
// app.js — File chính khởi tạo server
// ============================================
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const path = require('path');
require('dotenv').config();

// Biến cấu hình (có giá trị mặc định nếu .env trống)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie_booking';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cinebook_secret_2024';

require('./config/db'); // Kết nối MongoDB

const app = express();

// ---- Cấu hình View Engine (EJS) ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- Middleware parse dữ liệu ----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---- Phục vụ file tĩnh (CSS, JS, ảnh) ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Cấu hình Session ----
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 giờ
}));

// ---- Middleware: truyền user vào tất cả views ----
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// ---- Đăng ký Routes ----
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/showtimes', showtimeRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);

// ---- Trang chủ ----
app.get('/', async (req, res) => {
  try {
    const Movie = require('./models/Movie');
    const nowShowing = await Movie.find({ status: 'now_showing' }).limit(8);
    const comingSoon = await Movie.find({ status: 'coming_soon' }).limit(4);
    res.render('home', {
      title: 'Trang chủ',
      nowShowing,
      comingSoon
    });
  } catch (err) {
    res.render('home', {
      title: 'Trang chủ',
      nowShowing: [],
      comingSoon: []
    });
  }
});

// ---- Khởi động Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
