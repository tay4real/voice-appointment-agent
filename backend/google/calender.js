const { google } = require('googleapis');
const dayjs = require('dayjs');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client,
});

async function scheduleAppointment(intent) {
  const { intent: action, date, time, with: attendee } = intent;

  if (!date || !time || !attendee) {
    throw new Error('Missing one or more required fields for scheduling');
  }

  const start = dayjs(`${date}T${time}`);
  const end = start.add(30, 'minute'); // default to 30 minutes

  const event = {
    summary: `Meeting with ${attendee}`,
    description: `Scheduled via Voice Agent.`,
    start: {
      dateTime: start.toISOString(),
      timeZone: 'Africa/Lagos',
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: 'Africa/Lagos',
    },
  };

  try {
    if (action === 'book') {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return {
        status: 'success',
        message: `Appointment booked with ${attendee} on ${date} at ${time}`,
        eventId: response.data.htmlLink,
      };
    } else {
      return {
        status: 'ignored',
        message: 'Only booking is implemented for now.',
      };
    }
  } catch (error) {
    console.error('Error scheduling appointment:', error.message);
    throw new Error('Failed to book appointment');
  }
}

module.exports = { scheduleAppointment };
