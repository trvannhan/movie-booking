const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie_booking';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected for User Seeding'))
  .catch(err => console.error(err));

async function seedUsers() {
  try {
    await User.deleteMany();
    const admin = await User.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin',
      fullName: 'Administrator',
      phone: '0999999999',
      role: 'admin'
    });

    const user = await User.create({
      username: 'user',
      email: 'user@gmail.com',
      password: 'user',
      fullName: 'Normal User',
      phone: '0888888888',
      role: 'user'
    });

    console.log('Seeded Users:');
    console.log({
      admin: admin.email,
      user: user.email
    });

    console.log('Seed user done');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed user error:', err);
    process.exit(1);
  }
}

seedUsers();