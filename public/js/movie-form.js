function previewFile() {
  const preview = document.getElementById('previewImage');
  const fileInput = document.querySelector('input[name="poster"]');

  if (!preview || !fileInput || !fileInput.files.length) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    preview.src = reader.result;
  };

  reader.readAsDataURL(file);
}