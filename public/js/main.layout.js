const emailInput = document.querySelector('#email');

// Show all toast messages on Page load
document.addEventListener('DOMContentLoaded', () => {
  const toastElList = document.querySelectorAll('.toast');
  [...toastElList].map((tl) => new bootstrap.Toast(tl).show());

  // Set user email value
  emailInput.value = localStorage.getItem('auth_email');
});

// Save user email for future use
emailInput.addEventListener('input', (e) => {
  const email = e.target.value;
  localStorage.setItem('auth_email', email);
});
