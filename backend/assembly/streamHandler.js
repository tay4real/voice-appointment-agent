const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parseIntent } = require('../openai/intentParser');
const { scheduleAppointment } = require('../google/calender');

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

async function handleStream(filePath) {
  const uploadRes = await axios({
    method: 'post',
    url: 'https://api.assemblyai.com/v2/upload',
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      'transfer-encoding': 'chunked',
    },
    data: fs.createReadStream(filePath),
  });

  const audioUrl = uploadRes.data.upload_url;

  const transcriptRes = await axios({
    method: 'post',
    url: 'https://api.assemblyai.com/v2/transcript',
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      'content-type': 'application/json',
    },
    data: {
      audio_url: audioUrl,
      speaker_labels: false,
      auto_chapters: false,
      punctuate: true,
    },
  });

  const transcriptId = transcriptRes.data.id;

  let transcriptCompleted = false;
  let transcriptText = '';

  while (!transcriptCompleted) {
    const pollingRes = await axios({
      method: 'get',
      url: `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
    });

    if (pollingRes.data.status === 'completed') {
      transcriptCompleted = true;
      transcriptText = pollingRes.data.text;
    } else if (pollingRes.data.status === 'error') {
      throw new Error('Transcription failed: ' + pollingRes.data.error);
    } else {
      await new Promise((res) => setTimeout(res, 2000)); // Wait before polling again
    }
  }

  // Parse intent using OpenAI
  const intent = await parseIntent(transcriptText);

  // Schedule appointment if intent is valid
  let calendarResponse = {
    message: 'Could not extract valid appointment details.',
  };
  if (intent?.dateTime && intent?.summary) {
    calendarResponse = await scheduleAppointment(
      intent.dateTime,
      intent.summary
    );
  }

  return {
    transcript: transcriptText,
    calendarResponse,
  };
}

module.exports = { handleStream };
