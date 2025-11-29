const express = require('express');
const twilio = require('twilio');
const { OpenAI } = require('openai');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const calendar = google.calendar({ version: 'v3', auth: new google.auth.GoogleAuth({ keyFile: process.env.GOOGLE_CREDS, scopes: ['https://www.googleapis.com/auth/calendar'] }) });

const leadStore = [];

const sendSMS = async (to, body) => await twilioClient.messages.create({ from: process.env.TWILIO_FROM, to, body });

const getAIResponse = async (history) => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: 'You are a roofing assistant. Acknowledge leads warmly. Ask ONE qualifying question: address, roof type, or availability. If customer gives availability, respond with ONLY: BOOK|day|time (e.g., BOOK|tomorrow|2pm). If unsure, say ESCALATE.' }, ...history],
    max_tokens: 150
  });
  return res.choices[0].message.content;
};

const bookCalendar = async (date) => {
  const start = new Date(date); start.setHours(10, 0, 0);
  const end = new Date(date); end.setHours(16, 0, 0);
  const events = await calendar.events.list({ calendarId: process.env.CALENDAR_ID, timeMin: start.toISOString(), timeMax: end.toISOString(), singleEvents: true });
  if (events.data.items.length === 0) {
    const slot = new Date(start); slot.setHours(10, 0);
    const slotEnd = new Date(slot); slotEnd.setHours(11, 0);
    await calendar.events.insert({ calendarId: process.env.CALENDAR_ID, resource: { summary: 'Roof Inspection', start: { dateTime: slot.toISOString() }, end: { dateTime: slotEnd.toISOString() } } });
    return slot.toLocaleString();
  }
  return null;
};

app.post('/lead', async (req, res) => {
  const { phone, name, message } = req.body;
  const lead = { phone, name, history: [{ role: 'user', content: message }], needsHuman: false };
  leadStore.push(lead);
  const aiMsg = await getAIResponse(lead.history);
  lead.history.push({ role: 'assistant', content: aiMsg });
  if (aiMsg.includes('ESCALATE')) lead.needsHuman = true;
  await sendSMS(phone, aiMsg.replace('ESCALATE', 'Let me connect you with our team.'));
  res.json({ status: 'ok', leadId: leadStore.length - 1 });
});

app.post('/sms', async (req, res) => {
  const { From, Body } = req.body;
  const lead = leadStore.find(l => l.phone === From);
  if (!lead) return res.send('<Response></Response>');
  lead.history.push({ role: 'user', content: Body });
  const aiMsg = await getAIResponse(lead.history);
  lead.history.push({ role: 'assistant', content: aiMsg });
  if (aiMsg.includes('ESCALATE')) { lead.needsHuman = true; await sendSMS(From, 'Let me connect you with our team.'); }
  else if (aiMsg.startsWith('BOOK|')) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const slot = await bookCalendar(tomorrow);
    const msg = slot ? `✅ Appointment booked for ${slot}!` : 'No slots available tomorrow. How about next week?';
    await sendSMS(From, msg);
    if (slot) await sendSMS(process.env.OWNER_PHONE, `New booking: ${lead.name} at ${slot}`);
  } else await sendSMS(From, aiMsg);
  res.send('<Response></Response>');
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 PrimusInsights running'));
