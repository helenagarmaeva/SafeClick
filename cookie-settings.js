/* Cookiebot controls only. No advertising or analytics SDK is installed here. */
(() => {
  'use strict';
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('[data-cookie-action]') : null;
    if (!target) return;
    event.preventDefault();
    const cmp = window.Cookiebot;
    const feedback = document.querySelector('[data-cookie-feedback]');
    const action = target.dataset.cookieAction;
    const method = action === 'withdraw' ? 'withdraw' : 'renew';
    if (!cmp || typeof cmp[method] !== 'function') {
      if (feedback) feedback.textContent = 'Cookie-Einstellungen sind derzeit nicht verfügbar. Bitte laden Sie die Seite erneut.';
      return;
    }
    cmp[method]();
    if (feedback) feedback.textContent = action === 'withdraw' ? 'Ihre Einwilligung wurde widerrufen.' : '';
  });
})();
