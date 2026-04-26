function generateTicketCode(bookingId) {
  const suffix = bookingId.toString().slice(-6).toUpperCase();
  return `CB-${suffix}`;
}

function buildTicketQrUrl(booking) {
  const payload = encodeURIComponent(
    JSON.stringify({
      ticketCode: booking.ticketCode,
      bookingId: booking._id,
      totalAmount: booking.totalAmount
    })
  );

  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${payload}`;
}

module.exports = {
  generateTicketCode,
  buildTicketQrUrl
};
