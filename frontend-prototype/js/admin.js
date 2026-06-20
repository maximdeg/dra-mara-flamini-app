/* Provider dashboard: 5 tabs driven by the shared MockStore. No auth gate. */
(function () {
  'use strict';

  var store = window.MockStore;
  var pad = store.pad;
  var toISO = store.toISODate;

  var DAYS_OF_WEEK = [
    { value: 'Monday', label: 'Lunes' },
    { value: 'Tuesday', label: 'Martes' },
    { value: 'Wednesday', label: 'Miércoles' },
    { value: 'Thursday', label: 'Jueves' },
    { value: 'Friday', label: 'Viernes' },
    { value: 'Saturday', label: 'Sábado' },
    { value: 'Sunday', label: 'Domingo' }
  ];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function todayISO() {
    var t = new Date(); t.setHours(0, 0, 0, 0); return toISO(t);
  }
  function formatDDMMYYYY(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }

  // ====================================================================== //
  //  Tabs                                                                  //
  // ====================================================================== //
  var renderers = {};

  function activateTab(name) {
    document.querySelectorAll('.tab-trigger').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === name));
    });
    document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.add('hidden'); });
    $('tab-' + name).classList.remove('hidden');
    if (renderers[name]) renderers[name]();
    refreshIcons();
  }

  // ====================================================================== //
  //  Citas (appointments)                                                  //
  // ====================================================================== //
  var apptFilters = { status: 'all', dateRange: 'today_and_future', startDate: '', endDate: '' };

  function statusBadge(status) {
    var map = {
      scheduled: ['bg-green-100 text-green-800', 'Programada'],
      cancelled: ['bg-red-100 text-red-800', 'Cancelada'],
      completed: ['bg-gray-100 text-gray-800', 'Completada']
    };
    var m = map[status] || map.completed;
    return '<span class="text-xs px-2 py-1 rounded self-start ' + m[0] + '">' + m[1] + '</span>';
  }

  function whatsappStatus(apt) {
    if (!apt.whatsapp_sent) return '';
    if (apt.whatsapp_sent_at) {
      return '<div class="flex items-center gap-1 text-xs text-blue-600"><i data-lucide="check-check" class="h-3 w-3"></i><span>Mensaje recibido</span></div>';
    }
    return '<div class="flex items-center gap-1 text-xs text-gray-600"><i data-lucide="check" class="h-3 w-3"></i><span>Mensaje enviado</span></div>';
  }

  renderers.appointments = function () {
    var panel = $('tab-appointments');
    var all = store.getAppointments();
    var today = todayISO();
    var f = apptFilters;
    var list = all.filter(function (a) {
      if (f.status !== 'all' && a.status !== f.status) return false;
      if (f.dateRange === 'today_and_future' && a.appointment_date < today) return false;
      if (f.startDate && a.appointment_date < f.startDate) return false;
      if (f.endDate && a.appointment_date > f.endDate) return false;
      return true;
    }).sort(function (a, b) {
      return (a.appointment_date + a.appointment_time).localeCompare(b.appointment_date + b.appointment_time);
    });

    var cards = list.length === 0
      ? '<p class="text-center text-gray-500 py-8">No hay citas disponibles</p>'
      : '<div class="space-y-2">' + list.map(function (a) {
          var details = esc(a.visit_type) +
            (a.consult_type ? ' - ' + esc(a.consult_type) : '') +
            (a.practice_type ? ' - ' + esc(a.practice_type) : '') +
            ' • ' + esc(a.health_insurance);
          var cancelBtn = a.status === 'scheduled'
            ? '<div class="flex-shrink-0 sm:ml-4"><button data-cancel="' + a.id + '" class="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"><i data-lucide="x" class="mr-2 h-4 w-4"></i>Cancelar</button></div>'
            : '';
          return '<div class="bg-white p-4 rounded-lg border border-gray-200">' +
            '<div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">' +
              '<div class="space-y-2 flex-1 min-w-0">' +
                '<div class="flex flex-col sm:flex-row sm:items-center gap-2">' +
                  '<h3 class="font-semibold text-base sm:text-lg truncate">' + esc(a.patient_name) + '</h3>' +
                  statusBadge(a.status) +
                '</div>' +
                '<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">' +
                  '<span class="flex items-center gap-1"><i data-lucide="calendar" class="h-4 w-4"></i>' + formatDDMMYYYY(a.appointment_date) + '</span>' +
                  '<span class="flex items-center gap-1"><i data-lucide="clock" class="h-4 w-4"></i>' + esc(a.appointment_time) + '</span>' +
                  '<span class="flex items-center gap-1"><i data-lucide="phone" class="h-4 w-4"></i>' + esc(a.patient_phone) + '</span>' +
                '</div>' +
                '<div class="text-sm"><span class="font-medium">' + details + '</span></div>' +
                whatsappStatus(a) +
              '</div>' +
              cancelBtn +
            '</div>' +
          '</div>';
        }).join('') + '</div>';

    panel.innerHTML =
      '<div class="bg-white rounded-xl border border-gray-200 shadow-sm">' +
        '<div class="p-6 border-b border-gray-100"><h2 class="text-xl font-semibold">Lista de Citas</h2><p class="text-sm text-gray-500">Gestiona todas tus citas</p></div>' +
        '<div class="p-6 space-y-4">' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">' +
            '<div><label class="block text-sm font-medium mb-1">Estado</label>' +
              selectHtml('f-status', [['all', 'Todos'], ['scheduled', 'Programadas'], ['cancelled', 'Canceladas'], ['completed', 'Completadas']], f.status) + '</div>' +
            '<div><label class="block text-sm font-medium mb-1">Rango de fechas</label>' +
              selectHtml('f-range', [['today_and_future', 'Hoy y futuras'], ['all', 'Todas (incl. pasadas)']], f.dateRange) + '</div>' +
            '<div><label class="block text-sm font-medium mb-1">Fecha Inicio</label><input id="f-start" type="date" value="' + f.startDate + '" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
            '<div><label class="block text-sm font-medium mb-1">Fecha Fin</label><input id="f-end" type="date" value="' + f.endDate + '" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
          '</div>' +
          cards +
        '</div>' +
      '</div>';

    $('f-status').addEventListener('change', function () { f.status = this.value; renderers.appointments(); });
    $('f-range').addEventListener('change', function () { f.dateRange = this.value; renderers.appointments(); });
    $('f-start').addEventListener('change', function () { f.startDate = this.value; renderers.appointments(); });
    $('f-end').addEventListener('change', function () { f.endDate = this.value; renderers.appointments(); });
    panel.querySelectorAll('[data-cancel]').forEach(function (btn) {
      btn.addEventListener('click', function () { openCancelDialog(Number(btn.dataset.cancel)); });
    });
    refreshIcons();
  };

  function selectHtml(id, options, selected) {
    return '<select id="' + id + '" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white">' +
      options.map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === selected ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>';
  }

  // cancel dialog
  var pendingCancelId = null;
  function openCancelDialog(id) {
    pendingCancelId = id;
    $('cancel-dialog').classList.add('open');
  }
  function closeCancelDialog() {
    pendingCancelId = null;
    $('cancel-dialog').classList.remove('open');
  }

  // ====================================================================== //
  //  Calendario                                                            //
  // ====================================================================== //
  var calMonth = new Date(); calMonth.setDate(1); calMonth.setHours(0, 0, 0, 0);
  var calSelectedDate = null;

  function isWorkingWeekday(date) {
    var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var day = store.getWorkSchedule().find(function (d) { return d.day_of_week === names[date.getDay()]; });
    return !!(day && day.is_working_day);
  }

  function dayInfo(iso) {
    var date = new Date(iso + 'T00:00:00');
    var appts = store.getAppointments().filter(function (a) { return a.appointment_date === iso; });
    var scheduled = appts.filter(function (a) { return a.status === 'scheduled'; });
    var unavailable = store.getUnavailableDays().some(function (u) { return u.date === iso; });
    var working = isWorkingWeekday(date) && !unavailable;
    var remaining = working ? store.availableTimesFor(iso).length : 0;
    return {
      iso: iso,
      working: working,
      scheduled: scheduled.length,
      cancelled: appts.filter(function (a) { return a.status === 'cancelled'; }).length,
      completed: appts.filter(function (a) { return a.status === 'completed'; }).length,
      is_full: working && scheduled.length > 0 && remaining === 0,
      appointments: appts
    };
  }

  renderers.calendar = function () {
    var panel = $('tab-calendar');
    var year = calMonth.getFullYear();
    var month = calMonth.getMonth();
    var firstDow = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var summary = { total: 0, working: 0, full: 0, total_days: daysInMonth };
    var infos = {};
    for (var d = 1; d <= daysInMonth; d++) {
      var iso = year + '-' + pad(month + 1) + '-' + pad(d);
      var info = dayInfo(iso);
      infos[iso] = info;
      summary.total += info.scheduled;
      if (info.working) summary.working++;
      if (info.is_full) summary.full++;
    }

    var cells = '';
    for (var i = 0; i < firstDow; i++) cells += '<div class="p-2"></div>';
    for (var day = 1; day <= daysInMonth; day++) {
      var iso2 = year + '-' + pad(month + 1) + '-' + pad(day);
      var info2 = infos[iso2];
      var color = !info2.working ? 'bg-gray-200' : info2.is_full ? 'bg-red-200' : info2.scheduled > 0 ? 'bg-yellow-200' : 'bg-green-200';
      cells += '<div data-day="' + iso2 + '" class="p-2 border rounded cursor-pointer hover:opacity-80 ' + color + '">' +
        '<div class="text-sm font-medium">' + day + '</div>' +
        (info2.scheduled > 0 ? '<div class="text-xs text-center mt-1">' + info2.scheduled + ' cita' + (info2.scheduled !== 1 ? 's' : '') + '</div>' : '') +
        '</div>';
    }

    var dowHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      .map(function (h) { return '<div class="text-center font-semibold p-2">' + h + '</div>'; }).join('');

    var detail = '';
    if (calSelectedDate && infos[calSelectedDate]) {
      var di = infos[calSelectedDate];
      var apptsHtml = di.appointments.length === 0 ? '' :
        '<div class="mt-4 space-y-2"><h4 class="font-semibold">Citas del día:</h4>' +
        di.appointments.map(function (a) {
          return '<div class="p-2 bg-gray-50 rounded text-sm"><div class="font-medium">' + esc(a.appointment_time) + ' - ' + esc(a.patient_name) + '</div>' +
            '<div class="text-gray-500">' + esc(a.visit_type) + ' ' + esc(a.consult_type || a.practice_type || '') + '</div></div>';
        }).join('') + '</div>';
      detail = '<div class="bg-white rounded-lg border border-gray-200 mt-4 p-4">' +
        '<h3 class="font-semibold mb-2">' + formatDDMMYYYY(calSelectedDate) + '</h3>' +
        '<div class="grid grid-cols-3 gap-4 text-sm">' +
          '<div><span class="font-medium">Programadas:</span> ' + di.scheduled + '</div>' +
          '<div><span class="font-medium">Canceladas:</span> ' + di.cancelled + '</div>' +
          '<div><span class="font-medium">Completadas:</span> ' + di.completed + '</div>' +
        '</div>' + apptsHtml + '</div>';
    }

    panel.innerHTML =
      '<div class="bg-white rounded-xl border border-gray-200 shadow-sm">' +
        '<div class="p-6 border-b border-gray-100"><h2 class="text-xl font-semibold">Calendario</h2><p class="text-sm text-gray-500">Vista mensual de tus citas</p></div>' +
        '<div class="p-6 space-y-4">' +
          '<div class="flex justify-between items-center">' +
            '<button id="cal-prev" class="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">Mes Anterior</button>' +
            '<h2 class="text-xl font-semibold capitalize">' + MONTHS[month] + ' ' + year + '</h2>' +
            '<button id="cal-next" class="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">Mes Siguiente</button>' +
          '</div>' +
          '<div class="grid grid-cols-4 gap-4">' +
            summaryTile('blue', summary.total, 'Total Citas') +
            summaryTile('green', summary.working, 'Días Laborables') +
            summaryTile('yellow', summary.full, 'Días Llenos') +
            summaryTile('gray', summary.total_days, 'Total Días') +
          '</div>' +
          '<div class="grid grid-cols-7 gap-2">' + dowHeaders + cells + '</div>' +
          detail +
        '</div>' +
      '</div>';

    $('cal-prev').addEventListener('click', function () { calMonth = new Date(year, month - 1, 1); calSelectedDate = null; renderers.calendar(); refreshIcons(); });
    $('cal-next').addEventListener('click', function () { calMonth = new Date(year, month + 1, 1); calSelectedDate = null; renderers.calendar(); refreshIcons(); });
    panel.querySelectorAll('[data-day]').forEach(function (el) {
      el.addEventListener('click', function () { calSelectedDate = el.dataset.day; renderers.calendar(); refreshIcons(); });
    });
  };

  function summaryTile(color, value, label) {
    var bg = { blue: 'bg-blue-50', green: 'bg-green-50', yellow: 'bg-yellow-50', gray: 'bg-gray-50' }[color];
    return '<div class="text-center p-4 ' + bg + ' rounded"><div class="text-2xl font-bold">' + value + '</div><div class="text-sm text-gray-500">' + label + '</div></div>';
  }

  // ====================================================================== //
  //  Perfil                                                                //
  // ====================================================================== //
  renderers.profile = function () {
    var panel = $('tab-profile');
    var p = store.getProfile();
    panel.innerHTML =
      '<div class="space-y-4">' +
        '<div class="bg-white rounded-xl border border-gray-200 shadow-sm">' +
          '<div class="p-6 border-b border-gray-100"><h2 class="text-xl font-semibold">Información Personal</h2><p class="text-sm text-gray-500">Actualiza tu información personal</p></div>' +
          '<div class="p-6"><form id="profile-form" class="space-y-4">' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
              field('p-email', 'Email', 'email', p.email) +
              field('p-phone', 'Teléfono WhatsApp', 'tel', p.whatsapp_phone_number || '') +
              field('p-first', 'Nombre', 'text', p.first_name || '') +
              field('p-last', 'Apellido', 'text', p.last_name || '') +
            '</div>' +
            '<button type="submit" class="px-4 py-2 rounded-md bg-brand-dark text-white text-sm font-medium hover:bg-brand">Guardar Cambios</button>' +
          '</form></div>' +
        '</div>' +
        '<div class="bg-white rounded-xl border border-gray-200 shadow-sm">' +
          '<div class="p-6 border-b border-gray-100"><h2 class="text-xl font-semibold">Cambiar Contraseña</h2><p class="text-sm text-gray-500">Actualiza tu contraseña de acceso</p></div>' +
          '<div class="p-6"><form id="password-form" class="space-y-4">' +
            field('pw-current', 'Contraseña Actual', 'password', '') +
            field('pw-new', 'Nueva Contraseña', 'password', '') +
            field('pw-confirm', 'Confirmar Nueva Contraseña', 'password', '') +
            '<button type="submit" class="px-4 py-2 rounded-md bg-brand-dark text-white text-sm font-medium hover:bg-brand">Cambiar Contraseña</button>' +
          '</form></div>' +
        '</div>' +
      '</div>';

    $('profile-form').addEventListener('submit', function (e) {
      e.preventDefault();
      store.updateProfile({
        email: $('p-email').value,
        whatsapp_phone_number: $('p-phone').value,
        first_name: $('p-first').value,
        last_name: $('p-last').value
      });
      window.toast.success('Perfil actualizado exitosamente');
    });
    $('password-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('pw-new').value !== $('pw-confirm').value) {
        window.toast.error('Las contraseñas no coinciden');
        return;
      }
      if ($('pw-new').value.length < 8) {
        window.toast.error('La nueva contraseña debe tener al menos 8 caracteres');
        return;
      }
      $('password-form').reset();
      window.toast.success('Contraseña actualizada exitosamente');
    });
  };

  function field(id, label, type, value) {
    return '<div><label class="block text-sm font-medium mb-1" for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" type="' + type + '" value="' + esc(value) + '" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"></div>';
  }

  // ====================================================================== //
  //  Horarios (schedule)                                                   //
  // ====================================================================== //
  var openSlotDay = null;

  renderers.schedule = function () {
    var panel = $('tab-schedule');
    var schedule = store.getWorkSchedule();
    var scheduleMap = {};
    schedule.forEach(function (d) { scheduleMap[d.day_of_week] = d; });

    var dayCards = DAYS_OF_WEEK.map(function (day) {
      var sch = scheduleMap[day.value] || { is_working_day: false, available_slots: [] };
      var slotsHtml = sch.is_working_day && sch.available_slots.length
        ? '<div class="space-y-2 mb-4">' + sch.available_slots.map(function (s) {
            return '<div class="flex items-center justify-between p-3 bg-gray-50 rounded">' +
              '<span class="font-medium">' + esc(s.start_time) + ' - ' + esc(s.end_time) + '</span>' +
              '<button data-del-slot="' + s.id + '" class="p-1 hover:bg-gray-200 rounded"><i data-lucide="trash-2" class="h-4 w-4 text-red-500"></i></button>' +
            '</div>';
          }).join('') + '</div>'
        : '';
      var addForm = (sch.is_working_day && openSlotDay === day.value)
        ? '<div class="flex gap-2 p-3 bg-blue-50 rounded">' +
            '<input type="time" id="slot-start-' + day.value + '" class="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm">' +
            '<input type="time" id="slot-end-' + day.value + '" class="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm">' +
            '<button data-add-slot="' + day.value + '" class="px-3 py-1 rounded-md bg-brand-dark text-white text-sm"><i data-lucide="plus" class="h-4 w-4"></i></button>' +
          '</div>'
        : '';
      var toggleBtn = sch.is_working_day
        ? '<button data-toggle-add="' + day.value + '" class="text-sm px-3 py-1 rounded-md hover:bg-gray-100 text-gray-600">' + (openSlotDay === day.value ? 'Ocultar' : 'Agregar Horario') + '</button>'
        : '';
      return '<div class="bg-white p-4 rounded-lg border border-gray-200">' +
        '<div class="flex items-center justify-between mb-4">' +
          '<div class="flex items-center gap-3">' +
            '<input type="checkbox" data-working="' + day.value + '"' + (sch.is_working_day ? ' checked' : '') + ' class="h-5 w-5">' +
            '<span class="text-lg font-semibold">' + day.label + '</span>' +
          '</div>' + toggleBtn +
        '</div>' + slotsHtml + addForm +
      '</div>';
    }).join('');

    var unavailable = store.getUnavailableDays();
    var unavailableHtml = unavailable.length
      ? '<div class="space-y-2">' + unavailable.map(function (u) {
          return '<div class="flex items-center justify-between p-3 bg-gray-50 rounded">' +
            '<span>' + formatDDMMYYYY(u.date) + '</span>' +
            '<button data-del-unavailable="' + u.id + '" class="p-1 hover:bg-gray-200 rounded"><i data-lucide="trash-2" class="h-4 w-4 text-red-500"></i></button>' +
          '</div>';
        }).join('') + '</div>'
      : '';

    panel.innerHTML =
      '<div class="space-y-4">' +
        '<div class="bg-white rounded-xl border border-gray-200 shadow-sm">' +
          '<div class="p-6 border-b border-gray-100"><h2 class="text-xl font-semibold">Horarios de Trabajo</h2><p class="text-sm text-gray-500">Configura tus días y horarios disponibles</p></div>' +
          '<div class="p-6 space-y-4">' + dayCards + '</div>' +
        '</div>' +
        '<div class="bg-white rounded-xl border border-gray-200 shadow-sm">' +
          '<div class="p-6 border-b border-gray-100"><h2 class="text-xl font-semibold">Días No Laborables</h2><p class="text-sm text-gray-500">Bloquea días específicos (festivos, vacaciones)</p></div>' +
          '<div class="p-6 space-y-4">' +
            '<div class="flex gap-2">' +
              '<input id="unavailable-date" type="text" placeholder="dd/mm/aaaa" maxlength="10" class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm">' +
              '<button id="add-unavailable" class="px-4 py-2 rounded-md bg-brand-dark text-white text-sm font-medium hover:bg-brand inline-flex items-center"><i data-lucide="plus" class="mr-2 h-4 w-4"></i>Agregar</button>' +
            '</div>' + unavailableHtml +
          '</div>' +
        '</div>' +
      '</div>';

    panel.querySelectorAll('[data-working]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        store.setWorkingDay(cb.dataset.working, cb.checked);
        window.toast.success('Día actualizado exitosamente');
        renderers.schedule(); refreshIcons();
      });
    });
    panel.querySelectorAll('[data-toggle-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        openSlotDay = openSlotDay === b.dataset.toggleAdd ? null : b.dataset.toggleAdd;
        renderers.schedule(); refreshIcons();
      });
    });
    panel.querySelectorAll('[data-add-slot]').forEach(function (b) {
      b.addEventListener('click', function () {
        var dv = b.dataset.addSlot;
        var start = $('slot-start-' + dv).value;
        var end = $('slot-end-' + dv).value;
        if (!start || !end) { window.toast.error('Por favor completa ambos horarios'); return; }
        if (start >= end) { window.toast.error('La hora de inicio debe ser anterior a la de fin'); return; }
        store.addSlot(dv, { start_time: start, end_time: end });
        window.toast.success('Franja horaria agregada exitosamente');
        renderers.schedule(); refreshIcons();
      });
    });
    panel.querySelectorAll('[data-del-slot]').forEach(function (b) {
      b.addEventListener('click', function () {
        store.removeSlot(Number(b.dataset.delSlot));
        window.toast.success('Franja horaria eliminada exitosamente');
        renderers.schedule(); refreshIcons();
      });
    });
    $('add-unavailable').addEventListener('click', function () {
      var iso = parseDDMMYYYY($('unavailable-date').value);
      if (!iso) { window.toast.error('Por favor ingresa una fecha válida (dd/mm/aaaa)'); return; }
      store.addUnavailableDay(iso);
      window.toast.success('Día no laborable agregado exitosamente');
      renderers.schedule(); refreshIcons();
    });
    $('unavailable-date').addEventListener('input', function () {
      var c = this.value.replace(/[^\d]/g, '');
      var f = c.substring(0, 2);
      if (c.length > 2) f += '/' + c.substring(2, 4);
      if (c.length > 4) f += '/' + c.substring(4, 8);
      this.value = f;
    });
    panel.querySelectorAll('[data-del-unavailable]').forEach(function (b) {
      b.addEventListener('click', function () {
        store.removeUnavailableDay(Number(b.dataset.delUnavailable));
        window.toast.success('Día no laborable eliminado exitosamente');
        renderers.schedule(); refreshIcons();
      });
    });
  };

  function parseDDMMYYYY(value) {
    var parts = value.replace(/[^\d/]/g, '').split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      var iso = parts[2] + '-' + pad(parts[1]) + '-' + pad(parts[0]);
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso) && !isNaN(new Date(iso + 'T00:00:00').getTime())) return iso;
    }
    return null;
  }

  // ====================================================================== //
  //  Obras sociales (health insurance)                                     //
  // ====================================================================== //
  var editingInsurance = null;

  renderers['health-insurance'] = function () {
    var panel = $('tab-health-insurance');
    var list = store.getHealthInsurances();

    var listHtml = list.length === 0
      ? '<p class="text-center text-gray-500 py-6">No hay obras sociales cargadas. Agrega una arriba.</p>'
      : '<div class="space-y-2">' + list.map(function (item) {
          if (editingInsurance === item.name) {
            return '<div class="flex flex-wrap items-end gap-3 p-4 rounded-lg border bg-gray-50">' +
              '<div class="flex-1 min-w-[120px]"><label class="block text-sm font-medium mb-1">Nombre</label><input id="edit-name" value="' + esc(item.name) + '" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
              '<div class="w-32"><label class="block text-sm font-medium mb-1">Precio</label><input id="edit-price" value="' + esc(item.price || '') + '" placeholder="$" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
              '<div class="flex-1 min-w-[120px]"><label class="block text-sm font-medium mb-1">Notas</label><input id="edit-notes" value="' + esc(item.notes || '') + '" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
              '<button data-save-ins="' + esc(item.name) + '" class="px-3 py-2 rounded-md bg-brand-dark text-white text-sm inline-flex items-center"><i data-lucide="check-circle-2" class="h-4 w-4"></i><span class="ml-1">Guardar</span></button>' +
              '<button data-cancel-ins class="px-3 py-2 rounded-md border border-gray-300 text-sm inline-flex items-center"><i data-lucide="x" class="h-4 w-4"></i><span class="ml-1">Cancelar</span></button>' +
            '</div>';
          }
          return '<div class="bg-white p-4 rounded-lg border border-gray-200">' +
            '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">' +
              '<div><span class="font-medium">' + esc(item.name) + '</span>' +
                (item.price ? '<span class="text-gray-500 ml-2">— ' + esc(item.price) + '</span>' : '') +
                (item.notes ? '<span class="text-gray-500 text-sm block mt-1">' + esc(item.notes) + '</span>' : '') +
              '</div>' +
              '<div class="flex gap-2">' +
                '<button data-edit-ins="' + esc(item.name) + '" class="px-3 py-1.5 rounded-md border border-gray-300 text-sm inline-flex items-center"><i data-lucide="pencil" class="h-4 w-4"></i><span class="ml-1">Editar</span></button>' +
                '<button data-del-ins="' + esc(item.name) + '" class="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm inline-flex items-center"><i data-lucide="trash-2" class="h-4 w-4"></i><span class="ml-1">Eliminar</span></button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';

    panel.innerHTML =
      '<div class="bg-white rounded-xl border border-gray-200 shadow-sm">' +
        '<div class="p-6 border-b border-gray-100"><h2 class="text-xl font-semibold">Obras sociales</h2><p class="text-sm text-gray-500">Gestiona la lista de obras sociales que pueden elegir los pacientes al agendar</p></div>' +
        '<div class="p-6 space-y-4">' +
          '<div class="rounded-lg border p-4 space-y-3">' +
            '<h3 class="font-medium">Agregar obra social</h3>' +
            '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
              '<div><label class="block text-sm font-medium mb-1">Nombre</label><input id="add-ins-name" placeholder="Ej: OSDE" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
              '<div><label class="block text-sm font-medium mb-1">Precio (opcional)</label><input id="add-ins-price" placeholder="Ej: $25.000" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
              '<div><label class="block text-sm font-medium mb-1">Notas (opcional)</label><input id="add-ins-notes" placeholder="Ej: excepto plan verde" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>' +
            '</div>' +
            '<button id="add-ins-btn" class="px-4 py-2 rounded-md bg-brand-dark text-white text-sm font-medium hover:bg-brand inline-flex items-center"><i data-lucide="plus" class="h-4 w-4"></i><span class="ml-2">Agregar</span></button>' +
          '</div>' + listHtml +
        '</div>' +
      '</div>';

    $('add-ins-btn').addEventListener('click', function () {
      var name = $('add-ins-name').value.trim();
      if (!name) { window.toast.error('El nombre es obligatorio'); return; }
      if (store.getHealthInsurances().some(function (i) { return i.name === name; })) {
        window.toast.error('Ya existe una obra social con ese nombre'); return;
      }
      store.addHealthInsurance({ name: name, price: $('add-ins-price').value.trim(), notes: $('add-ins-notes').value.trim() });
      window.toast.success('Obra social agregada');
      renderers['health-insurance'](); refreshIcons();
    });
    panel.querySelectorAll('[data-edit-ins]').forEach(function (b) {
      b.addEventListener('click', function () { editingInsurance = b.dataset.editIns; renderers['health-insurance'](); refreshIcons(); });
    });
    panel.querySelectorAll('[data-cancel-ins]').forEach(function (b) {
      b.addEventListener('click', function () { editingInsurance = null; renderers['health-insurance'](); refreshIcons(); });
    });
    panel.querySelectorAll('[data-save-ins]').forEach(function (b) {
      b.addEventListener('click', function () {
        var newName = $('edit-name').value.trim();
        if (!newName) { window.toast.error('El nombre es obligatorio'); return; }
        store.updateHealthInsurance(b.dataset.saveIns, {
          name: newName, price: $('edit-price').value.trim(), notes: $('edit-notes').value.trim()
        });
        editingInsurance = null;
        window.toast.success('Obra social actualizada');
        renderers['health-insurance'](); refreshIcons();
      });
    });
    panel.querySelectorAll('[data-del-ins]').forEach(function (b) {
      b.addEventListener('click', function () {
        var name = b.dataset.delIns;
        if (window.confirm('¿Eliminar la obra social "' + name + '"? Los pacientes ya no podrán seleccionarla.')) {
          store.removeHealthInsurance(name);
          window.toast.success('Obra social eliminada');
          renderers['health-insurance'](); refreshIcons();
        }
      });
    });
  };

  // ====================================================================== //
  //  Init                                                                  //
  // ====================================================================== //
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tab-trigger').forEach(function (btn) {
      btn.addEventListener('click', function () { activateTab(btn.dataset.tab); });
    });

    $('cancel-dialog-no').addEventListener('click', closeCancelDialog);
    $('cancel-dialog-yes').addEventListener('click', function () {
      if (pendingCancelId != null) {
        store.cancelAppointment(pendingCancelId);
        window.toast.success('Cita cancelada exitosamente. Se envió un mensaje al paciente.');
      }
      closeCancelDialog();
      renderers.appointments();
      refreshIcons();
    });

    activateTab('appointments');

    if (window.Handoff) window.Handoff.mount({
      route: '/admin',
      source: 'app/admin/page.tsx',
      behaviors: [
        'Real page is gated by a Bearer token in localStorage; here the auth gate is removed (always "authenticated").',
        '5 tabs: Citas, Calendario, Perfil, Horarios, Obras sociales.',
        'Citas: filters (estado, rango, fechas) + cancel (confirm dialog → status=cancelled).',
        'Calendario: month grid colored gray=no laborable / red=lleno / yellow=con citas / green=libre.',
        'Horarios: per-day working toggle + 20-min-friendly slots + días no laborables (dd/mm/aaaa).',
        'Obras sociales: CRUD shared with the booking page via the MockStore (localStorage).'
      ],
      faked: [
        'All data is the in-browser MockStore. Real app uses React Query against /api/admin/* (appointments, profile, work-schedule, unavailable-days, calendar, health-insurance).',
        'Provider cancel has no 24h restriction in the real dashboard (the patient confirmation page does).'
      ]
    });
    refreshIcons();
  });
})();
