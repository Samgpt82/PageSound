document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.subscribe-form');
  const emailInput = form?.querySelector('input[name="email"]');
  const messageEl = document.querySelector('.subscribe-message');

  if (!form || !emailInput || !messageEl) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      showMessage('Please enter your email.', 'error');
      return;
    }

    try {
      messageEl.dataset.state = 'loading';
      showMessage('Submitting…', 'loading');

      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Subscription failed.');
      }

      form.reset();
      showMessage(result.message || 'Thanks for subscribing!', 'success');
    } catch (error) {
      console.error('Subscription error:', error);
      if (window.location.protocol === 'file:') {
        showMessage('Start the site with "node server.js" before subscribing.', 'error');
      } else if (error?.message && /Failed to fetch/i.test(error.message)) {
        showMessage('Subscription service is unavailable. Is the server running?', 'error');
      } else {
        showMessage(error?.message || 'An unexpected error occurred.', 'error');
      }
    }
  });

  function showMessage(text, state) {
    messageEl.textContent = text;
    messageEl.dataset.state = state;
  }
});

