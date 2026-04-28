const mongoose = require("mongoose");
require("dotenv").config();

const Cinema = require("./models/Cinema");
const Room = require("./models/Room");
const Movie = require("./models/Movie");
const Showtime = require("./models/Showtime");
const Booking = require("./models/Booking");
const RESET_DB = process.env.RESET_DB === "true";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/movie_booking";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch((err) => console.error(err));

const slugify = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getPosterPath = (title) => `/posters/${slugify(title)}.jpg`;

async function seedData() {
  try {
    // =========================
    //  MODE RESET
    // =========================
    if (RESET_DB) {
      console.log("RESET MODE: clearing database...");

      await Promise.all([
        Booking.deleteMany(),
        Showtime.deleteMany(),
        Room.deleteMany(),
        Cinema.deleteMany(),
        Movie.deleteMany(),
      ]);

      console.log("Database cleared");
    }

    // =========================
    //  MODE SAFE
    // =========================
    const cinemaCount = await Cinema.countDocuments();

    if (!RESET_DB) {
      const movieCount = await Movie.countDocuments();

      if (movieCount > 0) {
        console.log("Data already exists → skip seeding");
        process.exit(0);
      }
    }

    console.log("Starting seed...");

    const cinema1 = await Cinema.create({
      name: "CineBook Landmark 81",
      address: "720A Dien Bien Phu, Binh Thanh",
      city: "Ho Chi Minh",
      image: "/images/cinema-cover.svg",
    });

    const cinema2 = await Cinema.create({
      name: "CineBook Metropolis",
      address: "29 Lieu Giai, Ba Dinh",
      city: "Ha Noi",
      image: "/images/cinema-cover.svg",
    });

    const cinema3 = await Cinema.create({
      name: "CineBook Da Nang Center",
      address: "02 Thang 9, Hai Chau",
      city: "Da Nang",
      image: "/images/cinema-cover.svg",
    });

    const room1 = await Room.create({
      cinemaId: cinema1._id,
      name: "Phong 1 (Standard)",
      rowCount: 8,
      colCount: 10,
      vipRows: ["D", "E"],
      coupleRows: ["H"],
    });

    const room2 = await Room.create({
      cinemaId: cinema1._id,
      name: "Phong 2 (IMAX)",
      rowCount: 10,
      colCount: 14,
      vipRows: ["E", "F", "G"],
      coupleRows: ["J"],
    });

    const room3 = await Room.create({
      cinemaId: cinema2._id,
      name: "Phong 1 (Standard)",
      rowCount: 8,
      colCount: 10,
      vipRows: ["D", "E"],
      coupleRows: ["H"],
    });

    const room4 = await Room.create({
      cinemaId: cinema3._id,
      name: "Phong 3 (Premium)",
      rowCount: 9,
      colCount: 12,
      vipRows: ["E", "F"],
      coupleRows: ["I"],
    });

    const movieSeeds = [
      {
        title: "Dune: Phan Hai",
        description:
          "Paul Atreides tro lai va buoc vao cuoc chien giua van menh, tinh yeu va quyen luc.",
        director: "Denis Villeneuve",
        cast: ["Timothee Chalamet", "Zendaya", "Rebecca Ferguson"],
        genre: ["Hanh dong", "Sci-Fi"],
        duration: 166,
        posterUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        image: "/posters/dun-phan-hai.jpg",
        status: "now_showing",
        basePrice: 85000,
        releaseOffsetDays: -35,
      },
      {
        title: "Godzilla x Kong",
        description:
          "Hai quai vat khong lo doi dau trong tran chien quyet dinh so phan Trai Dat.",
        director: "Adam Wingard",
        cast: ["Rebecca Hall", "Brian Tyree Henry"],
        genre: ["Hanh dong", "Phieu luu"],
        duration: 115,
        trailerUrl: "https://www.youtube.com/watch?v=qqrpMRDuPfc",
        posterUrl: "/posters/godzilla-x-kong.jpg",
        status: "now_showing",
        basePrice: 80000,
        releaseOffsetDays: -21,
      },
      {
        title: "Lat Mat 8",
        description:
          "Mot gia dinh bi cuon vao loat bien co khien moi dieu che giau deu bi phoi bay.",
        director: "Ly Hai",
        cast: ["Quoc Cuong", "Thanh Thuc", "Le Hai"],
        genre: ["Tam ly", "Hanh dong"],
        duration: 128,
        trailerUrl: "https://youtu.be/hUlBTt3NyGI?si=4aP_qoaVnf7ex2OH",
        posterUrl: "/posters/lat-mat-8.jpg",
        status: "now_showing",
        basePrice: 75000,
        releaseOffsetDays: -12,
      },
      {
        title: "Kung Fu Panda 4",
        description:
          "Po tro lai voi hanh trinh tim nguoi ke nhiem va doi dau ke thu moi.",
        director: "Mike Mitchell",
        cast: ["Jack Black", "Awkwafina"],
        genre: ["Hoat hinh", "Gia dinh"],
        duration: 94,
        trailerUrl: "https://www.youtube.com/watch?v=_inKs4eeHiI",
        posterUrl: "/posters/kung-fu-panda-4.jpg",
        status: "now_showing",
        basePrice: 70000,
        releaseOffsetDays: -18,
      },
      {
        title: "Civil War",
        description:
          "Mot nhom nha bao di xuyen nuoc My trong boi canh xa hoi tan vo.",
        director: "Alex Garland",
        cast: ["Kirsten Dunst", "Wagner Moura"],
        genre: ["Chinh kich", "Hanh dong"],
        duration: 109,
        trailerUrl: "https://www.youtube.com/watch?v=aDyQxtg0V2w",
        posterUrl: "/posters/civil-war.jpg",
        status: "now_showing",
        basePrice: 78000,
        releaseOffsetDays: -8,
      },
      {
        title: "Inside Out 2",
        description:
          "Riley buoc vao tuoi teen va the gioi cam xuc lai them mot lan day song gio.",
        director: "Kelsey Mann",
        cast: ["Amy Poehler", "Phyllis Smith"],
        genre: ["Hoat hinh", "Hai huoc"],
        duration: 100,
        trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0",
        posterUrl: "/posters/inside-out-2.jpg",
        status: "now_showing",
        basePrice: 72000,
        releaseOffsetDays: -4,
      },
      {
        title: "Deadpool & Wolverine",
        description:
          "Cap doi ba dao nhat vu tru Marvel chinh thuc hop tac trong mot phien ban day dien.",
        director: "Shawn Levy",
        cast: ["Ryan Reynolds", "Hugh Jackman"],
        genre: ["Hanh dong", "Hai huoc"],
        duration: 127,
        trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk",
        posterUrl: "/posters/deadpool-&-wolverine.jpg",
        status: "coming_soon",
        basePrice: 90000,
        releaseOffsetDays: 14,
      },
      {
        title: "Mufasa",
        description:
          "Cau chuyen nguon goc cua vi vua su tu va hanh trinh vuon len tu bong toi.",
        director: "Barry Jenkins",
        cast: ["Aaron Pierre", "Kelvin Harrison Jr."],
        genre: ["Phieu luu", "Gia dinh"],
        duration: 118,
        trailerUrl: "https://www.youtube.com/watch?v=o17MF9vnabg",
        posterUrl: "/posters/mufasa.jpg",
        status: "coming_soon",
        basePrice: 82000,
        releaseOffsetDays: 21,
      },
      {
        title: "Avatar 3",
        description:
          "Pandora mo rong voi mot bo toc moi va cuoc xung dot lon hon bao gio het.",
        director: "James Cameron",
        cast: ["Sam Worthington", "Zoe Saldana"],
        genre: ["Sci-Fi", "Phieu luu"],
        duration: 192,
        trailerUrl: "https://www.youtube.com/watch?v=nb_fFfxNHaA",
        posterUrl: "/posters/avatar-3.jpg",
        status: "coming_soon",
        basePrice: 95000,
        releaseOffsetDays: 35,
      },
      {
        title: "The Fantastic Four",
        description:
          "Bo tu sieu anh hung quay tro lai voi ban tai khoi dong duoc mong cho.",
        director: "Matt Shakman",
        cast: ["Pedro Pascal", "Vanessa Kirby"],
        genre: ["Sci-Fi", "Hanh dong"],
        duration: 134,
        trailerUrl: "https://www.youtube.com/watch?v=pAsmrKyMqaA",
        posterUrl: "/posters/the-fantastic-four.jpg",
        status: "coming_soon",
        basePrice: 88000,
        releaseOffsetDays: 45,
      },
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createdMovies = [];
    for (const seed of movieSeeds) {
      const releaseDate = new Date(today);
      releaseDate.setDate(releaseDate.getDate() + seed.releaseOffsetDays);

      const movie = await Movie.create({
        title: seed.title,
        description: seed.description,
        director: seed.director,
        cast: seed.cast,
        genre: seed.genre,
        duration: seed.duration,
        releaseDate,
        posterUrl: getPosterPath(seed.title),
        trailerUrl: seed.trailerUrl,
        status: seed.status,
        basePrice: seed.basePrice,
      });

      createdMovies.push(movie);
    }

    const nowShowingMovies = createdMovies.filter(
      (movie) => movie.status === "now_showing",
    );
    const showtimeTemplates = [
      {
        cinemaId: cinema1._id,
        roomId: room1._id,
        hour: 13,
        minute: 15,
        multiplier: 1.0,
      },
      {
        cinemaId: cinema1._id,
        roomId: room2._id,
        hour: 18,
        minute: 30,
        multiplier: 1.2,
      },
      {
        cinemaId: cinema2._id,
        roomId: room3._id,
        hour: 20,
        minute: 0,
        multiplier: 1.1,
      },
      {
        cinemaId: cinema3._id,
        roomId: room4._id,
        hour: 16,
        minute: 45,
        multiplier: 1.0,
      },
    ];

    for (let i = 0; i < nowShowingMovies.length; i++) {
      const movie = nowShowingMovies[i];
      const template = showtimeTemplates[i % showtimeTemplates.length];

      for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
        const startTime = new Date(today);
        startTime.setDate(startTime.getDate() + dayOffset);
        startTime.setHours(template.hour, template.minute, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + movie.duration + 20);

        await Showtime.create({
          movieId: movie._id,
          roomId: template.roomId,
          cinemaId: template.cinemaId,
          startTime,
          endTime,
          priceMultiplier: template.multiplier,
        });
      }
    }

    console.log("Seed data created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seedData();
