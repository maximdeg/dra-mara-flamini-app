/*
 * Confirmation / appointment-details page.
 * Mirrors app/cita/[id]/page.tsx.
 *
 * Sensitive business copy from the real page (clinic phone numbers, CBU/alias,
 * obra-social documentation specifics) is shown here as clearly-marked
 * [PLACEHOLDER] text — the real values live in the source file.
 *
 * State previewer: the handoff banner lets you switch status
 * (scheduled / cancelled / completed) and toggle can_cancel (>24h) to exercise
 * every conditional layout the real page renders.
 */
(function () {
  'use strict';

  var store = window.MockStore;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }

  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function formatLongDate(iso) {
    if (!iso) return '';
    var p = iso.split('-').map(Number);
    return String(p[2]) + ' de ' + MONTHS[p[1] - 1] + ' de ' + p[0];
  }

  // Compute the real "can_cancel" rule: more than 24h before the appointment.
  function computeCanCancel(apt) {
    if (!apt.appointment_date || !apt.appointment_time) return false;
    var dt = new Date(apt.appointment_date + 'T' + apt.appointment_time + ':00');
    return (dt.getTime() - Date.now()) > 24 * 60 * 60 * 1000;
  }

  // --- resolve the appointment to display ---------------------------------
  function getAppointment() {
    var params = new URLSearchParams(window.location.search);
    var id = Number(params.get('id'));
    var all = store.getAppointments();
    var apt = all.find(function (a) { return a.id === id; });
    if (apt) return apt;
    // fallback: first scheduled, else first, else a synthetic sample
    return all.filter(function (a) { return a.status === 'scheduled'; })[0] || all[0] || {
      id: 0, patient_name: 'Paciente de ejemplo', patient_phone: '3421234567',
      appointment_date: store.toISODate(new Date()), appointment_time: '09:00',
      visit_type: 'Consulta', consult_type: 'Primera vez', practice_type: null,
      health_insurance: 'OSDE', status: 'scheduled'
    };
  }

  // --- view state (overridable by the previewer) --------------------------
  var baseAppt = null;
  var override = { status: null, canCancel: null };

  function effective() {
    var apt = Object.assign({}, baseAppt);
    if (override.status) apt.status = override.status;
    var canCancel = override.canCancel != null ? override.canCancel : computeCanCancel(apt);
    return { apt: apt, canCancel: canCancel && apt.status === 'scheduled' };
  }

  function statusBadge(status) {
    if (status === 'scheduled') return '<span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-green-500">Programada</span>';
    if (status === 'cancelled') return '<span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-red-600">Cancelada</span>';
    return '<span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-500">Completada</span>';
  }

  function headerIcon(status) {
    if (status === 'scheduled') return '<div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"><i data-lucide="check" class="h-6 w-6 text-white"></i></div>';
    if (status === 'cancelled') return '<div class="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg"><i data-lucide="x-circle" class="h-6 w-6 text-white"></i></div>';
    return '<div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg"><i data-lucide="check" class="h-6 w-6 text-white"></i></div>';
  }

  function detailRow(label, value) {
    return '<div class="flex justify-between items-start border-b border-brand/20 pb-1">' +
      '<span class="font-medium text-brand">' + label + ':</span>' +
      '<span class="text-brand-dark font-semibold text-right">' + esc(value) + '</span></div>';
  }

  function render() {
    var e = effective();
    var apt = e.apt;
    var canCancel = e.canCancel;

    var title = apt.status === 'scheduled' ? 'Cita Confirmada' : apt.status === 'cancelled' ? 'Cita Cancelada' : 'Detalles de la Cita';
    var subtitle = apt.status === 'scheduled'
      ? 'Su cita ha sido confirmada. Por favor revise los detalles a continuación.'
      : 'Información de su cita médica';

    // deposit conditions (mirror the real page; labels match our MockStore)
    var requiresDeposit35000 = apt.visit_type === 'Práctica' && apt.health_insurance === 'Practica Particular';
    var requiresDeposit20000 = apt.visit_type === 'Consulta' && apt.consult_type === 'Primera vez';
    var showDeposit = (requiresDeposit35000 || requiresDeposit20000) && apt.status === 'scheduled';
    var depositAmount = requiresDeposit35000 ? '$35.000' : '$20.000';

    var html =
      '<div class="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-4 sm:p-6">' +
        '<div class="text-center mb-6">' +
          '<div class="flex justify-center mb-3">' + headerIcon(apt.status) + '</div>' +
          '<h1 class="text-2xl sm:text-3xl font-bold text-brand-dark mb-1">' + title + '</h1>' +
          '<div class="flex justify-center mt-2">' + statusBadge(apt.status) + '</div>' +
          '<p class="text-brand text-sm sm:text-base mt-2">' + subtitle + '</p>' +
        '</div>' +

        '<div class="grid gap-4">' +
          // Details
          '<div class="bg-white/60 rounded-lg p-4 shadow-md">' +
            '<h2 class="text-lg font-semibold text-brand-dark mb-3 flex items-center"><i data-lucide="calendar" class="w-4 h-4 mr-2"></i>Detalles de la Cita</h2>' +
            '<div class="space-y-2 text-sm">' +
              detailRow('Paciente', apt.patient_name) +
              detailRow('Teléfono', apt.patient_phone) +
              detailRow('Tipo de visita', apt.visit_type) +
              (apt.visit_type === 'Práctica' && apt.practice_type ? detailRow('Tipo de práctica', apt.practice_type) : '') +
              (apt.visit_type === 'Consulta' && apt.consult_type ? detailRow('Tipo de consulta', apt.consult_type) : '') +
              detailRow('Fecha', formatLongDate(apt.appointment_date)) +
              detailRow('Horario', apt.appointment_time) +
              detailRow('Obra Social', apt.health_insurance) +
            '</div>' +
          '</div>' +

          // Deposit / seña box (placeholder CBU)
          (showDeposit ?
          '<div class="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4 shadow-md">' +
            '<h3 class="font-semibold text-amber-900 mb-2 flex items-center"><i data-lucide="info" class="w-5 h-5 mr-2 text-amber-600"></i>Abonar seña para confirmar la cita</h3>' +
            '<p class="text-amber-800 text-sm mb-3">Para confirmar la cita por completo debe abonar una seña de ' + depositAmount + ' por transferencia.</p>' +
            '<p class="text-black font-medium text-sm">CBU / Alias: <span class="font-semibold text-amber-900">[ALIAS / CBU]</span></p>' +
          '</div>' : '') +

          // Important information
          '<div class="bg-white/60 rounded-lg p-4 sm:p-6 shadow-md text-black">' +
            '<h2 class="text-xl font-semibold text-brand-dark mb-6 flex items-center"><i data-lucide="info" class="w-5 h-5 mr-2"></i>Información Importante</h2>' +
            '<div class="space-y-4 mb-6">' +
              '<div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">' +
                '<h3 class="font-semibold text-blue-800 text-sm mb-2 flex items-center"><i data-lucide="clock" class="w-4 h-4 mr-2"></i>Llegue 15 minutos antes</h3>' +
                '<p class="text-blue-700 text-sm">Para completar la documentación necesaria.</p>' +
              '</div>' +
              '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">' +
                '<h3 class="font-semibold text-yellow-800 text-sm mb-2 flex items-center"><i data-lucide="file-text" class="w-4 h-4 mr-2"></i>Documentación requerida</h3>' +
                '<ul class="text-yellow-700 text-sm space-y-1 list-disc pl-5">' +
                  '<li>CONSULTA: [REQUISITOS OBRA SOCIAL — ver fuente]</li>' +
                  '<li>PRÁCTICA: [REQUISITOS PRÁCTICA / IAPOS — ver fuente]</li>' +
                  '<li>Estudios previos relacionados</li>' +
                '</ul>' +
              '</div>' +
              '<div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">' +
                '<h3 class="font-semibold text-red-800 text-sm mb-2 flex items-center"><i data-lucide="alert-triangle" class="w-4 h-4 mr-2"></i>Cancelación</h3>' +
                '<p class="text-red-700 text-sm">' + (canCancel
                  ? 'Si necesita cancelar, hágalo con al menos 24 horas de anticipación. Respete que quizás otro paciente necesite un turno más cercano y el tiempo del profesional.'
                  : 'Esta cita no puede cancelarse porque faltan menos de 24 horas para el horario programado.') + '</p>' +
              '</div>' +
            '</div>' +
            '<div class="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">' +
              '<h3 class="text-lg font-semibold text-brand-dark mb-3 flex items-center"><i data-lucide="phone" class="w-5 h-5 mr-2"></i>Contacto</h3>' +
              '<p class="text-sm text-gray-700 mb-3">Para cualquier inconveniente a la hora de tomar el turno o duda mandar WhatsApp a las secretarias:</p>' +
              '<div class="space-y-2">' +
                '<div class="flex items-center justify-between bg-white/60 p-3 rounded"><span class="font-medium text-gray-800 text-sm">[NOMBRE CLÍNICA 1]:</span><span class="text-green-600 font-semibold text-sm">[TEL CLÍNICA 1]</span></div>' +
                '<div class="flex items-center justify-between bg-white/60 p-3 rounded"><span class="font-medium text-gray-800 text-sm">[NOMBRE CLÍNICA 2]:</span><span class="text-green-600 font-semibold text-sm">[TEL CLÍNICA 2]</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // Cancellation section
          (apt.status === 'scheduled' && canCancel ?
          '<div class="bg-white/60 rounded-lg p-4 shadow-md">' +
            '<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">' +
              '<h3 class="text-sm font-semibold text-yellow-800 mb-2 flex items-center"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>¿Necesita cancelar su cita?</h3>' +
              '<p class="text-sm text-yellow-700 mb-3">Puede cancelar esta cita hasta 24 horas antes del horario programado.</p>' +
              '<button id="cita-cancel" class="w-full inline-flex items-center justify-center bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-full transition font-semibold text-sm"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>Cancelar Cita</button>' +
            '</div>' +
          '</div>' : '') +

          (apt.status === 'scheduled' && !canCancel ?
          '<div class="bg-white/60 rounded-lg p-4 shadow-md">' +
            '<div class="flex items-start gap-2 p-4 border border-gray-200 rounded-lg"><i data-lucide="alert-triangle" class="h-4 w-4 mt-0.5"></i><p class="text-sm">Esta cita no puede cancelarse porque faltan menos de 24 horas para el horario programado.</p></div>' +
          '</div>' : '') +

          // Action buttons
          '<div class="bg-white/60 rounded-lg p-4 shadow-md">' +
            '<div class="space-y-2">' +
              '<a href="agendar-visita.html"><button class="w-full inline-flex items-center justify-center bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white px-4 py-2 rounded-full shadow-lg font-semibold text-sm"><i data-lucide="calendar" class="w-4 h-4 mr-2"></i>Agendar Otra Cita</button></a>' +
              '<a href="index.html"><button class="w-full inline-flex items-center justify-center border border-brand text-brand-dark hover:bg-brand hover:text-white px-4 py-2 rounded-full transition font-semibold text-sm"><i data-lucide="home" class="w-4 h-4 mr-2"></i>Volver al Inicio</button></a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    $('cita-root').innerHTML = html;

    var cancelBtn = $('cita-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
          if (baseAppt.id) store.cancelAppointment(baseAppt.id);
          override.status = 'cancelled';
          window.toast.success('Cita cancelada exitosamente');
          render();
          syncPreviewer();
          refreshIcons();
        }
      });
    }
    refreshIcons();
  }

  // --- state previewer (rendered inside the handoff banner) ---------------
  function previewerHTML() {
    return '<div style="display:flex;flex-direction:column;gap:0.5rem;color:#e2e8f0;">' +
      '<label style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center;">Estado' +
        '<select id="pv-status" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:0.375rem;padding:0.2rem 0.4rem;">' +
          '<option value="scheduled">scheduled</option>' +
          '<option value="cancelled">cancelled</option>' +
          '<option value="completed">completed</option>' +
        '</select></label>' +
      '<label style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center;">can_cancel (&gt;24h)' +
        '<input type="checkbox" id="pv-cancel" />' +
      '</label>' +
      '<button id="pv-reset" style="background:#334155;color:#fff;border:none;border-radius:0.375rem;padding:0.3rem;cursor:pointer;">Reset a datos reales</button>' +
    '</div>';
  }

  function syncPreviewer() {
    var e = effective();
    var s = $('pv-status'); var c = $('pv-cancel');
    if (s) s.value = e.apt.status;
    if (c) c.checked = e.canCancel;
  }

  function wirePreviewer() {
    var s = $('pv-status'); var c = $('pv-cancel'); var r = $('pv-reset');
    if (!s) return;
    syncPreviewer();
    s.addEventListener('change', function () { override.status = s.value; render(); syncPreviewer(); });
    c.addEventListener('change', function () { override.canCancel = c.checked; render(); });
    r.addEventListener('click', function () { override = { status: null, canCancel: null }; render(); syncPreviewer(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    baseAppt = getAppointment();
    render();

    if (window.Handoff) window.Handoff.mount({
      route: '/cita/:id',
      source: 'app/cita/[id]/page.tsx',
      behaviors: [
        'Real app reaches this page after booking via router.push(`/cita/${id}?token=…`).',
        'Renders differently for status scheduled / cancelled / completed (icon, title, badge).',
        'Seña/CBU box shows for Práctica+Practica Particular ($35.000) or Consulta+Primera vez ($20.000), only while scheduled.',
        'Cancel button shows only when scheduled AND can_cancel (more than 24h before the appointment).'
      ],
      faked: [
        'Clinic phones, CBU/alias, and obra-social documentation are [PLACEHOLDER] — real copy is in the source file.',
        'Appointment is read from the MockStore by ?id=; the real page fetches /api/appointments/:id?token=.'
      ],
      extraHTML: previewerHTML(),
      onMount: wirePreviewer
    });
    refreshIcons();
  });
})();
