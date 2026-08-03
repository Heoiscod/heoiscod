document.addEventListener('DOMContentLoaded', () => {
  const year = document.querySelector('#year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  document.querySelectorAll('.blog-row').forEach((row) => {
    row.addEventListener('click', () => {
      row.classList.toggle('active');
    });
  });
});
