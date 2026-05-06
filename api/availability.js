import { getCalendarClient, calendarId, timezone } from './_google.js';

const DEFAULT_DURATION = 30;
const DAYS_AHEAD = 21;
const SLOT_STEP_MINUTES = 15;
const BUFFER_MINUTES = 15;
const MIN_NOTICE_HOURS = 12;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function getBusinessHours(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return null;
  // Lun-Ven : 09h30-12h30 / 14h00-18h00, mercredi après-midi fermé par défaut
  if (day === 3) return [{ start: '09:30', end: '12:30' }];
  return [
    { start: '09:30', end: '12:30' },
    { start: '14:00', end: '18:00' }
  ];
}

function parseTimeOnDate(date, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function overlaps(start, end, busyStart, busyEnd) {
  return start < busyEnd && end > busyStart;
}

function formatSlot(date) {
  return {
    iso: date.toISOString(),
    label: new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: timezone
    }).format(date)
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Méthode non autorisée' });

  try {
    const duration = Number(req.query.duration || DEFAULT_DURATION);
    const now = new Date();
    const earliest = new Date(now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000);
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString();

    const calendar = getCalendarClient();
    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: timezone,
        items: [{ id: calendarId }]
      }
    });

    const busy = (freebusy.data.calendars?.[calendarId]?.busy || []).map(b => ({
      start: new Date(new Date(b.start).getTime() - BUFFER_MINUTES * 60000),
      end: new Date(new Date(b.end).getTime() + BUFFER_MINUTES * 60000)
    }));

    const slots = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() + i);
      const ranges = getBusinessHours(day);
      if (!ranges) continue;

      for (const range of ranges) {
        let cursor = parseTimeOnDate(day, range.start);
        const rangeEnd = parseTimeOnDate(day, range.end);
        while (cursor.getTime() + duration * 60000 <= rangeEnd.getTime()) {
          const slotStart = new Date(cursor);
          const slotEnd = new Date(cursor.getTime() + duration * 60000);
          const isFutureEnough = slotStart >= earliest;
          const isBusy = busy.some(b => overlaps(slotStart, slotEnd, b.start, b.end));
          if (isFutureEnough && !isBusy) slots.push(formatSlot(slotStart));
          cursor = new Date(cursor.getTime() + SLOT_STEP_MINUTES * 60000);
        }
      }
    }

    return json(res, 200, { timezone, duration, slots: slots.slice(0, 80) });
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
}
