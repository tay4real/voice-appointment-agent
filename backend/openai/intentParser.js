const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Uses OpenAI to parse appointment intent from transcript
 * @param {string} transcript
 * @returns {Promise<Object>} intent
 */
async function parseIntent(transcript) {
  const systemPrompt = `
You are an AI that extracts appointment-related intents from transcriptions.

You must respond ONLY in this JSON format:
{
  "intent": "book" | "cancel" | "reschedule",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "with": "Person or Entity Name"
}

If any field is missing, set it to null.
`;

  const userPrompt = `Transcript: """${transcript}"""`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  });

  try {
    const reply = completion.choices[0].message.content;
    const parsed = JSON.parse(reply);
    return parsed;
  } catch (err) {
    throw new Error('Failed to parse OpenAI response');
  }
}

module.exports = { parseIntent };
