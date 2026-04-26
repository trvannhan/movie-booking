const cinemaSelect = document.getElementById('cinemaSelect');
const roomSelect = document.getElementById('roomSelect');

function syncRoomsByCinema() {
  if (!cinemaSelect || !roomSelect) return;

  const selectedCinema = cinemaSelect.value;
  const roomOptions = Array.from(roomSelect.options);
  let hasVisibleSelection = false;

  roomOptions.forEach(option => {
    const matchedCinema = option.getAttribute('data-cinema-id') === selectedCinema;
    option.hidden = !matchedCinema;

    if (matchedCinema && option.selected) {
      hasVisibleSelection = true;
    }
  });

  if (!hasVisibleSelection) {
    const firstVisible = roomOptions.find(option => !option.hidden);
    if (firstVisible) firstVisible.selected = true;
  }
}

// tránh lỗi khi DOM chưa load
if (cinemaSelect) {
  cinemaSelect.addEventListener('change', syncRoomsByCinema);
  syncRoomsByCinema();
}