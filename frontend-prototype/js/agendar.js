/* Booking form logic: conditional fields, date constraints, time slots,
 * validation (mirrors the zod schema), and a mock submit that pushes the
 * appointment into the shared MockStore. */
(function () {
  'use strict';

  var store = window.MockStore;
  var pad = store.pad;
  var toISO = store.toISODate;

  // Visit/consult/practice label maps (mirror the real select options)
  var VISIT_LABELS = { '1': 'Consulta', '2': 'Práctica' };
  var CONSULT_LABELS = { '1': 'Primera vez', '2': 'Seguimiento' };
  var PRACTICE_LABELS = { '1': 'Criocirugía', '2': 'Electrocoagulación', '3': 'Biopsia' };

  var els = {};
  function $(id) { return document.getElementById(id); }

  function setError(input, message) {
    var err = findErrorEl(input);
    if (err) {
      err.textContent = message || '';
      err.classList.toggle('hidden', !message);
    }
    input.classList.toggle('border-red-500', !!message);
  }

  // Walk up from the input until we find an ancestor that contains a
  // .field-error element, and return that error element.
  function findErrorEl(input) {
    var wrapper = input.parentElement;
    while (wrapper && wrapper !== document.body) {
      var err = wrapper.querySelector('.field-error');
      if (err) return err;
      wrapper = wrapper.parentElement;
    }
    return null;
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(function (e) {
      e.textContent = '';
      e.classList.add('hidden');
    });
    document.querySelectorAll('input,select').forEach(function (i) {
      i.classList.remove('border-red-500');
    });
  }

  // --- date constraints ----------------------------------------------------
  function isHoliday(isoDate) {
    var year = isoDate.slice(0, 4);
    return isoDate === year + '-01-01' || isoDate === year + '-12-25';
  }

  function isDateAllowed(isoDate) {
    var date = new Date(isoDate + 'T00:00:00');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    // +31 days to match the real AppointmentForm (its message says "30 días")
    var max = new Date(); max.setDate(max.getDate() + 31); max.setHours(0, 0, 0, 0);
    if (date < today) return false;
    if (date > max) return false;
    var dow = date.getDay();
    if (dow === 0 || dow === 6) return false; // weekend
    if (isHoliday(isoDate)) return false;
    // unavailable days from the store
    var unavailable = store.getUnavailableDays().map(function (u) { return u.date; });
    if (unavailable.indexOf(isoDate) !== -1) return false;
    return true;
  }

  function setupDateInput() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var max = new Date(); max.setDate(max.getDate() + 31);
    els.date.min = toISO(today);
    els.date.max = toISO(max);
  }

  // --- health insurance select --------------------------------------------
  function refreshInsurances() {
    var visit = els.visit.value;
    var all = store.getHealthInsurances();
    var filtered = all.filter(function (ins) {
      if (visit === '1') return ins.name !== 'Practica Particular';
      if (visit === '2') return ins.name !== 'Particular';
      return true;
    });
    var current = els.insurance.value;
    els.insurance.innerHTML = '<option value="">Selecciona una obra social</option>' +
      filtered.map(function (ins) {
        var label = ins.name + (ins.price ? ' - ' + ins.price : '');
        return '<option value="' + ins.name + '">' + label + '</option>';
      }).join('');
    els.insurance.disabled = !visit;
    // keep selection if still valid
    if (current && filtered.some(function (i) { return i.name === current; })) {
      els.insurance.value = current;
    }
  }

  // --- conditional visit sub-fields & deposit ------------------------------
  function refreshConditionalFields() {
    var visit = els.visit.value;
    els.consultWrapper.classList.toggle('hidden', visit !== '1');
    els.practiceWrapper.classList.toggle('hidden', visit !== '2');
    if (visit !== '1') els.consult.value = '';
    if (visit !== '2') els.practice.value = '';
    refreshInsurances();
    refreshDeposit();
  }

  function refreshDeposit() {
    var visit = els.visit.value;
    var insurance = els.insurance.value;
    var consult = els.consult.value;
    var show35000 = visit === '2' && insurance === 'Practica Particular';
    var show20000 = visit === '1' && consult === '1';
    var show = show35000 || show20000;
    els.depositWrapper.classList.toggle('hidden', !show);
    els.depositWrapper.classList.toggle('flex', show);
    if (show) {
      els.depositLabel.textContent = show35000
        ? 'Entiendo que para confirmar la cita por completo debo abonar una seña de $35.000 por ser una práctica particular.'
        : 'Entiendo que para confirmar la cita por completo debo abonar una seña de $20.000 por transferencia por ser una consulta por primera vez.';
    } else {
      els.deposit.checked = false;
    }
  }

  // --- time slots ----------------------------------------------------------
  function refreshTimes() {
    var iso = els.date.value;
    els.timeWrapper.classList.add('hidden');
    els.time.value = '';
    els.noTimes.classList.add('hidden');
    if (!iso) return;

    if (!isDateAllowed(iso)) return; // handled by validate on submit/change

    var times = store.availableTimesFor(iso);
    els.timeWrapper.classList.remove('hidden');
    if (times.length === 0) {
      els.time.innerHTML = '<option value="">Selecciona un horario</option>';
      els.noTimes.classList.remove('hidden');
      els.time.classList.add('hidden');
      return;
    }
    els.time.classList.remove('hidden');
    els.time.innerHTML = '<option value="">Selecciona un horario</option>' +
      times.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
  }

  // --- validation (mirrors the zod schema) ---------------------------------
  function validate() {
    clearErrors();
    var ok = true;

    if (els.firstName.value.trim().length < 2) {
      setError(els.firstName, 'El nombre debe tener al menos 2 caracteres'); ok = false;
    }
    if (els.lastName.value.trim().length < 2) {
      setError(els.lastName, 'El apellido debe tener al menos 2 caracteres'); ok = false;
    }
    var phone = els.phone.value.replace(/[^0-9]/g, '');
    if (!/^[0-9]+$/.test(els.phone.value) || phone.length < 8 || phone.length > 12) {
      setError(els.phone, 'Debe ser un número válido (8-12 dígitos)'); ok = false;
    }
    if (els.visit.value !== '1' && els.visit.value !== '2') {
      setError(els.visit, 'Debes seleccionar un tipo de visita'); ok = false;
    }
    if (els.visit.value === '1' && !els.consult.value) {
      setError(els.consult, 'Debes seleccionar un tipo de consulta'); ok = false;
    }
    if (els.visit.value === '2' && !els.practice.value) {
      setError(els.practice, 'Debes seleccionar un tipo de práctica'); ok = false;
    }
    if (!els.insurance.value) {
      setError(els.insurance, 'Debes seleccionar una obra social'); ok = false;
    }
    var iso = els.date.value;
    if (!iso) {
      setError(els.date, 'Debes seleccionar una fecha'); ok = false;
    } else if (!isDateAllowed(iso)) {
      setError(els.date, 'Fecha no disponible (pasada, feriado, fin de semana o fuera de rango de 30 días)'); ok = false;
    }
    if (iso && isDateAllowed(iso)) {
      if (!els.time.value) {
        setError(els.time, 'Debes seleccionar un horario'); ok = false;
      }
    }
    // deposit
    var show35000 = els.visit.value === '2' && els.insurance.value === 'Practica Particular';
    var show20000 = els.visit.value === '1' && els.consult.value === '1';
    if ((show35000 || show20000) && !els.deposit.checked) {
      setError(els.deposit, 'Debes confirmar que entendés el monto de la seña a abonar'); ok = false;
    }
    return ok;
  }

  // --- submit --------------------------------------------------------------
  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      window.toast.error('Por favor, revisa los campos del formulario');
      return;
    }
    var visit = els.visit.value;
    var apt = {
      patient_name: els.firstName.value.trim() + ' ' + els.lastName.value.trim(),
      patient_phone: els.phone.value.replace(/[^0-9]/g, ''),
      appointment_date: els.date.value,
      appointment_time: els.time.value,
      visit_type: VISIT_LABELS[visit],
      consult_type: visit === '1' ? CONSULT_LABELS[els.consult.value] : null,
      practice_type: visit === '2' ? PRACTICE_LABELS[els.practice.value] : null,
      health_insurance: els.insurance.value,
      notes: els.notes.value.trim()
    };
    var saved = store.addAppointment(apt);
    window.toast.success('Cita creada exitosamente');

    // Mirrors the real AppointmentForm: router.push(`/cita/${id}?token=...`).
    // Here we navigate to the confirmation mockup with the new appointment id.
    window.location.href = 'cita.html?id=' + saved.id;
  }

  // --- init ----------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    els = {
      form: $('appointment-form'),
      firstName: $('first_name'),
      lastName: $('last_name'),
      phone: $('phone_number'),
      visit: $('visit_type'),
      consult: $('consult_type'),
      practice: $('practice_type'),
      consultWrapper: $('consult-type-wrapper'),
      practiceWrapper: $('practice-type-wrapper'),
      insurance: $('health_insurance'),
      date: $('appointment_date'),
      time: $('appointment_time'),
      timeWrapper: $('time-wrapper'),
      noTimes: $('no-times'),
      notes: $('notes'),
      deposit: $('deposit_acknowledgment'),
      depositWrapper: $('deposit-wrapper'),
      depositLabel: $('deposit-label'),
      submit: $('submit-btn')
    };

    setupDateInput();
    refreshConditionalFields();

    // phone: digits only
    els.phone.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });

    els.visit.addEventListener('change', refreshConditionalFields);
    els.consult.addEventListener('change', refreshDeposit);
    els.insurance.addEventListener('change', refreshDeposit);
    els.date.addEventListener('change', function () {
      if (els.date.value && !isDateAllowed(els.date.value)) {
        setError(els.date, 'Fecha no disponible (pasada, feriado, fin de semana o fuera de rango de 30 días)');
        els.timeWrapper.classList.add('hidden');
        return;
      }
      setError(els.date, '');
      refreshTimes();
    });

    els.form.addEventListener('submit', onSubmit);

    if (window.Handoff) window.Handoff.mount(handoffConfig());
    if (window.lucide) window.lucide.createIcons();
  });

  function handoffConfig() {
    return {
      route: '/agendar-visita',
      source: 'app/agendar-visita/page.tsx → components/agendar-visita/AppointmentForm.tsx + AvailableTimesComponentImproved.tsx',
      behaviors: [
        'Tipo de Visita = Consulta(1)/Práctica(2); reveals Tipo de Consulta or Tipo de Práctica.',
        'Obra Social is disabled until a visit type is chosen; Consulta hides "Practica Particular", Práctica hides "Particular".',
        'Date allowed: today → +31 days, weekends + feriados (01-01, 12-25) + blocked days disabled.',
        'Time slots are 20-min intervals built from the work schedule, minus already-booked times.',
        'Deposit checkbox required for Práctica+Practica Particular ($35.000) or Consulta+Primera vez ($20.000).',
        'On submit, the real app POSTs /api/appointments/create then redirects to /cita/[id]?token=… — here we navigate to cita.html?id=.'
      ],
      faked: [
        'Obras sociales / work schedule / availability come from the in-browser MockStore, not the DB.',
        'No real POST, validation server-side, rate limiting, or WhatsApp messaging.'
      ]
    };
  }
})();
