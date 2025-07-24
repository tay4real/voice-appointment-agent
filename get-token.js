const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'your_google_client_id';
const CLIENT_SECRET = 'your_google_client_secret';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate the auth URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
});

console.log('Authorize this app by visiting this URL:\n', authUrl);

// Get authorization code from the user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question('\nEnter the code from that page here: ', async (code) => {
  rl.close();
  const { tokens } = await oAuth2Client.getToken(code);
  console.log('\n✅ Your refresh token:\n', tokens.refresh_token);
});
