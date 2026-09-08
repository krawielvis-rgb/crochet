document.querySelector('form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.textContent = '✓';
  button.setAttribute('aria-label', 'Subscribed');
});
