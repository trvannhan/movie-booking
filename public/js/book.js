let selectedSeats = [];
let selectedServices = [];

function updateCart() {
  let seatsTotal = 0;
  selectedSeats.forEach(s => seatsTotal += s.price);

  let svcTotal = 0;
  selectedServices.forEach(s => svcTotal += s.price * s.quantity);

  const subtotal = seatsTotal + svcTotal;

  document.getElementById('selected-seats-display').innerText =
    selectedSeats.map(s => s.code).join(', ');

  document.getElementById('seats-total-display').innerText = seatsTotal + 'd';
  document.getElementById('services-total-display').innerText = svcTotal + 'd';
  document.getElementById('grand-total-display').innerText = subtotal + 'd';

  document.getElementById('ticketsData').value = JSON.stringify(selectedSeats);
  document.getElementById('servicesData').value = JSON.stringify(selectedServices);
  document.getElementById('totalAmount').value = subtotal;

  document.getElementById('btn-checkout').disabled = selectedSeats.length === 0;
}

document.querySelectorAll('.seat:not(.booked)').forEach(el => {
  el.addEventListener('click', function () {
    const code = this.dataset.code;
    const price = +this.dataset.price;

    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
      selectedSeats = selectedSeats.filter(s => s.code !== code);
    } else {
      this.classList.add('selected');
      selectedSeats.push({ code, price });
    }
    updateCart();
  });
});

document.querySelectorAll('.btn-plus, .btn-minus').forEach(btn => {
  btn.addEventListener('click', function () {
    const name = this.dataset.service;
    const price = +this.dataset.price;
    const serviceId = this.dataset.serviceId;

    let svc = selectedServices.find(s => s.name === name);
    if (!svc) {
      svc = { name, price, quantity: 0 };
      selectedServices.push(svc);
    }

    if (this.classList.contains('btn-plus')) {
      svc.quantity++;
    } else {
      svc.quantity--;
    }

    if (svc.quantity < 0) svc.quantity = 0;

    // Cập nhật số lượng hiển thị trên màn hình
    const qtyLabel = document.getElementById('qty-' + serviceId);
    if (qtyLabel) qtyLabel.innerText = svc.quantity;

    if (svc.quantity === 0) {
      selectedServices = selectedServices.filter(s => s.name !== name);
    }

    updateCart();
  });
});
