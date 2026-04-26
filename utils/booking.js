const SERVICE_CATALOG = [
  { id: 'combo1', name: 'Combo Solo (1 Bap + 1 Nuoc)', price: 65000 },
  { id: 'combo2', name: 'Combo Couple (1 Bap + 2 Nuoc)', price: 95000 }
];

function buildSeatMap(room, movie, showtime, bookedSeats = []) {
  const currentBasePrice = movie.basePrice * showtime.priceMultiplier;
  const bookedSeatSet = new Set(bookedSeats);
  const seatMap = [];

  for (let r = 0; r < room.rowCount; r++) {
    const rowLetter = String.fromCharCode(65 + r);
    const rowSeats = [];
    const isCoupleRow = room.coupleRows.includes(rowLetter);
    const isVipRow = room.vipRows.includes(rowLetter);
    const seatsInThisRow = isCoupleRow ? Math.floor(room.colCount / 2) : room.colCount;

    for (let c = 1; c <= seatsInThisRow; c++) {
      const seatCode = `${rowLetter}${c}`;
      let type = 'regular';
      let price = currentBasePrice;

      if (isVipRow) {
        type = 'vip';
        price = currentBasePrice + 15000;
      } else if (isCoupleRow) {
        type = 'couple';
        price = currentBasePrice + 30000;
      }

      rowSeats.push({
        code: seatCode,
        type,
        price,
        isBooked: bookedSeatSet.has(seatCode)
      });
    }

    seatMap.push({ rowLetter, seats: rowSeats });
  }

  return seatMap;
}

function getSeatLookup(seatMap) {
  const seatLookup = new Map();

  seatMap.forEach(row => {
    row.seats.forEach(seat => {
      seatLookup.set(seat.code, seat);
    });
  });

  return seatLookup;
}

function normalizeServices(rawServices = []) {
  const serviceLookup = new Map(SERVICE_CATALOG.map(service => [service.name, service]));
  const normalizedServices = [];

  rawServices.forEach(service => {
    const serviceName = typeof service?.name === 'string' ? service.name.trim() : '';
    const quantity = Number(service?.quantity);
    const matchedService = serviceLookup.get(serviceName);

    if (!matchedService || !Number.isInteger(quantity) || quantity <= 0) return;

    normalizedServices.push({
      name: matchedService.name,
      quantity,
      price: matchedService.price
    });
  });

  return normalizedServices;
}

module.exports = {
  SERVICE_CATALOG,
  buildSeatMap,
  getSeatLookup,
  normalizeServices
};
