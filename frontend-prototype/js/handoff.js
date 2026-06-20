/*
 * Handoff notes banner. Renders a toggleable, fixed panel describing how the
 * current mockup maps to the real Next.js app (route, source files, behaviors,
 * and what is faked). Collapsed state is remembered so it can be hidden for
 * screenshots. Exposed as window.Handoff.
 *
 * Usage: Handoff.mount({ route, source, behaviors:[], faked:[], extraHTML, onMount });
 */
(function () {
  'use strict';

  var COLLAPSE_KEY = 'maraflamini_handoff_collapsed';

  function isCollapsed() {
    try { return window.localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) { return false; }
  }
  function setCollapsed(v) {
    try { window.localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0'); } catch (e) {}
  }

  function list(items) {
    return '<ul class="list-disc pl-5 space-y-1">' +
      items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
  }

  function mount(config) {
    config = config || {};
    // remove any existing banner (re-mount safety)
    var existing = document.getElementById('handoff-root');
    if (existing) existing.remove();

    var root = document.createElement('div');
    root.id = 'handoff-root';

    var collapsed = isCollapsed();

    root.innerHTML =
      // Floating toggle button (always visible)
      '<button id="handoff-toggle" title="Notas de handoff" ' +
        'style="position:fixed;bottom:1rem;left:1rem;z-index:120;background:#0f172a;color:#fff;border:none;border-radius:9999px;padding:0.5rem 0.9rem;font-size:0.8rem;font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,0.25);cursor:pointer;">' +
        'Handoff &#9432;</button>' +
      // Panel
      '<div id="handoff-panel" style="position:fixed;bottom:3.5rem;left:1rem;z-index:120;max-width:420px;width:calc(100vw - 2rem);max-height:70vh;overflow:auto;background:#0f172a;color:#e2e8f0;border-radius:0.75rem;box-shadow:0 16px 40px rgba(0,0,0,0.35);font-size:0.8rem;line-height:1.4;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 1rem;border-bottom:1px solid rgba(148,163,184,0.25);">' +
          '<strong style="color:#fff;">Notas de handoff (prototipo)</strong>' +
          '<button id="handoff-close" style="background:none;border:none;color:#94a3b8;font-size:1.1rem;cursor:pointer;line-height:1;">×</button>' +
        '</div>' +
        '<div style="padding:0.85rem 1rem;display:flex;flex-direction:column;gap:0.75rem;">' +
          section('Ruta real', '<code style="color:#7dd3fc;">' + esc(config.route || '') + '</code>') +
          (config.source ? section('Fuente', '<code style="color:#a5b4fc;word-break:break-word;">' + esc(config.source) + '</code>') : '') +
          (config.behaviors && config.behaviors.length ? section('Comportamiento', list(config.behaviors)) : '') +
          (config.faked && config.faked.length ? section('Simulado / placeholder', list(config.faked)) : '') +
          (config.extraHTML ? section('Previsualizar estados', config.extraHTML) : '') +
          '<p style="color:#64748b;font-size:0.7rem;margin-top:0.25rem;">Prototipo de handoff &mdash; sin backend. Oculta este panel para capturas.</p>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    var panel = document.getElementById('handoff-panel');
    var toggle = document.getElementById('handoff-toggle');
    function apply() {
      panel.style.display = collapsed ? 'none' : 'block';
    }
    apply();

    toggle.addEventListener('click', function () { collapsed = !collapsed; setCollapsed(collapsed); apply(); });
    document.getElementById('handoff-close').addEventListener('click', function () { collapsed = true; setCollapsed(true); apply(); });

    if (typeof config.onMount === 'function') config.onMount(panel);
  }

  function section(title, bodyHtml) {
    return '<div><div style="text-transform:uppercase;letter-spacing:0.04em;font-size:0.65rem;color:#94a3b8;margin-bottom:0.25rem;">' +
      esc(title) + '</div><div>' + bodyHtml + '</div></div>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.Handoff = { mount: mount };
})();
