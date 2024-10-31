const form = document.querySelector('form');
const submitButton = document.querySelector('#submit_button');

form.addEventListener('submit', () => {
  submitButton.setAttribute('disable', true);
});
