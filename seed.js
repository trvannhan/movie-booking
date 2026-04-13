const mongoose = require('mongoose');
require('dotenv').config();

const Cinema = require('./models/Cinema');
const Room = require('./models/Room');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie_booking';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

async function seedData() {
  try {
    // Xóa dữ liệu cũ
    await Cinema.deleteMany();
    await Room.deleteMany();
    await Movie.deleteMany();
    await Showtime.deleteMany();

    // 1. Tạo Rạp
    const cinema1 = await Cinema.create({
      name: 'CineBook Landmark 81',
      address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh',
      city: 'Hồ Chí Minh',
      image: 'https://cdn.tuoitre.vn/thumb_w/730/2021/6/7/landmark-81-16230353138861611084227.jpg'
    });
    
    const cinema2 = await Cinema.create({
      name: 'CineBook Metropolis',
      address: '29 Liễu Giai, Ngọc Khánh, Ba Đình',
      city: 'Hà Nội',
      image: 'https://vinhomes-hanoi.com/wp-content/uploads/2016/11/trung-tam-thuong-mai-vinhomes-metropolis.jpg'
    });

    // 2. Tạo Phòng cho rạp Landmark
    const room1 = await Room.create({
      cinemaId: cinema1._id,
      name: 'Phòng 1 (Standard)',
      rowCount: 8,
      colCount: 10,
      vipRows: ['D', 'E'],
      coupleRows: ['H']
    });

    const room2 = await Room.create({
      cinemaId: cinema1._id,
      name: 'Phòng 2 (IMAX)',
      rowCount: 10,
      colCount: 14,
      vipRows: ['E', 'F', 'G'],
      coupleRows: ['J']
    });
    
    // Phòng cho rạp Metropolis
    const room3 = await Room.create({
      cinemaId: cinema2._id,
      name: 'Phòng 1 (Standard)',
      rowCount: 8,
      colCount: 10,
      vipRows: ['D', 'E'],
      coupleRows: ['H']
    });

    // 3. Tạo Phim
    const movie1 = await Movie.create({
      title: 'Dune: Phần Hai',
      description: 'Hành trình thần thoại của Paul Atreides...',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya'],
      genre: ['Hành Động', 'Sci-Fi'],
      duration: 166,
      posterUrl: 'https://upload.wikimedia.org/wikipedia/vi/8/88/Dune_Ph%E1%BA%A7n_Hai_poster.jpg',
      status: 'now_showing',
      basePrice: 85000
    });

    const movie2 = await Movie.create({
      title: 'Lật Mặt 7: Một Điều Ước',
      description: 'Phần mới nhất trong series đình đám của Lý Hải',
      director: 'Lý Hải',
      cast: ['Lý Hải', 'Quách Ngọc Tuyên'],
      genre: ['Tâm Lý', 'Hành Động'],
      duration: 130,
      posterUrl: 'https://upload.wikimedia.org/wikipedia/vi/1/1a/L%E1%BA%ADt_m%E1%BA%B7t_7_poster.jpg',
      status: 'now_showing',
      basePrice: 75000
    });

    // 4. Tạo Suất chiếu
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Suất 1: Dune - Landmark Phòng 1 - 18:00
    const st1Start = new Date(today); st1Start.setHours(18, 0, 0);
    const st1End = new Date(today); st1End.setHours(18 + 2, 46, 0);
    await Showtime.create({
      movieId: movie1._id, roomId: room1._id, cinemaId: cinema1._id,
      startTime: st1Start, endTime: st1End, priceMultiplier: 1.0
    });

    // Suất 2: Dune - Landmark Phòng 2 IMAX - 20:00 (Price x1.2)
    const st2Start = new Date(today); st2Start.setHours(20, 0, 0);
    const st2End = new Date(today); st2End.setHours(20 + 2, 46, 0);
    await Showtime.create({
      movieId: movie1._id, roomId: room2._id, cinemaId: cinema1._id,
      startTime: st2Start, endTime: st2End, priceMultiplier: 1.2
    });

    // Suất 3: Lật Mặt 7 - Metropolis Phòng 1 - 19:30
    const st3Start = new Date(today); st3Start.setHours(19, 30, 0);
    const st3End = new Date(today); st3End.setHours(19 + 2, 10, 0);
    await Showtime.create({
      movieId: movie2._id, roomId: room3._id, cinemaId: cinema2._id,
      startTime: st3Start, endTime: st3End, priceMultiplier: 1.0
    });

    console.log('✅ Seed Data Created Successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error: ', err);
    process.exit(1);
  }
}

seedData();
