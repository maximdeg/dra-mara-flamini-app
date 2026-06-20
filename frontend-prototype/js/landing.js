/* Landing page interactions: render services, init icons, entrance reveals. */
(function () {
  'use strict';

  var services = [
    {
      icon: 'shield',
      title: 'Dermatología General',
      description: 'Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas.'
    },
    {
      icon: 'users',
      title: 'Dermatología Estética',
      description: 'Tratamientos para mejorar la apariencia y salud de tu piel.'
    },
    {
      icon: 'award',
      title: 'Cirugía Dermatológica',
      description: 'Procedimientos quirúrgicos especializados en dermatología.'
    }
  ];

  function renderServices() {
    var grid = document.getElementById('services-grid');
    if (!grid) return;
    grid.innerHTML = services.map(function (s, i) {
      return (
        '<div class="reveal bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2" style="transition-delay:' + (i * 0.15) + 's">' +
          '<div class="w-16 h-16 bg-gradient-to-br from-brand-bg to-brand rounded-full flex items-center justify-center mb-6">' +
            '<i data-lucide="' + s.icon + '" class="w-8 h-8 text-brand-dark"></i>' +
          '</div>' +
          '<h3 class="text-xl font-bold text-brand-dark mb-4">' + s.title + '</h3>' +
          '<p class="text-brand leading-relaxed">' + s.description + '</p>' +
        '</div>'
      );
    }).join('');
  }

  function setupReveals() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderServices();
    if (window.Handoff) window.Handoff.mount({
      route: '/',
      source: 'app/page.tsx → app/ProviderPageClient.tsx',
      behaviors: [
        'Public provider landing page served at the site root (the home page).',
        'Two "Agendar visita" CTAs link to /agendar-visita.',
        'Real app animates entrances with framer-motion; here approximated with IntersectionObserver + CSS.'
      ],
      faked: [
        'Provider name/avatar and the 3 "Servicios" cards are hardcoded in the real component too (not DB-driven).',
        'Hero image is a placeholder; the real app uses /images/maraflaminipic.jpg with a ui-avatars fallback.'
      ]
    });
    if (window.lucide) window.lucide.createIcons();
    setupReveals();
  });
})();
