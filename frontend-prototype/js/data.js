/*
 * Shared mock data store for the Maraflamini frontend prototype.
 *
 * No backend: data lives in localStorage when available, otherwise in an
 * in-memory fallback so the prototype also works from file://.
 * Exposed globally as window.MockStore.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'maraflamini_prototype_v1';

  // --- storage helpers (localStorage with in-memory fallback) ---------------
  var memoryFallback = {};
  var canUseStorage = (function () {
    try {
      var t = '__t__';
      window.localStorage.setItem(t, t);
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  })();

  function rawGet(key) {
    if (canUseStorage) return window.localStorage.getItem(key);
    return Object.prototype.hasOwnProperty.call(memoryFallback, key) ? memoryFallback[key] : null;
  }

  function rawSet(key, value) {
    if (canUseStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryFallback[key] = value;
    }
  }

  // --- date helpers ---------------------------------------------------------
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function toISODate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  // --- default seed data ----------------------------------------------------
  function defaultState() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var d1 = toISODate(today);
    var d2 = toISODate(addDays(today, 1));
    var d3 = toISODate(addDays(today, 3));
    var dPast = toISODate(addDays(today, -5));

    return {
      profile: {
        id: 1,
        email: 'mara.flamini@example.com',
        username: 'maraflamini',
        first_name: 'Mara',
        last_name: 'Flamini',
        whatsapp_phone_number: '+543421234567',
        email_verified: true,
        created_at: '2024-01-15T10:00:00.000Z'
      },

      // matches the Appointment interface from the real dashboard
      appointments: [
        {
          id: 1,
          patient_name: 'Lucía Gómez',
          patient_phone: '3421112233',
          appointment_date: d1,
          appointment_time: '09:30',
          visit_type: 'Consulta',
          consult_type: 'Primera vez',
          practice_type: null,
          health_insurance: 'OSDE',
          status: 'scheduled',
          whatsapp_sent: true,
          whatsapp_sent_at: '2024-06-01T12:00:00.000Z',
          whatsapp_message_id: 'wamid.demo1',
          created_at: '2024-06-01T11:55:00.000Z'
        },
        {
          id: 2,
          patient_name: 'Martín Pérez',
          patient_phone: '3424445566',
          appointment_date: d1,
          appointment_time: '10:00',
          visit_type: 'Consulta',
          consult_type: 'Seguimiento',
          practice_type: null,
          health_insurance: 'Swiss Medical',
          status: 'scheduled',
          whatsapp_sent: true,
          whatsapp_sent_at: null,
          whatsapp_message_id: 'wamid.demo2',
          created_at: '2024-06-02T09:10:00.000Z'
        },
        {
          id: 3,
          patient_name: 'Carla Ruiz',
          patient_phone: '3427778899',
          appointment_date: d2,
          appointment_time: '11:30',
          visit_type: 'Práctica',
          consult_type: null,
          practice_type: 'Criocirugía',
          health_insurance: 'Practica Particular',
          status: 'scheduled',
          whatsapp_sent: false,
          whatsapp_sent_at: null,
          whatsapp_message_id: null,
          created_at: '2024-06-03T15:20:00.000Z'
        },
        {
          id: 4,
          patient_name: 'Diego Fernández',
          patient_phone: '3421231231',
          appointment_date: d3,
          appointment_time: '16:00',
          visit_type: 'Consulta',
          consult_type: 'Primera vez',
          practice_type: null,
          health_insurance: 'Particular',
          status: 'scheduled',
          whatsapp_sent: false,
          whatsapp_sent_at: null,
          whatsapp_message_id: null,
          created_at: '2024-06-04T08:00:00.000Z'
        },
        {
          id: 5,
          patient_name: 'Ana Torres',
          patient_phone: '3429998877',
          appointment_date: dPast,
          appointment_time: '12:00',
          visit_type: 'Consulta',
          consult_type: 'Seguimiento',
          practice_type: null,
          health_insurance: 'OSDE',
          status: 'completed',
          whatsapp_sent: true,
          whatsapp_sent_at: '2024-05-20T10:00:00.000Z',
          whatsapp_message_id: 'wamid.demo5',
          created_at: '2024-05-19T10:00:00.000Z'
        }
      ],

      // 7 days; values mirror DAYS_OF_WEEK in the real app
      workSchedule: [
        { day_of_week: 'Monday', is_working_day: true, available_slots: [
          { id: 101, start_time: '09:00', end_time: '13:00', is_available: true },
          { id: 102, start_time: '16:00', end_time: '19:00', is_available: true }
        ] },
        { day_of_week: 'Tuesday', is_working_day: true, available_slots: [
          { id: 103, start_time: '09:00', end_time: '13:00', is_available: true }
        ] },
        { day_of_week: 'Wednesday', is_working_day: true, available_slots: [
          { id: 104, start_time: '14:00', end_time: '19:00', is_available: true }
        ] },
        { day_of_week: 'Thursday', is_working_day: true, available_slots: [
          { id: 105, start_time: '09:00', end_time: '13:00', is_available: true }
        ] },
        { day_of_week: 'Friday', is_working_day: true, available_slots: [
          { id: 106, start_time: '09:00', end_time: '12:00', is_available: true }
        ] },
        { day_of_week: 'Saturday', is_working_day: false, available_slots: [] },
        { day_of_week: 'Sunday', is_working_day: false, available_slots: [] }
      ],

      unavailableDays: [
        { id: 201, date: toISODate(addDays(today, 7)), is_confirmed: true, created_at: '2024-06-01T00:00:00.000Z' }
      ],

      healthInsurances: [
        { id: 1, name: 'OSDE', price: '$25.000', notes: '' },
        { id: 2, name: 'Swiss Medical', price: '$25.000', notes: '' },
        { id: 3, name: 'Galeno', price: '$22.000', notes: 'excepto plan azul' },
        { id: 4, name: 'Particular', price: '$30.000', notes: 'Consulta particular' },
        { id: 5, name: 'Practica Particular', price: '$35.000', notes: 'Requiere seña' }
      ],

      // simple incrementing counters for new records
      counters: { appointment: 6, slot: 300, unavailable: 300, insurance: 6 }
    };
  }

  // --- state load/save ------------------------------------------------------
  var state = null;

  function load() {
    if (state) return state;
    var raw = rawGet(STORAGE_KEY);
    if (raw) {
      try {
        state = JSON.parse(raw);
        return state;
      } catch (e) {
        // corrupt -> reseed
      }
    }
    state = defaultState();
    save();
    return state;
  }

  function save() {
    rawSet(STORAGE_KEY, JSON.stringify(state));
  }

  function nextId(kind) {
    load();
    var v = state.counters[kind] || 1;
    state.counters[kind] = v + 1;
    return v;
  }

  // --- public API -----------------------------------------------------------
  var MockStore = {
    // expose helpers used by pages
    toISODate: toISODate,
    pad: pad,

    reset: function () {
      state = defaultState();
      save();
    },

    getProfile: function () {
      return load().profile;
    },
    updateProfile: function (patch) {
      load();
      Object.assign(state.profile, patch);
      save();
      return state.profile;
    },

    getAppointments: function () {
      return load().appointments;
    },
    addAppointment: function (apt) {
      load();
      apt.id = nextId('appointment');
      apt.status = apt.status || 'scheduled';
      apt.whatsapp_sent = false;
      apt.whatsapp_sent_at = null;
      apt.whatsapp_message_id = null;
      apt.created_at = new Date().toISOString();
      state.appointments.push(apt);
      save();
      return apt;
    },
    cancelAppointment: function (id) {
      load();
      var apt = state.appointments.find(function (a) { return a.id === id; });
      if (apt) {
        apt.status = 'cancelled';
        save();
      }
      return apt;
    },

    getWorkSchedule: function () {
      return load().workSchedule;
    },
    setWorkingDay: function (dayValue, isWorking) {
      load();
      var day = state.workSchedule.find(function (d) { return d.day_of_week === dayValue; });
      if (day) { day.is_working_day = isWorking; save(); }
      return day;
    },
    addSlot: function (dayValue, slot) {
      load();
      var day = state.workSchedule.find(function (d) { return d.day_of_week === dayValue; });
      if (day) {
        slot.id = nextId('slot');
        slot.is_available = true;
        day.available_slots.push(slot);
        save();
      }
      return day;
    },
    removeSlot: function (slotId) {
      load();
      state.workSchedule.forEach(function (d) {
        d.available_slots = d.available_slots.filter(function (s) { return s.id !== slotId; });
      });
      save();
    },

    getUnavailableDays: function () {
      return load().unavailableDays;
    },
    addUnavailableDay: function (isoDate) {
      load();
      var entry = { id: nextId('unavailable'), date: isoDate, is_confirmed: true, created_at: new Date().toISOString() };
      state.unavailableDays.push(entry);
      save();
      return entry;
    },
    removeUnavailableDay: function (id) {
      load();
      state.unavailableDays = state.unavailableDays.filter(function (d) { return d.id !== id; });
      save();
    },

    getHealthInsurances: function () {
      return load().healthInsurances;
    },
    addHealthInsurance: function (item) {
      load();
      item.id = nextId('insurance');
      state.healthInsurances.push(item);
      save();
      return item;
    },
    updateHealthInsurance: function (currentName, patch) {
      load();
      var item = state.healthInsurances.find(function (i) { return i.name === currentName; });
      if (item) { Object.assign(item, patch); save(); }
      return item;
    },
    removeHealthInsurance: function (name) {
      load();
      state.healthInsurances = state.healthInsurances.filter(function (i) { return i.name !== name; });
      save();
    },

    // Mock available times for a given ISO date, derived from the work schedule
    // of that weekday. Already-booked times are removed.
    availableTimesFor: function (isoDate) {
      load();
      var date = new Date(isoDate + 'T00:00:00');
      var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var dayName = names[date.getDay()];
      var day = state.workSchedule.find(function (d) { return d.day_of_week === dayName; });
      if (!day || !day.is_working_day) return [];

      // expand each slot into 20-minute steps (matches the real
      // generateTimeSlots() in app/api/available-times/[date]/route.ts)
      var times = [];
      day.available_slots.forEach(function (slot) {
        var start = slot.start_time.split(':').map(Number);
        var end = slot.end_time.split(':').map(Number);
        var cur = start[0] * 60 + start[1];
        var stop = end[0] * 60 + end[1];
        while (cur < stop) {
          times.push(pad(Math.floor(cur / 60)) + ':' + pad(cur % 60));
          cur += 20;
        }
      });

      // remove times already booked (scheduled) that day
      var booked = state.appointments
        .filter(function (a) { return a.appointment_date === isoDate && a.status === 'scheduled'; })
        .map(function (a) { return a.appointment_time; });

      return times.filter(function (t) { return booked.indexOf(t) === -1; });
    }
  };

  window.MockStore = MockStore;
})();
