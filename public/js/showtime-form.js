const cinemaSelect = document.getElementById('cinemaSelect');
const roomSelect = document.getElementById('roomSelect');

function syncRoomsByCinema() {
  if (!cinemaSelect || !roomSelect) return;

  const selectedCinema = cinemaSelect.value;
  const allOptions = Array.from(roomSelect.options);
  let firstMatch = null;
  let currentStillValid = false;

  allOptions.forEach(option => {
    const belongsToCinema = option.getAttribute('data-cinema-id') === selectedCinema;
    // Dùng style.display thay vì hidden để chắc chắn không submit option ẩn
    option.style.display = belongsToCinema ? '' : 'none';
    option.disabled = !belongsToCinema;

    if (belongsToCinema && !firstMatch) {
      firstMatch = option;
    }
    if (belongsToCinema && option.selected) {
      currentStillValid = true;
    }
  });

  // Nếu phòng đang chọn không thuộc rạp mới → tự động chọn phòng đầu tiên khớp
  if (!currentStillValid) {
    allOptions.forEach(opt => opt.selected = false);
    if (firstMatch) {
      firstMatch.selected = true;
    }
  }

  // Hiện cảnh báo nếu rạp chưa có phòng nào
  let noRoomWarning = document.getElementById('noRoomWarning');
  if (!firstMatch) {
    if (!noRoomWarning) {
      noRoomWarning = document.createElement('small');
      noRoomWarning.id = 'noRoomWarning';
      noRoomWarning.className = 'text-danger d-block mt-1';
      noRoomWarning.textContent = '⚠️ Rạp này chưa có phòng chiếu. Vui lòng tạo phòng chiếu trước.';
      roomSelect.parentElement.appendChild(noRoomWarning);
    }
  } else if (noRoomWarning) {
    noRoomWarning.remove();
  }
}

if (cinemaSelect) {
  cinemaSelect.addEventListener('change', syncRoomsByCinema);
  // Chạy lần đầu khi page load
  syncRoomsByCinema();
}