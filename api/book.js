import { getCalendarClient, calendarId, timezone } from './_google.js';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function sanitize(value) {
  return String(value || '').replace(/[<>]/g, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Méthode non autorisée' });

  try {
    const body = req.body || {};
    const startIso = sanitize(body.slotIso);
    const duration = Number(body.duration || 30);
    const email = sanitize(body.email);
    const phone = sanitize(body.phone);
    const name = sanitize(body.name);
    const company = sanitize(body.company);
    const siren = sanitize(body.siren);
    const reason = sanitize(body.reason);
    const meetingLabel = sanitize(body.meetingLabel || 'Rendez-vous');
    const answers = body.answers || {};

    if (!startIso || !email || !name || !reason) {
      return json(res, 400, { error: 'Nom, email, motif et créneau sont obligatoires.' });
    }

    const start = new Date(startIso);
    const end = new Date(start.getTime() + duration * 60000);
    if (Number.isNaN(start.getTime())) return json(res, 400, { error: 'Créneau invalide.' });

    const description = [
      `Demande de rendez-vous via le formulaire en ligne.`,
      ``,
      `Nom : ${name}`,
      `Email : ${email}`,
      `Téléphone : ${phone}`,
      `Société : ${company}`,
      `SIREN : ${siren}`,
      `Motif : ${reason}`,
      ``,
      `Questionnaire :`,
      ...Object.entries(answers).map(([k, v]) => `- ${k} : ${Array.isArray(v) ? v.join(', ') : v}`)
    ].join('\n');

    const calendar = getCalendarClient();
    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: {
        summary: `${meetingLabel} - ${name}`,
        description,
        start: { dateTime: start.toISOString(), timeZone: timezone },
        end: { dateTime: end.toISOString(), timeZone: timezone },
        attendees: [{ email, displayName: name }],
        conferenceData: {
          createRequest: {
            requestId: `rdv-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      }
    });

    return json(res, 200, { ok: true, htmlLink: event.data.htmlLink, meet: event.data.hangoutLink || null });
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
}
