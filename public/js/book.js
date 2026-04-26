const promotions = {
  CBNEW50: { type: 'fixed', value: 50000, minOrderValue: 180000, message: 'Khach moi giam 50.000d' },
  STUDENT10: { type: 'percent', value: 10, minOrderValue: 120000, maxDiscount: 40000, message: 'Sinh vien giam 10%' },
  COMBO25: { type: 'fixed', value: 25000, minOrderValue: 150000, message: 'Giam 25.000d' }
};

let selectedSeats = [];
let selectedServices = [];
let discountCode = '';
let discountAmount = 0;

function calcDiscount(subtotal) {
  const promo = promotions[discountCode];
  if (!promo) return discountAmount = 0;

  if (subtotal < promo.minOrderValue) return discountAmount = 0;

  if (promo.type === 'fixed') {
    discountAmount = Math.min(promo.value, subtotal);
  } else {
    discountAmount = Math.round(subtotal * promo.value / 100);
  }
}

function updateCart() {
  let seatsTotal = 0;
  selectedSeats.forEach(s => seatsTotal += s.price);

  let svcTotal = 0;
  selectedServices.forEach(s => svcTotal += s.price * s.quantity);

  const subtotal = seatsTotal + svcTotal;

  calcDiscount(subtotal);

  const grand = Math.max(subtotal - discountAmount, 0);

  document.getElementById('selected-seats-display').innerText =
    selectedSeats.map(s => s.code).join(', ');

  document.getElementById('seats-total-display').innerText = seatsTotal + 'd';
  document.getElementById('services-total-display').innerText = svcTotal + 'd';
  document.getElementById('subtotal-display').innerText = subtotal + 'd';
  document.getElementById('discount-display').innerText = '-' + discountAmount + 'd';
  document.getElementById('grand-total-display').innerText = grand + 'd';

  document.getElementById('ticketsData').value = JSON.stringify(selectedSeats);
  document.getElementById('servicesData').value = JSON.stringify(selectedServices);
  document.getElementById('discountCode').value = discountCode;
  document.getElementById('totalAmount').value = grand;

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

    let svc = selectedServices.find(s => s.name === name);
    if (!svc) {
      svc = { name, price, quantity: 0 };
      selectedServices.push(svc);
    }

    if (this.classList.contains('btn-plus')) svc.quantity++;
    else svc.quantity--;

    if (svc.quantity <= 0) {
      selectedServices = selectedServices.filter(s => s.name !== name);
    }

    updateCart();
  });
});

document.getElementById('btn-apply-promo').addEventListener('click', () => {
  discountCode = document.getElementById('discountCodeInput').value.trim().toUpperCase();
  updateCart();
});