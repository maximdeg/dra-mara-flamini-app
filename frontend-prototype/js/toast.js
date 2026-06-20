/* Minimal toast helper (replaces sonner). Exposed as window.toast. */
(function () {
  'use strict';

  function ensureContainer() {
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function show(message, type) {
    var c = ensureContainer();
    var el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    el.textContent = message;
    c.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 300);
    }, 3500);
  }

  window.toast = {
    success: function (m) { show(m, 'success'); },
    error: function (m) { show(m, 'error'); },
    info: function (m) { show(m, 'info'); }
  };
})();
