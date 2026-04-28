document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('#heroCarousel');

  if (carousel) {
    new bootstrap.Carousel(carousel, {
      interval: 4000,
      ride: 'carousel',
      pause: false,
      wrap: true
    });
  }
});
