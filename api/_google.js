import { google } from 'googleapis';

export function getCalendarClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/^"|"$/g, '');

  if (!clientEmail || !privateKey) {
    throw new Error('Configuration Google manquante. Vérifie GOOGLE_CLIENT_EMAIL et GOOGLE_PRIVATE_KEY.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  return google.calendar({ version: 'v3', auth });
}

export const calendarId = process.env.GOOGLE_CALENDAR_ID || 'sylvie@amg2l.com';
export const timezone = process.env.BOOKING_TIMEZONE || 'Europe/Paris';
